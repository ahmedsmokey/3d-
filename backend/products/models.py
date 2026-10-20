from django.db import models

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)

    def __str__(self):
        return self.name

class PrinterModel(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='printers')
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=170, unique=True)
    technology = models.CharField(
        max_length=50,
        choices=[('FDM', 'FDM (Filament)'), ('SLA', 'SLA/Resin')],
        default='FDM'
    )
    image_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.brand.name} - {self.name}"

class Category(models.Model):
    name_en = models.CharField(max_length=120)
    name_ar = models.CharField(max_length=120)
    slug = models.SlugField(max_length=150, unique=True)
    icon_name = models.CharField(max_length=50, default='Tool')
    description_en = models.TextField(blank=True)
    description_ar = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.name_en} ({self.name_ar})"

class Product(models.Model):
    name_en = models.CharField(max_length=200)
    name_ar = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    compatible_printers = models.ManyToManyField(PrinterModel, blank=True, related_name='compatible_parts')
    compatible_brands = models.ManyToManyField(Brand, blank=True, related_name='spare_parts')
    is_universal = models.BooleanField(default=False, help_text="Fits standard printers (e.g., standard PTFE tube, 2GT belt)")
    
    sku = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.PositiveIntegerField(default=10)
    
    description_en = models.TextField()
    description_ar = models.TextField()
    specifications = models.JSONField(default=dict, blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    images = models.JSONField(default=list, blank=True, help_text="List of product image URLs")
    has_variants = models.BooleanField(default=False, help_text="True if product has size/measurement options")
    variants = models.JSONField(default=list, blank=True, help_text="List of variants: [{ id, name, name_ar, price, in_stock, image_url }]")
    
    rating = models.FloatField(default=4.8)
    reviews_count = models.PositiveIntegerField(default=15)
    is_featured = models.BooleanField(default=False)
    
    # Deals & Special Offers
    is_deal = models.BooleanField(default=False, help_text="True if product is in Deals / Offers section")
    deal_discount_percentage = models.PositiveIntegerField(default=0, blank=True, help_text="Discount percentage e.g. 20 for 20%")
    deal_description = models.CharField(max_length=200, blank=True, default='', help_text="Deal tag e.g. خصم حصري or Flash Deal")
    deal_end_date = models.DateTimeField(null=True, blank=True, help_text="Optional deal expiry date")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.images and isinstance(self.images, list) and len(self.images) > 0:
            if not self.image_url or self.image_url not in self.images:
                self.image_url = self.images[0]
        elif self.image_url and not self.images:
            self.images = [self.image_url]
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.sku}] {self.name_en}"


class Banner(models.Model):
    title = models.CharField(max_length=200, blank=True)
    image = models.FileField(upload_to='banners/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.title or f"Banner #{self.id}"
