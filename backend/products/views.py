import os
import uuid
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.files.storage import default_storage
from django.utils.text import get_valid_filename
from django.db import connection
from django.db.models import Sum, Count, Q
from django.conf import settings
from .models import Brand, PrinterModel, Category, Product, Banner
from orders.models import Order, OrderItem
from .serializers import (
    BrandSerializer, PrinterModelSerializer,
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    BannerSerializer
)
from accounts.permissions import IsAdminOrReadOnly, IsAdminOrStaff

class BrandViewSet(viewsets.ModelViewSet):
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None

    def get_queryset(self):
        qs = Brand.objects.all().order_by('name')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return qs

class PrinterModelViewSet(viewsets.ModelViewSet):
    serializer_class = PrinterModelSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None

    def get_queryset(self):
        qs = PrinterModel.objects.all().select_related('brand').order_by('brand__name', 'name')
        brand_id = self.request.query_params.get('brand')
        brand_slug = self.request.query_params.get('brand_slug')
        search = self.request.query_params.get('search')
        if brand_id:
            qs = qs.filter(brand_id=brand_id)
        elif brand_slug:
            qs = qs.filter(brand__slug=brand_slug)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(brand__name__icontains=search))
        return qs

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('id')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None

class ProductViewSet(viewsets.ModelViewSet):
    lookup_field = 'id'
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = Product.objects.all().select_related('category').prefetch_related('compatible_printers__brand', 'compatible_brands')
        
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)

        brand = self.request.query_params.get('brand')
        if brand:
            qs = qs.filter(compatible_brands__slug=brand).distinct()

        printer = self.request.query_params.get('printer')
        if printer:
            qs = qs.filter(compatible_printers__id=printer).distinct()

        search = (self.request.query_params.get('search') or '').strip()
        if search:
            raw_clean = search.replace('(', ' ').replace(')', ' ').replace('[', ' ').replace(']', ' ')
            words = [w.strip() for w in raw_clean.split() if w.strip()]
            exact_q = (
                Q(name_en__icontains=search) |
                Q(name_ar__icontains=search) |
                Q(sku__icontains=search) |
                Q(description_en__icontains=search) |
                Q(description_ar__icontains=search)
            )
            if len(words) > 1:
                multi_q = Q()
                for w in words:
                    multi_q &= (
                        Q(name_en__icontains=w) |
                        Q(name_ar__icontains=w) |
                        Q(sku__icontains=w) |
                        Q(description_en__icontains=w) |
                        Q(description_ar__icontains=w)
                    )
                qs = qs.filter(exact_q | multi_q).distinct()
            else:
                qs = qs.filter(exact_q).distinct()

        featured = self.request.query_params.get('featured')
        if featured and featured.lower() in ('true', '1'):
            qs = qs.filter(is_featured=True)

        deals = self.request.query_params.get('deals')
        if deals and deals.lower() in ('true', '1'):
            qs = qs.filter(is_deal=True)

        sort = self.request.query_params.get('sort')
        if sort == 'price_asc':
            qs = qs.order_by('price')
        elif sort == 'price_desc':
            qs = qs.order_by('-price')
        elif sort == 'rating':
            qs = qs.order_by('-rating')
        elif sort == 'discount_desc':
            qs = qs.order_by('-deal_discount_percentage', 'price')
        elif sort == 'stock_asc':
            qs = qs.order_by('stock_quantity')
        else:
            qs = qs.order_by('-created_at')

        return qs

    @action(detail=True, methods=['post'], url_path='toggle-deal', permission_classes=[IsAdminOrStaff])
    def toggle_deal(self, request, id=None):
        product = self.get_object()
        is_deal = request.data.get('is_deal')
        if is_deal is None:
            is_deal = not product.is_deal
        else:
            is_deal = bool(is_deal)

        discount = request.data.get('discount_percentage')
        deal_price = request.data.get('deal_price')
        deal_desc = request.data.get('deal_description', product.deal_description or '')

        product.is_deal = is_deal
        if product.is_deal:
            product.deal_description = deal_desc
            if deal_price is not None and str(deal_price).strip() != '':
                new_price = round(float(deal_price), 2)
                if not product.original_price or product.original_price <= product.price:
                    product.original_price = product.price
                orig = float(product.original_price)
                product.price = new_price
                if orig > 0 and orig > new_price:
                    product.deal_discount_percentage = max(1, round(((orig - new_price) / orig) * 100))
            elif discount is not None and str(discount).strip() != '':
                disc_pct = int(discount)
                product.deal_discount_percentage = disc_pct
                if disc_pct > 0:
                    if not product.original_price or product.original_price <= product.price:
                        product.original_price = product.price
                    orig = float(product.original_price)
                    product.price = round(orig * (1 - (disc_pct / 100.0)), 2)
        else:
            # Restore original price when removed from deals
            if product.original_price and product.original_price > product.price:
                product.price = product.original_price
            product.deal_discount_percentage = 0

        product.save()
        return Response(ProductDetailSerializer(product).data)

    @action(detail=False, methods=['post'], url_path='batch-deal', permission_classes=[IsAdminOrStaff])
    def batch_deal(self, request):
        product_ids = request.data.get('product_ids', [])
        is_deal = bool(request.data.get('is_deal', True))
        discount = request.data.get('discount_percentage', 20)
        deal_desc = request.data.get('deal_description', 'عرض حصري')

        updated_count = 0
        products = Product.objects.filter(id__in=product_ids)
        for product in products:
            product.is_deal = is_deal
            if is_deal:
                product.deal_description = deal_desc
                product.deal_discount_percentage = int(discount)
                if not product.original_price or product.original_price <= product.price:
                    product.original_price = product.price
                orig = float(product.original_price)
                product.price = round(orig * (1 - (int(discount) / 100.0)), 2)
            else:
                if product.original_price and product.original_price > product.price:
                    product.price = product.original_price
                product.deal_discount_percentage = 0
            product.save()
            updated_count += 1

        return Response({
            'success': True,
            'updated_count': updated_count,
            'message': f'تم تحديث {updated_count} منتج بنجاح.'
        })

