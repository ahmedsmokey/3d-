from django.contrib import admin
from .models import Brand, PrinterModel, Category, Product, Banner

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'order', 'is_active', 'created_at']
    list_editable = ['order', 'is_active']

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(PrinterModel)
class PrinterModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'technology']
    list_filter = ['brand', 'technology']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name_en', 'name_ar', 'slug', 'icon_name']
    prepopulated_fields = {'slug': ('name_en',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['sku', 'name_ar', 'name_en', 'category', 'price', 'original_price', 'is_deal', 'deal_discount_percentage', 'is_featured', 'stock_quantity']
    list_editable = ['is_deal', 'is_featured']
    list_filter = ['is_deal', 'is_featured', 'category', 'is_universal', 'compatible_brands']
    search_fields = ['name_en', 'name_ar', 'sku', 'description_en', 'description_ar']
    filter_horizontal = ['compatible_printers', 'compatible_brands']
    prepopulated_fields = {'slug': ('name_en',)}
    actions = ['add_to_deals', 'remove_from_deals', 'add_to_hero_slider', 'remove_from_hero_slider']

    @admin.action(description="🏷️ تحويل المنتجات المحددة إلى قسم العروض (بخصم 20% افتراضياً)")
    def add_to_deals(self, request, queryset):
        count = 0
        for p in queryset:
            p.is_deal = True
            p.deal_discount_percentage = p.deal_discount_percentage or 20
            p.deal_description = p.deal_description or 'عرض حصري'
            if not p.original_price or p.original_price <= p.price:
                p.original_price = p.price
            p.price = round(float(p.original_price) * (1 - (p.deal_discount_percentage / 100.0)), 2)
            p.save()
            count += 1
        self.message_user(request, f"تم تحويل {count} منتج إلى قسم العروض بنجاح.")

    @admin.action(description="🚫 إزالة المنتجات المحددة من قسم العروض واستعادة السعر الأصلي")
    def remove_from_deals(self, request, queryset):
        count = 0
        for p in queryset:
            p.is_deal = False
            p.deal_discount_percentage = 0
            if p.original_price and p.original_price > p.price:
                p.price = p.original_price
            p.save()
            count += 1
        self.message_user(request, f"تمت إزالة {count} منتج من قسم العروض بنجاح.")

    @admin.action(description="🌟 إضافة المنتجات المحددة إلى لافتة العرض الرئيسية (Hero Slider)")
    def add_to_hero_slider(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f"تمت إضافة {updated} منتج إلى لافتة العرض الرئيسية بنجاح.")

    @admin.action(description="🚫 إزالة المنتجات المحددة من لافتة العرض الرئيسية")
    def remove_from_hero_slider(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f"تمت إزالة {updated} منتج من لافتة العرض الرئيسية بنجاح.")
