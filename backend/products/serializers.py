from rest_framework import serializers
from .models import Brand, PrinterModel, Category, Product, Banner

class BrandSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    printers_count = serializers.SerializerMethodField()
    parts_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'description', 'logo_url', 'printers_count', 'parts_count']

    def get_printers_count(self, obj):
        return obj.printers.count()

    def get_parts_count(self, obj):
        return obj.spare_parts.count()

    def create(self, validated_data):
        if not validated_data.get('slug'):
            from django.utils.text import slugify
            base_slug = slugify(validated_data.get('name', 'brand')) or 'brand'
            candidate = base_slug
            idx = 1
            while Brand.objects.filter(slug=candidate).exists():
                candidate = f"{base_slug}-{idx}"
                idx += 1
            validated_data['slug'] = candidate
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'name' in validated_data and not validated_data.get('slug'):
            from django.utils.text import slugify
            base_slug = slugify(validated_data['name']) or instance.slug
            if base_slug != instance.slug:
                candidate = base_slug
                idx = 1
                while Brand.objects.filter(slug=candidate).exclude(id=instance.id).exists():
                    candidate = f"{base_slug}-{idx}"
                    idx += 1
                validated_data['slug'] = candidate
        return super().update(instance, validated_data)


class PrinterModelSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    slug = serializers.SlugField(required=False, allow_blank=True)
    compatible_parts_count = serializers.SerializerMethodField()

    class Meta:
        model = PrinterModel
        fields = ['id', 'name', 'slug', 'brand', 'brand_name', 'technology', 'image_url', 'compatible_parts_count']

    def get_compatible_parts_count(self, obj):
        return obj.compatible_parts.count()

    def create(self, validated_data):
        if not validated_data.get('slug'):
            from django.utils.text import slugify
            brand_prefix = slugify(validated_data['brand'].name) if 'brand' in validated_data else ''
            base_slug = slugify(validated_data.get('name', 'model')) or 'model'
            full_slug = f"{brand_prefix}-{base_slug}" if brand_prefix else base_slug
            candidate = full_slug
            idx = 1
            while PrinterModel.objects.filter(slug=candidate).exists():
                candidate = f"{full_slug}-{idx}"
                idx += 1
            validated_data['slug'] = candidate
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if ('name' in validated_data or 'brand' in validated_data) and not validated_data.get('slug'):
            from django.utils.text import slugify
            brand_obj = validated_data.get('brand', instance.brand)
            brand_prefix = slugify(brand_obj.name) if brand_obj else ''
            base_slug = slugify(validated_data.get('name', instance.name)) or 'model'
            full_slug = f"{brand_prefix}-{base_slug}" if brand_prefix else base_slug
            if full_slug != instance.slug:
                candidate = full_slug
                idx = 1
                while PrinterModel.objects.filter(slug=candidate).exclude(id=instance.id).exists():
                    candidate = f"{full_slug}-{idx}"
                    idx += 1
                validated_data['slug'] = candidate
        return super().update(instance, validated_data)

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    slug = serializers.SlugField(required=False, allow_blank=True)
    icon_name = serializers.CharField(required=False, default='Tool')
    description_en = serializers.CharField(required=False, allow_blank=True, default='')
    description_ar = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Category
        fields = ['id', 'name_en', 'name_ar', 'slug', 'icon_name', 'description_en', 'description_ar', 'products_count']

    def get_products_count(self, obj):
        return obj.products.count()

    def create(self, validated_data):
        if not validated_data.get('slug'):
            from django.utils.text import slugify
            base_slug = slugify(validated_data.get('name_en', 'category')) or 'cat'
            candidate = base_slug
            idx = 1
            while Category.objects.filter(slug=candidate).exists():
                candidate = f"{base_slug}-{idx}"
                idx += 1
            validated_data['slug'] = candidate
        return super().create(validated_data)