class AdminDashboardStatsView(APIView):
    """
    Returns aggregated KPIs, chart breakdowns, low-stock warnings,
    and recent activity for the custom React Admin Dashboard.
    """
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        total_revenue = Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        total_orders = Order.objects.count()
        total_products = Product.objects.count()
        low_stock_products = Product.objects.filter(stock_quantity__lte=15).count()
        
        # Order statuses breakdown
        status_counts = {
            'PENDING': Order.objects.filter(status='PENDING').count(),
            'PROCESSING': Order.objects.filter(status='PROCESSING').count(),
            'SHIPPED': Order.objects.filter(status='SHIPPED').count(),
            'DELIVERED': Order.objects.filter(status='DELIVERED').count(),
            'CANCELLED': Order.objects.filter(status='CANCELLED').count(),
        }

        # Categories with count and product list
        categories_data = []
        for cat in Category.objects.all():
            prod_count = cat.products.count()
            categories_data.append({
                'name_en': cat.name_en,
                'name_ar': cat.name_ar,
                'slug': cat.slug,
                'count': prod_count,
            })

        # Recent 5 Orders
        recent_orders = []
        for o in Order.objects.all().order_by('-created_at')[:6]:
            recent_orders.append({
                'id': o.id,
                'order_number': o.order_number,
                'customer_name': o.customer_name,
                'total_amount': float(o.total_amount),
                'status': o.status,
                'city': o.city,
                'created_at': o.created_at.strftime('%Y-%m-%d %H:%M'),
                'items_count': o.items.count()
            })

        # Top Low Stock Items for alerts
        low_stock_items = []
        for p in Product.objects.filter(stock_quantity__lte=20).order_by('stock_quantity')[:5]:
            low_stock_items.append({
                'id': p.id,
                'name_en': p.name_en,
                'name_ar': p.name_ar,
                'sku': p.sku,
                'stock': p.stock_quantity,
                'price': float(p.price)
            })

        return Response({
            'kpis': {
                'total_revenue': float(total_revenue),
                'total_orders': total_orders,
                'total_products': total_products,
                'total_brands': Brand.objects.count(),
                'total_printers': PrinterModel.objects.count(),
                'total_categories': Category.objects.count(),
                'low_stock_count': low_stock_products,
                'avg_order_value': float(total_revenue / total_orders) if total_orders > 0 else 0
            },
            'status_distribution': status_counts,
            'category_distribution': categories_data,
            'recent_orders': recent_orders,
            'low_stock_alerts': low_stock_items
        })

class CustomerListView(APIView):
    """
    Returns aggregated customer list with order counts and total spent.
    Restricted strictly to authenticated Staff / Admin users.
    """
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        # Group by customer_phone or customer_name
        customers_map = {}
        for o in Order.objects.all().order_by('-created_at'):
            key = o.customer_phone or o.customer_email or o.customer_name
            if key not in customers_map:
                customers_map[key] = {
                    'name': o.customer_name,
                    'phone': o.customer_phone,
                    'email': o.customer_email,
                    'city': o.city,
                    'orders_count': 1,
                    'total_spent': float(o.total_amount),
                    'last_order_date': o.created_at.strftime('%Y-%m-%d')
                }
            else:
                customers_map[key]['orders_count'] += 1
                customers_map[key]['total_spent'] += float(o.total_amount)

        return Response(list(customers_map.values()))

class SystemStatusView(APIView):
    """
    Safe health check endpoint. Conceals internal database connection strings,
    filenames, and hosts from unauthorized disclosure.
    """
    def get(self, request):
        db_engine = connection.settings_dict.get('ENGINE', '')
        if 'postgresql' in db_engine:
            active_db = 'PostgreSQL'
            mode = 'Production'
        elif 'sqlite3' in db_engine:
            active_db = 'SQLite'
            mode = 'Development'
        else:
            active_db = db_engine.split('.')[-1]
            mode = settings.ENVIRONMENT.title()

        payload = {
            'status': 'online',
            'api': 'Django REST Framework',
            'environment': settings.ENVIRONMENT,
            'database': {
                'engine': active_db,
                'mode': mode,
                'connected': True
            },
            'counts': {
                'products': Product.objects.count(),
                'categories': Category.objects.count(),
                'brands': Brand.objects.count(),
                'printer_models': PrinterModel.objects.count(),
            }
        }

        # If user is staff, provide extended diagnostics safely
        if request.user and request.user.is_authenticated and request.user.is_staff:
            payload['counts']['orders'] = Order.objects.count()
            payload['debug'] = settings.DEBUG

        return Response(payload)

def is_valid_image_file(uploaded_file):
    """
    Validates file extension and binary magic bytes to prevent shell or script upload.
    Disallows SVGs to prevent stored XSS attacks.
    """
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    if ext not in allowed_extensions:
        return False, f"نوع الملف {ext} غير مدعوم. الصيغ المسموحة: JPG, PNG, WEBP, GIF"

    # Read first 32 bytes for magic bytes header inspection
    uploaded_file.seek(0)
    header = uploaded_file.read(32)
    uploaded_file.seek(0)

    # Magic numbers:
    # JPEG: FF D8 FF
    # PNG: 89 50 4E 47 0D 0A 1A 0A
    # GIF: 47 49 46 38
    # WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
    is_jpeg = header.startswith(b'\xff\xd8\xff')
    is_png = header.startswith(b'\x89PNG\r\n\x1a\n')
    is_gif = header.startswith(b'GIF87a') or header.startswith(b'GIF89a')
    is_webp = header.startswith(b'RIFF') and b'WEBP' in header[:16]

    if not (is_jpeg or is_png or is_gif or is_webp):
        return False, "محتوى الملف لا يطابق ملف صورة حقيقي وصالح."

    return True, None

class ImageUploadView(APIView):
    """
    Handles uploading product images securely.
    Protected: Only staff/admin can upload images.
    Restricted to max 5MB and validated image signatures.
    """
    permission_classes = [IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        uploaded_files = request.FILES.getlist('images') or request.FILES.getlist('files')
        
        if not uploaded_files:
            single = request.FILES.get('image') or request.FILES.get('file')
            if single:
                uploaded_files = [single]

        if not uploaded_files:
            return Response({'error': 'لم يتم إرسال أي ملف صورة'}, status=status.HTTP_400_BAD_REQUEST)

        products_dir = os.path.join(settings.MEDIA_ROOT, 'products')
        os.makedirs(products_dir, exist_ok=True)

        saved_urls = []
        for uploaded_file in uploaded_files:
            # 5MB limit
            if uploaded_file.size > 5 * 1024 * 1024:
                return Response(
                    {'error': f'حجم الصورة {uploaded_file.name} كبير جداً (الحد الأقصى 5 ميغابايت)'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            valid, err_msg = is_valid_image_file(uploaded_file)
            if not valid:
                return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)

            ext = os.path.splitext(uploaded_file.name)[1].lower()
            raw_name = os.path.splitext(uploaded_file.name)[0]
            clean_name = get_valid_filename(raw_name)[:30] or 'product'
            unique_filename = f"{clean_name}_{uuid.uuid4().hex[:12]}{ext}"
            relative_path = os.path.join('products', unique_filename)

            saved_path = default_storage.save(relative_path, uploaded_file)
            media_url = settings.MEDIA_URL.rstrip('/') + '/' + saved_path.replace('\\', '/')
            absolute_url = request.build_absolute_uri(media_url)
            saved_urls.append(absolute_url)

        return Response({
            'success': True,
            'image_url': saved_urls[0] if saved_urls else '',
            'images': saved_urls,
            'count': len(saved_urls)
        }, status=status.HTTP_201_CREATED)


class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all().order_by('order', 'created_at')
    serializer_class = BannerSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = None

    def perform_destroy(self, instance):
        if instance.image:
            instance.image.delete(save=False)
        instance.delete()