class ProductListSerializer(serializers.ModelSerializer):
    category_name_en = serializers.CharField(source='category.name_en', read_only=True)
    category_name_ar = serializers.CharField(source='category.name_ar', read_only=True)
    compatible_printers_list = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name_en', 'name_ar', 'slug', 'category', 'category_name_en', 'category_name_ar',
            'sku', 'price', 'original_price', 'stock_quantity',
            'description_en', 'description_ar', 'specifications',
            'image_url', 'images', 'has_variants', 'variants', 'rating', 'reviews_count', 'is_featured', 'is_universal',
            'is_deal', 'deal_discount_percentage', 'deal_description', 'deal_end_date',
            'compatible_printers_list', 'created_at'
        ]

    def get_images(self, obj):
        if obj.images and isinstance(obj.images, list) and len(obj.images) > 0:
            return obj.images
        return [obj.image_url] if obj.image_url else []

    def get_compatible_printers_list(self, obj):
        return [f"{p.brand.name} {p.name}" for p in obj.compatible_printers.all()[:4]]

class ProductDetailSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False)
    compatible_printers = PrinterModelSerializer(many=True, read_only=True)
    compatible_brands = BrandSerializer(many=True, read_only=True)
    slug = serializers.SlugField(max_length=220, required=False, allow_blank=True)
    sku = serializers.CharField(max_length=50, required=False, allow_blank=True)
    description_en = serializers.CharField(required=False, allow_blank=True, default='')
    description_ar = serializers.CharField(required=False, allow_blank=True, default='')
    image_url = serializers.CharField(max_length=500, required=False, allow_blank=True)
    images = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        default=list
    )
    variants = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )

    class Meta:
        model = Product
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.category:
            rep['category'] = CategorySerializer(instance.category).data
            rep['category_id'] = instance.category.id
        if not rep.get('images'):
            rep['images'] = [instance.image_url] if instance.image_url else []
        if not rep.get('variants'):
            rep['variants'] = []
        return rep

    def create(self, validated_data):
        from django.utils.text import slugify
        from django.utils.crypto import get_random_string

        # Auto-fallback category
        if not validated_data.get('category'):
            first_cat = Category.objects.first()
            if first_cat:
                validated_data['category'] = first_cat

        # Auto-ensure unique SKU
        sku = (validated_data.get('sku') or '').strip()
        if not sku:
            sku = f"SKU-{get_random_string(6).upper()}"
        base_sku = sku
        idx = 1
        while Product.objects.filter(sku=sku).exists():
            sku = f"{base_sku[:40]}-{idx}"
            idx += 1
        validated_data['sku'] = sku

        # Auto-ensure unique Slug
        slug = (validated_data.get('slug') or '').strip()
        if not slug:
            name = validated_data.get('name_en') or validated_data.get('name_ar') or 'product'
            slug = slugify(name) or f"prod-{get_random_string(6).lower()}"
        base_slug = slug
        idx = 1
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base_slug[:180]}-{idx}"
            idx += 1
        validated_data['slug'] = slug

        images = validated_data.get('images', [])
        image_url = validated_data.get('image_url')
        if not image_url and images:
            validated_data['image_url'] = images[0]
        elif image_url and not images:
            validated_data['images'] = [image_url]

        variants = validated_data.get('variants', [])
        if variants and len(variants) > 0:
            validated_data['has_variants'] = True

        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.utils.text import slugify
        if 'sku' in validated_data:
            sku = (validated_data.get('sku') or '').strip()
            if not sku:
                sku = instance.sku
            base_sku = sku
            idx = 1
            while Product.objects.filter(sku=sku).exclude(id=instance.id).exists():
                sku = f"{base_sku[:40]}-{idx}"
                idx += 1
            validated_data['sku'] = sku

        if 'slug' in validated_data and validated_data['slug']:
            slug = validated_data['slug'].strip()
            base_slug = slug
            idx = 1
            while Product.objects.filter(slug=slug).exclude(id=instance.id).exists():
                slug = f"{base_slug[:180]}-{idx}"
                idx += 1
            validated_data['slug'] = slug

        images = validated_data.get('images')
        if images is not None:
            validated_data['images'] = images
            if 'image_url' not in validated_data and len(images) > 0:
                validated_data['image_url'] = images[0]

        variants = validated_data.get('variants')
        if variants is not None:
            validated_data['variants'] = variants
            validated_data['has_variants'] = len(variants) > 0

        return super().update(instance, validated_data)


class BannerSerializer(serializers.ModelSerializer):
    image_url = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Banner
        fields = ['id', 'title', 'image', 'image_url', 'order', 'is_active', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                ret['image_url'] = request.build_absolute_uri(instance.image.url)
            else:
                ret['image_url'] = instance.image.url
        elif not ret.get('image_url'):
            ret['image_url'] = instance.image_url or ''
        return ret



