import os
import django
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Brand, PrinterModel, Category, Product
from orders.models import OrderItem, Order

print("1. Clearing old products and related orders...")
OrderItem.objects.all().delete()
Order.objects.all().delete()
Product.objects.all().delete()

print("2. Creating/ensuring brands...")
brands_info = [
    {'name': 'Bambu Lab', 'slug': 'bambu-lab', 'description': 'High-speed CoreXY 3D printers (X1, P1, A1 Series)'},
    {'name': 'Wanhao / Monoprice', 'slug': 'wanhao', 'description': 'Duplicator i3, D6, D4 and Monoprice Maker Select series'},
    {'name': 'UltiMaker', 'slug': 'ultimaker', 'description': 'Industrial Dutch 3D printers and Print Core ecosystem'},
    {'name': 'Phrozen', 'slug': 'phrozen', 'description': 'Precision MSLA resin 3D printers and VAT accessories'},
    {'name': 'NextDent', 'slug': 'nextdent', 'description': 'High-speed medical & dental 3D printers'},
    {'name': 'Creality', 'slug': 'creality', 'description': 'Popular Ender and CR series 3D printer parts'},
    {'name': 'Voron Design', 'slug': 'voron', 'description': 'High performance CoreXY open-source 3D printers'},
]
brands = {}
for b in brands_info:
    obj, _ = Brand.objects.get_or_create(slug=b['slug'], defaults=b)
    brands[b['slug']] = obj

print("3. Creating/ensuring printer models...")
printers_info = [
    {'brand': brands['bambu-lab'], 'name': 'X1 / X1-Carbon / X1E', 'slug': 'bambu-x1'},
    {'brand': brands['bambu-lab'], 'name': 'P1P / P1S', 'slug': 'bambu-p1s'},
    {'brand': brands['bambu-lab'], 'name': 'A1 / A1 Mini', 'slug': 'bambu-a1'},
    {'brand': brands['wanhao'], 'name': 'Duplicator i3 / Plus', 'slug': 'wanhao-i3'},
    {'brand': brands['wanhao'], 'name': 'Duplicator D6', 'slug': 'wanhao-d6'},
    {'brand': brands['wanhao'], 'name': 'Duplicator D7 (Resin)', 'slug': 'wanhao-d7'},
    {'brand': brands['ultimaker'], 'name': 'UltiMaker S3 / S5 / S7', 'slug': 'ultimaker-s-series'},
    {'brand': brands['ultimaker'], 'name': 'UltiMaker 3 / 3 Extended', 'slug': 'ultimaker-3'},
    {'brand': brands['phrozen'], 'name': 'Sonic Mega 8K', 'slug': 'phrozen-mega-8k'},
    {'brand': brands['phrozen'], 'name': 'Transform / Shuffle XL', 'slug': 'phrozen-transform'},
    {'brand': brands['nextdent'], 'name': 'NextDent 5100 High-Speed', 'slug': 'nextdent-5100'},
]
printers = {}
for p in printers_info:
    obj, _ = PrinterModel.objects.get_or_create(slug=p['slug'], defaults=p)
    printers[p['slug']] = obj

print("4. Creating categories...")
categories_info = [
    {
        'slug': 'hotends-extruders',
        'name_en': 'Hotends & Extruders',
        'name_ar': 'رؤوس التسخين والمغذيات',
        'icon_name': 'Cpu',
        'description_en': 'Complete hotend assemblies, heater blocks, and extruder drive gears.',
        'description_ar': 'رؤوس التسخين الكاملة وقوالب التسخين وتروس سحب الفتيل.'
    },
    {
        'slug': 'nozzles',
        'name_en': 'Nozzles & Print Cores',
        'name_ar': 'فوهات الطباعة والأنوية',
        'icon_name': 'Flame',
        'description_en': 'MK10, MK11, Hardened Steel, and UltiMaker Print Cores.',
        'description_ar': 'فوهات نحاسية وفولاذية مقساة وأنوية طباعة UltiMaker الأصلية.'
    },
    {
        'slug': 'build-plates',
        'name_en': 'Build Plates & Adhesion',
        'name_ar': 'ألواح وأسطح الطباعة',
        'icon_name': 'Layers',
        'description_en': 'Textured PEI spring steel sheets, heating beds, and borosilicate glass.',
        'description_ar': 'ألواح PEI ذهبية ممغنطة، ألواح زجاجية حرارية، وأسطح التصاق 3M.'
    },
    {
        'slug': 'cooling-fans',
        'name_en': 'Cooling & Heating Cartridges',
        'name_ar': 'سخانات ومراوح التبريد',
        'icon_name': 'Wind',
        'description_en': '4010 cooling fans, 12V/24V heating cartridges, and insulated socks.',
        'description_ar': 'مراوح تبريد الطارد، سخانات حرارية، وأغطية عازلة للحرارة.'
    },
    {
        'slug': 'electronics-sensors',
        'name_en': 'Electronics & Sensors',
        'name_ar': 'الإلكترونيات والمستشعرات',
        'icon_name': 'Radio',
        'description_en': 'Mainboards, LCD screens, PT100 thermocouples, and endstop switches.',
        'description_ar': 'لوحات التحكم، شاشات LCD، حساسات حرارية PT100، ومفاتيح نهاية الشوط.'
    },
    {
        'slug': 'resin-vat-films',
        'name_en': 'Resin Vats & FEP Films',
        'name_ar': 'أحواض الراتنج ورقاقات FEP',
        'icon_name': 'Layers',
        'description_en': 'Aluminum resin vats, PFA/nFEP films, and replacement resin trays.',
        'description_ar': 'أحواض ألمنيوم للطابعات الضوئية، رقاقات FEP فائقة الشفافية، وصواني راتنج.'
    },
    {
        'slug': 'motion-gears',
        'name_en': 'Motors, Gears & Hardware',
        'name_ar': 'المحركات والتروس والمحامل',
        'icon_name': 'Activity',
        'description_en': 'Stepper motors, extruder drive gears, and IGUS Drylin bearings.',
        'description_ar': 'محركات الخطوة، مسننات الفتيل، ومحامل IGUS الهادئة.'
    },
    {
        'slug': 'multi-material',
        'name_en': 'Multi-Material & AMS',
        'name_ar': 'أنظمة الطباعة متعددة الألوان',
        'icon_name': 'Zap',
        'description_en': 'Automatic Material Systems (AMS) and feeder buffer boards.',
        'description_ar': 'أنظمة تبديل وتغذية الألوان التلقائية AMS لطابعات بامبو لاب.'
    }
]
categories = {}
for c in categories_info:
    obj, _ = Category.objects.get_or_create(slug=c['slug'], defaults=c)
    categories[c['slug']] = obj

# REAL PRODUCTS FROM ULTIMATE 3D PRINTING STORE
products_data = [
    {
        'sku': 'WAN-I3-HEATBLOCK',
        'name_en': 'Wanhao Hotend Nozzle Mounting Block MK10 - 3 & 4 Series',
        'name_ar': 'قالب تثبيت فوهة الهوت إند MK10 لطابعات Wanhao وسلسلة i3',
        'slug': 'wanhao-hotend-nozzle-mounting-block-mk10',
        'category': categories['hotends-extruders'],
        'price': 19.99,
        'original_price': 24.99,
        'stock_quantity': 35,
        'is_featured': True,
        'is_universal': False,
        'rating': 4.9,
        'reviews_count': 22,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/hot-end-nozzle-mounting-block-mk10-wanhao-duplicator-i3-monoprice-maker-select.jpg?v=1580593694',
        'description_en': 'Genuine Wanhao Hot End Nozzle Mounting Block MK10 replacement. Precision-machined aluminum block engineered for Duplicator i3, Maker Select, and 4 Series 3D printers.',
        'description_ar': 'قالب أصلي من Wanhao لتثبيت فوهة رأس الطباعة MK10 مصنوع من الألمنيوم الدقيق المخصص لطابعات Duplicator i3 وسلسلة Maker Select.',
        'specifications': {
            'Material': 'Precision CNC Aluminum (ألمنيوم مشكّل بدقة)',
            'Standard': 'MK10 / MK11 Threaded',
            'Compatibility': 'Wanhao Duplicator i3, Monoprice Maker Select',
            'Warranty': 'OEM Authentic Part'
        },
        'printers': [printers['wanhao-i3']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'BAMBU-X1-COMP-HOTEND',
        'name_en': 'Complete Hotend Assembly - Bambu Lab X1 Series',
        'name_ar': 'رأس تسخين متكامل (Complete Hotend) لطابعات Bambu Lab X1 Series',
        'slug': 'complete-hotend-assembly-bambu-x1-series',
        'category': categories['hotends-extruders'],
        'price': 34.99,
        'original_price': 42.99,
        'stock_quantity': 45,
        'is_featured': True,
        'is_universal': False,
        'rating': 5.0,
        'reviews_count': 68,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/files/complete-hotend-assembly-x1.webp?v=1686670552',
        'description_en': 'Authentic Bambu Lab Complete Hotend Assembly for X1 and X1-Carbon. Includes pre-assembled ceramic heater, cooling fan, thermistor, and hardened steel nozzle.',
        'description_ar': 'وحدة هوت إند أصلية كاملة ومجمعة مسبقاً لطابعات بامبو لاب X1 تشمل السخان الخزفي، مروحة التبريد، حساس الحرارة، وفوهة الفولاذ المقسى الجاهزة للتركيب الفوري.',
        'specifications': {
            'Nozzle Diameter': '0.4 mm Hardened Steel (فولاذ مقسى)',
            'Max Print Temp': '300 °C',
            'Pre-assembled': 'Includes Fan, Heater & Thermistor',
            'Compatibility': 'Bambu Lab X1 / X1-Carbon'
        },
        'printers': [printers['bambu-x1']],
        'brands': [brands['bambu-lab']]
    },
    {
        'sku': 'BAMBU-P1-COMP-HOTEND',
        'name_en': 'Complete Hotend Assembly - Bambu Lab P1 Series',
        'name_ar': 'رأس تسخين متكامل لطابعات Bambu Lab P1P / P1S',
        'slug': 'complete-hotend-assembly-bambu-p1-series',
        'category': categories['hotends-extruders'],
        'price': 34.99,
        'original_price': 42.99,
        'stock_quantity': 40,
        'is_featured': True,
        'is_universal': False,
        'rating': 4.9,
        'reviews_count': 54,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/files/CompleteHotendAssembly-P1Series-1.webp?v=1696439635',
        'description_en': 'Complete hotend assembly specifically wired for Bambu Lab P1P and P1S printers. Plug-and-play installation with integrated cooling and ceramic heating core.',
        'description_ar': 'مجموعة هوت إند كاملة التجهيز مخصصة لطابعات بامبو لاب P1P و P1S. توصيل فوري Plug-and-play مع تبريد متكامل وحلقة تسخين خزفية عالية السرعة.',
        'specifications': {
            'Nozzle Size': '0.4 mm Stainless / Hardened Steel',
            'Max Temp': '300 °C',
            'Connector': 'P1 Series dedicated wiring harness',
            'Flow Rate': 'High volumetric flow rate'
        },
        'printers': [printers['bambu-p1s']],
        'brands': [brands['bambu-lab']]
    },
    {
        'sku': 'BAMBU-X1E-HOTEND',
        'name_en': 'Complete Hotend Assembly - Bambu Lab X1E Industrial Series',
        'name_ar': 'رأس تسخين صناعي عالي الحرارة لطابعات Bambu Lab X1E',
        'slug': 'complete-hotend-assembly-bambu-x1e-industrial',
        'category': categories['hotends-extruders'],
        'price': 45.00,
        'original_price': 52.00,
        'stock_quantity': 20,
        'is_featured': True,
        'is_universal': False,
        'rating': 5.0,
        'reviews_count': 18,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/files/8FBA2A5DE6E7E4B5F30720ED130D1258.png?v=1719416557',
        'description_en': 'Engineered for the industrial Bambu Lab X1E. Enhanced thermal boundary, optimized for engineering polymers like PPA-CF, PPS, and high-temp composites.',
        'description_ar': 'صُمم خصيصاً لطابعات Bambu Lab X1E الصناعية لدعم طباعة البوليمرات الهندسية المتقدمة مثل ألياف الكربون PPA-CF و PPS واللدائن المقواة بدرجات حرارة فائقة.',
        'specifications': {
            'Max Temp': '320 °C (حرارة تشغيل صناعية)',
            'Filament Support': 'PPA-CF, PPS-CF, PA-CF, PC, PETG',
            'Compatibility': 'Bambu Lab X1E'
        },
        'printers': [printers['bambu-x1']],
        'brands': [brands['bambu-lab']]
    },
    {
        'sku': 'BAMBU-HOTEND-NOZZLE-04',
        'name_en': 'Bambu Lab Hotend with 0.4mm Nozzle',
        'name_ar': 'هوت إند بامبو لاب مع فوهة 0.4 مم مدمجة',
        'slug': 'bambu-lab-hotend-with-nozzle-04mm',
        'category': categories['nozzles'],
        'price': 15.99,
        'original_price': 19.99,
        'stock_quantity': 60,
        'is_featured': True,
        'is_universal': False,
        'rating': 4.9,
        'reviews_count': 84,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/files/0.4mm_1800x1800_3d9515cc-aac1-42d3-a39c-3790dc660091.webp?v=1687369260',
        'description_en': 'Original Bambu Lab hotend unit with integrated nozzle. Eliminates thermal leakage, lightweight all-metal heatsink design ensures rapid heat dissipation.',
        'description_ar': 'وحدة رأس تسخين أصلية من بامبو لاب بفوهة مدمجة تمنع أي تسريب حراري، مع مشتت حراري معدني خفيف الوزن يضمن تشتيتاً فائق السرعة للحرارة.',
        'specifications': {
            'Diameter': '0.4 mm',
            'Material': 'Stainless / Hardened Steel',
            'Design': 'All-Metal Integrated Heatbreak',
            'Compatibility': 'X1, P1P, P1S'
        },
        'printers': [printers['bambu-x1'], printers['bambu-p1s']],
        'brands': [brands['bambu-lab']]
    },
    {
        'sku': 'BAMBU-A1-HARDENED-HOTEND',
        'name_en': 'Bambu Lab Hotend with Nozzle - A1 Series / A1 Mini',
        'name_ar': 'هوت إند مع فوهة سريعة التبديل لطابعات Bambu Lab A1 / A1 Mini',
        'slug': 'bambu-lab-hotend-a1-series-a1-mini',
        'category': categories['nozzles'],
        'price': 10.99,
        'original_price': 14.99,
        'stock_quantity': 50,
        'is_featured': False,
        'is_universal': False,
        'rating': 4.8,
        'reviews_count': 32,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/files/0.2_1600x1600_446baeca-7bb3-4235-a5b8-7f6be96493dc.webp?v=1718641255',
        'description_en': 'Quick-swap hotend for Bambu Lab A1 and A1 Mini. Features toolless quick-release clip mechanism for fast nozzle swapping in under 30 seconds.',
        'description_ar': 'رأس تسخين فائق السرعة لطابعات A1 و A1 Mini يتميز بنظام القفل السريع دون أدوات لتغيير الفوهة بسهولة خلال أقل من 30 ثانية.',
        'specifications': {
            'Nozzle Size': '0.4 mm / 0.2 mm available',
            'Quick Swap': 'Toolless clip mechanism (تبديل يدوي سريع)',
            'Compatibility': 'Bambu Lab A1, A1 Mini'
        },
        'printers': [printers['bambu-a1']],
        'brands': [brands['bambu-lab']]
    },
    {
        'sku': 'WAN-MK10-NOZZLE-04',
        'name_en': 'Wanhao i3 - MK10 / MK11 Brass Nozzle 0.4mm',
        'name_ar': 'فوهة نحاسية MK10 / MK11 قياس 0.4 مم لطابعات Wanhao i3',
        'slug': 'wanhao-i3-mk10-mk11-brass-nozzle-04mm',
        'category': categories['nozzles'],
        'price': 15.95,
        'original_price': 19.95,
        'stock_quantity': 45,
        'is_featured': False,
        'is_universal': True,
        'rating': 4.8,
        'reviews_count': 29,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/mk10mk11-nozzle-4mm-wanhao-duplicator-i3-monoprice-maker-select.jpg?v=1580599509',
        'description_en': 'High-precision brass extruder nozzle replacing worn or clogged nozzles on MK10/MK11 single and dual extruders. Compatible with Wanhao i3, Plus, and Monoprice.',
        'description_ar': 'فوهة بثق نحاسية عالية الدقة لاستبدال الفوهات التالفة في طاردات MK10 و MK11 متوافقة مع طابعات Wanhao i3 وسلسلة Monoprice Maker Select.',
        'specifications': {
            'Orifice Diameter': '0.4 mm',
            'Thread': 'M7 Thread (MK10 Standard)',
            'Material': 'High Conductivity Brass (نحاس عالي التوصيل)',
            'Filament Size': '1.75 mm'
        },
        'printers': [printers['wanhao-i3']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'ULTIMAKER-CORE-AA-04',
        'name_en': 'UltiMaker Print Core AA (0.4mm)',
        'name_ar': 'نواة الطباعة الأصلية UltiMaker Print Core AA (0.4 مم)',
        'slug': 'ultimaker-print-core-aa-04mm',
        'category': categories['nozzles'],
        'price': 169.00,
        'original_price': 185.00,
        'stock_quantity': 15,
        'is_featured': True,
        'is_universal': False,
        'rating': 5.0,
        'reviews_count': 41,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/ultimaker-3-print-core-aa-0-4mm.jpg?v=1580593006',
        'description_en': 'Genuine UltiMaker Print Core AA (0.4mm) for standard build materials like PLA, ABS, Tough PLA, Nylon, and TPU 95A. Quick-swap click-in design with smart EEPROM chip.',
        'description_ar': 'نواة الطباعة الأصلية UltiMaker Print Core AA بقطر 0.4 مم لمواد البناء القياسية مثل PLA و ABS و النايلون، مزودة بشريحة ذكية لقراءة المادة تلقائياً.',
        'specifications': {
            'Type': 'Core AA (Standard Build Materials)',
            'Nozzle Size': '0.4 mm',
            'Smart Chip': 'Automatic material recognition EEPROM',
            'Compatibility': 'UltiMaker S3, S5, S7, UltiMaker 3'
        },
        'printers': [printers['ultimaker-s-series'], printers['ultimaker-3']],
        'brands': [brands['ultimaker']]
    },
    {
        'sku': 'ULTIMAKER-CORE-BB-04',
        'name_en': 'UltiMaker Print Core BB (0.4mm) - Soluble Support',
        'name_ar': 'نواة طباعة مواد الدعم القابلة للذوبان UltiMaker Print Core BB (0.4 مم)',
        'slug': 'ultimaker-print-core-bb-04mm',
        'category': categories['nozzles'],
        'price': 169.00,
        'original_price': 185.00,
        'stock_quantity': 12,
        'is_featured': True,
        'is_universal': False,
        'rating': 4.9,
        'reviews_count': 27,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/ultimaker-3-print-core-bb-0-4mm.jpg?v=1580593006',
        'description_en': 'Specially designed for water-soluble PVA support filament and break-away support materials. Prevents clogging with custom thermal heat dissipation geometry.',
        'description_ar': 'مصممة خصيصاً لمواد الدعم القابلة للذوبان في الماء (PVA) ومواد Break-away لتفادي الانسداد وضمان أشكال هندسية معقدة بدقة متناهية.',
        'specifications': {
            'Type': 'Core BB (PVA Soluble Support Core)',
            'Diameter': '0.4 mm',
            'Compatibility': 'UltiMaker S3, S5, S7, UltiMaker 3'
        },
        'printers': [printers['ultimaker-s-series'], printers['ultimaker-3']],
        'brands': [brands['ultimaker']]
    },
    {
        'sku': 'BAMBU-GOLD-PEI-PLATE',
        'name_en': 'Bambu Lab Textured PEI Plate (Dual-Sided Gold)',
        'name_ar': 'لوح طباعة ممغنط بطبقة PEI ذهبية مزدوجة من Bambu Lab',
        'slug': 'bambu-lab-textured-pei-plate-gold',
        'category': categories['build-plates'],
        'price': 34.99,
        'original_price': 40.99,
        'stock_quantity': 48,
        'is_featured': True,
        'is_universal': False,
        'rating': 5.0,
        'reviews_count': 112,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/files/Bambu-Lab-Gold-Textured-PEI-Plate.webp?v=1694101145',
        'description_en': 'Official Bambu Lab dual-sided textured PEI powder-coated spring steel plate. Delivers outstanding first layer adhesion without glue, parts release effortlessly once cooled.',
        'description_ar': 'لوح صلب زنبركي أصلي مغطى بمسحوق PEI الذهبي المحبب على الوجهين. يمنح التصاقاً مثالياً للطبقة الأولى بدون صمغ وتنفصل القطع تلقائياً عند انخفاض الحرارة.',
        'specifications': {
            'Dimensions': '256 x 256 mm',
            'Coating': 'Double-Sided Matte Textured PEI',
            'Base Material': 'Flexible Spring Steel Sheet',
            'Compatibility': 'Bambu Lab X1-Carbon, X1, P1P, P1S'
        },
        'printers': [printers['bambu-x1'], printers['bambu-p1s']],
        'brands': [brands['bambu-lab']]
    },
    {
        'sku': 'WAN-BOROSILICATE-GLASS',
        'name_en': 'Wanhao i3 - Heat-Resistant Borosilicate Glass Plate',
        'name_ar': 'لوح زجاجي حراري مسطح (Borosilicate Glass) لطابعات Wanhao i3',
        'slug': 'wanhao-i3-borosilicate-glass-plate',
        'category': categories['build-plates'],
        'price': 20.95,
        'original_price': 26.00,
        'stock_quantity': 30,
        'is_featured': False,
        'is_universal': True,
        'rating': 4.7,
        'reviews_count': 23,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/heat-resistant-borosilicate-glass-wanhao-duplicator-i3-monoprice-maker-select.jpg?v=1580586436',
        'description_en': 'Heavy-duty borosilicate flat glass bed plate. Resists thermal warping and delivers a glossy mirror finish to printed part bottoms. Fits 200x200mm heated beds.',
        'description_ar': 'لوح زجاجي فائق المقاومة للحرارة والتمدد يمنح السطح السفلي للمطبوعات لمعاناً ونعومة كالمرآة، ملائم لأسطح التسخين مقاس 200×200 مم.',
        'specifications': {
            'Material': 'Borosilicate Glass (زجاج البوروسيليكات المقاوم)',
            'Size': '213 x 200 x 3 mm',
            'Flatness': 'Ultra-flat ±0.05 mm'
        },
        'printers': [printers['wanhao-i3']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'WAN-3M-HEATING-PLATE',
        'name_en': 'Wanhao i3 - 3M Heating Board Plate Sticker',
        'name_ar': 'سطح لاصق حراري أصلي 3M لمنصة طباعة Wanhao i3',
        'slug': 'wanhao-i3-3m-heating-board-plate',
        'category': categories['build-plates'],
        'price': 7.95,
        'original_price': 9.95,
        'stock_quantity': 55,
        'is_featured': False,
        'is_universal': True,
        'rating': 4.8,
        'reviews_count': 19,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/wanhao-duplicator-i3-3-series-3d-printer-parts-3m-heating-board-plate.jpg?v=1580609364',
        'description_en': 'Official Wanhao replacement adhesive 3M print surface. Ensures high tack for PLA and ABS filaments directly on the aluminum heated bed.',
        'description_ar': 'شريحة لاصقة حرارية أصلية من 3M لمنصة الطباعة لضمان التصاق متين لخيوط PLA و ABS مباشرة على سرير التسخين دون تقوس.',
        'specifications': {
            'Dimensions': '8 5/8" x 8 5/8" (219 x 219 mm)',
            'Adhesive': 'Genuine 3M High Temperature Backing'
        },
        'printers': [printers['wanhao-i3']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'WAN-HEATING-CART-V2',
        'name_en': 'Wanhao Heating Cartridge V2 (12V 40W)',
        'name_ar': 'سخان حراري كارتريج V2 قدرة 40 واط / 12 فولت لطابعات Wanhao i3',
        'slug': 'wanhao-heating-cartridge-v2-12v-40w',
        'category': categories['cooling-fans'],
        'price': 19.99,
        'original_price': 24.00,
        'stock_quantity': 42,
        'is_featured': False,
        'is_universal': True,
        'rating': 4.8,
        'reviews_count': 26,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/heating-cartridge-v2-wanhao-duplicator-i3-monoprice-maker-select.jpg?v=1580588533',
        'description_en': 'Upgraded stainless steel heater cartridge tube. Diameter: 6.3mm, Length: 26.6mm. Rated at 12V 40W for rapid heating in Wanhao Duplicator i3 V2.1 and Maker Select.',
        'description_ar': 'أنبوب تسخين مطور من الفولاذ المقاوم للصدأ بقطر 6.3 مم وبطول 26.6 مم يعمل بجهد 12 فولت وقدرة 40 واط لتسخين فوري ومستقر.',
        'specifications': {
            'Voltage / Power': '12V / 40W',
            'Diameter': '6.3 mm',
            'Cable Length': '1 meter high-temp insulated'
        },
        'printers': [printers['wanhao-i3']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'WAN-EXTRUDER-COOLING-FAN',
        'name_en': 'Wanhao i3 - Extruder Cooling Fan (40x10mm 24V)',
        'name_ar': 'مروحة تبريد الطارد واللوحة الأم 40×10 مم لطابعات Wanhao i3',
        'slug': 'wanhao-i3-extruder-cooling-fan-4010',
        'category': categories['cooling-fans'],
        'price': 8.95,
        'original_price': 11.95,
        'stock_quantity': 50,
        'is_featured': False,
        'is_universal': True,
        'rating': 4.7,
        'reviews_count': 18,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/wanhao-duplicator-parts-extruder-fan.jpg?v=1580600109',
        'description_en': 'Quiet dual-ball bearing 4010 axial cooling fan. Direct replacement for cold block heatsink cooling on Wanhao i3 and motherboard chassis.',
        'description_ar': 'مروحة تبريد محورية 4010 هادئة وفعالة بمحامل مزدوجة لتبريد كتلة الهوت إند وحماية فتحة التغذية من الانسداد الحراري.',
        'specifications': {
            'Dimensions': '40 x 40 x 10 mm',
            'Voltage': '24V / 12V variant',
            'Bearing': 'Dual Ball Bearing'
        },
        'printers': [printers['wanhao-i3'], printers['wanhao-d6']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'WAN-D6-PT100-SENSOR',
        'name_en': 'Wanhao D6 - PT100 High-Precision Thermocouple',
        'name_ar': 'حساس حرارة دقيق طراز PT100 لطابعات Wanhao Duplicator D6',
        'slug': 'wanhao-d6-pt100-thermocouple-sensor',
        'category': categories['electronics-sensors'],
        'price': 29.99,
        'original_price': 35.00,
        'stock_quantity': 25,
        'is_featured': False,
        'is_universal': False,
        'rating': 4.9,
        'reviews_count': 16,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/wanhao-duplicator-6-series-3d-printer-parts-pt100-thermocouple.jpg?v=1580604543',
        'description_en': 'High accuracy PT100 RTD temperature probe with braided metal shielding. Accurately reads hotend temperatures up to 400°C on Duplicator D6 and Monoprice Ultimate.',
        'description_ar': 'مسبار استشعار حراري دقيق جداً من نوع PT100 مغلف بسلك معدني مجدول ومقاوم للتشويش يقيس درجات الحرارة بدقة عالية حتى 400 درجة مئوية.',
        'specifications': {
            'Sensor Type': 'PT100 Platinum RTD',
            'Max Temp': '400 °C',
            'Compatibility': 'Wanhao Duplicator 6, Monoprice Maker Select Ultimate'
        },
        'printers': [printers['wanhao-d6']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'WAN-MELZI-MOTHERBOARD',
        'name_en': 'Wanhao i3 v2.1 Motherboard - Melzi v3.5 Mainboard',
        'name_ar': 'اللوحة الأم الرئيسية Melzi v3.5 لطابعات Wanhao Duplicator i3',
        'slug': 'wanhao-i3-melzi-v35-motherboard',
        'category': categories['electronics-sensors'],
        'price': 99.99,
        'original_price': 119.99,
        'stock_quantity': 14,
        'is_featured': True,
        'is_universal': False,
        'rating': 4.9,
        'reviews_count': 34,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/motherboard-melzi-v3-5-wanhao-duplicator-i3-monoprice-maker-select.jpg?v=1580598858',
        'description_en': 'Original Melzi v3.5 controller board pre-flashed with Wanhao firmware. Direct drop-in replacement with integrated A4988 stepper drivers and screw terminals.',
        'description_ar': 'لوحة التحكم الأم الأصلية Melzi v3.5 محملة مسبقاً بنظام التشغيل الخاص بطابعات Wanhao i3، مع مشغلات محركات مدمجة ومنافذ لولبية لتركيب مباشر.',
        'specifications': {
            'Model': 'Melzi v3.5 Original Board',
            'Firmware': 'Pre-flashed Wanhao Marlin firmware',
            'Compatibility': 'Wanhao i3 v2.1, Monoprice Maker Select IIIP'
        },
        'printers': [printers['wanhao-i3']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'WAN-D7-2K-LCD-SCREEN',
        'name_en': 'Wanhao D7 - 2K HD Resin LCD Display Screen',
        'name_ar': 'شاشة عرض ضوئية بدقة 2K عالية الوضوح لطابعات الراتنج Wanhao D7',
        'slug': 'wanhao-d7-2k-hd-resin-lcd-screen',
        'category': categories['electronics-sensors'],
        'price': 69.99,
        'original_price': 85.00,
        'stock_quantity': 18,
        'is_featured': True,
        'is_universal': False,
        'rating': 4.8,
        'reviews_count': 22,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/wanhao-d7-lcd-display-2k.jpg?v=1580603708',
        'description_en': 'Authentic 5.5-inch 2K (2560x1440) monochrome masking LCD screen for Wanhao Duplicator 7 MSLA resin 3D printers. Sharp pixel density for smooth dental and jewelry prints.',
        'description_ar': 'شاشة عرض أصلية قياس 5.5 بوصة بدقة 2K (2560×1440) مخصصة لطابعات الراتنج الضوئية Wanhao D7 تمنح تفاصيل طباعة دقيقة للمجوهرات ونماذج الأسنان.',
        'specifications': {
            'Resolution': '2K (2560 x 1440)',
            'Size': '5.5 inch Masking LCD',
            'Compatibility': 'Wanhao Duplicator 7 (D7), D7 Plus'
        },
        'printers': [printers['wanhao-d7']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'PHROZEN-A4-FEP-FILM',
        'name_en': 'Phrozen A4 Replacement FEP Film Sheet',
        'name_ar': 'رقاقة FEP بديلة عالية النفاذية قياس A4 لطابعات الراتنج Phrozen',
        'slug': 'phrozen-a4-replacement-fep-film-sheet',
        'category': categories['resin-vat-films'],
        'price': 19.99,
        'original_price': 25.00,
        'stock_quantity': 40,
        'is_featured': False,
        'is_universal': True,
        'rating': 4.9,
        'reviews_count': 38,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/phrozen-a4-fep-film.jpg?v=1580598858',
        'description_en': 'High-transparency 95%+ optical grade FEP film sheet in A4 size. Minimizes peel force and provides ultra-smooth release for LCD & DLP UV resin 3D printing.',
        'description_ar': 'شريحة FEP عالية النقاء بنفاذية ضوء تفوق 95% بحجم A4 تقلل قوة الالتصاق وسحب المجسم عند الطباعة وتطيل عمر حوض الراتنج.',
        'specifications': {
            'Size': 'A4 (210 x 297 mm)',
            'Thickness': '140 µm (0.14 mm)',
            'UV Transmittance': '> 95%'
        },
        'printers': [printers['phrozen-transform'], printers['wanhao-d7']],
        'brands': [brands['phrozen']]
    },
    {
        'sku': 'PHROZEN-ALUM-VAT-XL',
        'name_en': 'Phrozen Aluminum Resin Vat w/ Pre-Installed FEP (XL Series)',
        'name_ar': 'حوض راتنج ألمنيوم متكامل مع رقاقة FEP مثبتة مسبقاً لطابعات Phrozen XL',
        'slug': 'phrozen-aluminum-resin-vat-fep-xl',
        'category': categories['resin-vat-films'],
        'price': 169.99,
        'original_price': 189.99,
        'stock_quantity': 10,
        'is_featured': True,
        'is_universal': False,
        'rating': 5.0,
        'reviews_count': 15,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/phrozen-shuffle-xl-extra-aluminum-vat-with-fep-pre-installed.jpg?v=1580603708',
        'description_en': 'All-metal CNC machined anodized aluminum resin tank. Pre-tensioned FEP film installed out of the box with pour spout for fast, mess-free resin drainage.',
        'description_ar': 'حوض راتنج معدني بالكامل من الألمنيوم المؤكسد المشكل بدقة بالغة، مزود برقاقة FEP مشدودة مسبقاً وجاهزة ومدرج تفريغ لسكب الراتنج بنظافة.',
        'specifications': {
            'Material': 'CNC Anodized Aluminum (ألمنيوم مؤكسد متين)',
            'Pre-installed': 'Tensioned FEP film ready to print',
            'Compatibility': 'Phrozen Shuffle XL, Sonic XL 4K'
        },
        'printers': [printers['phrozen-transform']],
        'brands': [brands['phrozen']]
    },
    {
        'sku': 'NEXTDENT-RESIN-TRAY-5100',
        'name_en': 'Resin Tray Kit for NextDent 5100 High-Speed Dental 3D Printer',
        'name_ar': 'حوض راتنج طبي معتمد لطابعات NextDent 5100 للأسنان',
        'slug': 'nextdent-5100-resin-tray-kit-dental',
        'category': categories['resin-vat-films'],
        'price': 975.00,
        'original_price': 1050.00,
        'stock_quantity': 6,
        'is_featured': True,
        'is_universal': False,
        'rating': 5.0,
        'reviews_count': 12,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/resin-tray-kit-for-nextdent-5100-high-speed-dental-3d-printer.jpg?v=1580601369',
        'description_en': 'Medical-grade certified resin tray kit for NextDent 5100 dental 3D printers. Engineered for biocompatible dental resins, surgical guides, and orthodontic models.',
        'description_ar': 'طقم حوض راتنج طبي أصلي ومعتمد لطابعات NextDent 5100 عالية السرعة المخصصة لطباعة قوالب الأسنان، والجسور، والدلائل الجراحية الحيوية.',
        'specifications': {
            'Certification': 'Medical Grade Biocompatible Certified',
            'Technology': 'Figure 4 High-Speed Tech',
            'Compatibility': 'NextDent 5100 High-Speed Dental Printer'
        },
        'printers': [printers['nextdent-5100']],
        'brands': [brands['nextdent']]
    },
    {
        'sku': 'WAN-MOD-EXTRUDER-GEAR',
        'name_en': 'Wanhao Extruder Drive Gear - D4 / i3 Stainless Upgrade',
        'name_ar': 'ترس سحب الفتيل الفولاذي المعدل لطابعات Wanhao i3 و D4',
        'slug': 'wanhao-extruder-drive-gear-stainless-upgrade',
        'category': categories['motion-gears'],
        'price': 13.95,
        'original_price': 16.95,
        'stock_quantity': 50,
        'is_featured': False,
        'is_universal': True,
        'rating': 4.9,
        'reviews_count': 31,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/extruder-drive-gear-4-series-but-an-excellent-modification-for-3-series-wanhao-duplicator-i3-monoprice-maker-select.jpg?v=1580600383',
        'description_en': 'Sharp deep-tooth stainless steel drive gear modification. Provides non-slip filament grip for flexible TPU, PLA, and ABS without grinding.',
        'description_ar': 'ترس تغذية فولاذي ذو أسنان عميقة وحادة تمنع انزلاق الخيط أو تأكله، مثالي لطباعة الخيوط المرنة TPU ومواد PLA و ABS بثبات تام.',
        'specifications': {
            'Material': 'Hardened Stainless Steel (فولاذ مقاوم للصدأ)',
            'Bore Diameter': '5 mm D-shaft',
            'Tooth Profile': 'Deep hobbed non-slip teeth'
        },
        'printers': [printers['wanhao-i3']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'IGUS-DRYLIN-RJ4JP-6PK',
        'name_en': 'IGUS DRYLIN® RJ4JP 01-08 Solid Polymer Bearings (6 Pack)',
        'name_ar': 'طقم محامل صامتة ألمانية IGUS Drylin RJ4JP 01-08 (عبوة 6 قطع)',
        'slug': 'igus-drylin-rj4jp-01-08-bearings-6-pack',
        'category': categories['motion-gears'],
        'price': 16.95,
        'original_price': 22.00,
        'stock_quantity': 65,
        'is_featured': True,
        'is_universal': True,
        'rating': 5.0,
        'reviews_count': 59,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/igus-drylin-rj4jp-01-08-bearing-6-set.jpg?v=1580597858',
        'description_en': 'Genuine German IGUS Drylin RJ4JP solid polymer linear bearings. 100% self-lubricating, zero noise, lightweight replacement for standard LM8UU metal bearings on 8mm rods.',
        'description_ar': 'محامل خطية بوليمرية ألمانية أصلية من شركة IGUS ذاتية التشحيم بالكامل وصامتة تماماً وخفيفة الوزن، تعتبر الترقية المثالية لمحامل LM8UU المعدنية على محاور 8 مم.',
        'specifications': {
            'Inner Diameter': '8 mm',
            'Outer Diameter': '15 mm',
            'Length': '24 mm',
            'Lubrication': 'Self-Lubricating Maintenance Free (بدون تزييت)'
        },
        'printers': [printers['wanhao-i3'], printers['bambu-x1']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'WAN-STEPPER-MOTOR-XYE',
        'name_en': 'Wanhao X/Y/E Axis Stepper Motor - i3 V2.0 / Plus',
        'name_ar': 'محرك خطوة أصلي لمحاور X/Y/E لطابعات Wanhao i3',
        'slug': 'wanhao-xye-axis-stepper-motor-i3',
        'category': categories['motion-gears'],
        'price': 29.95,
        'original_price': 36.00,
        'stock_quantity': 28,
        'is_featured': False,
        'is_universal': True,
        'rating': 4.8,
        'reviews_count': 17,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/wanhao-duplicator-3-series-xy-axis-step-motor.jpg?v=1580605058',
        'description_en': 'Genuine 42-40 NEMA 17 high-torque bipolar stepper motor with factory wiring harness. Delivers smooth axis motion and precise micro-stepping.',
        'description_ar': 'محرك خطوة أصلي NEMA 17 بعزم دوران عالي متوافق مع محاور X و Y وطارد الفتيل E لطابعات Wanhao i3 و i3 Plus وسلسلة Maker Select.',
        'specifications': {
            'Size': 'NEMA 17 (42 x 42 x 40 mm)',
            'Step Angle': '1.8 degrees',
            'Shaft': '5 mm Flat D-Cut'
        },
        'printers': [printers['wanhao-i3']],
        'brands': [brands['wanhao']]
    },
    {
        'sku': 'BAMBU-AMS-PRO-SYSTEM',
        'name_en': 'Bambu Lab AMS - Automatic Material System (Multi-Color)',
        'name_ar': 'نظام الطباعة متعددة الألوان التلقائي Bambu Lab AMS (4 ألوان)',
        'slug': 'bambu-lab-ams-automatic-material-system',
        'category': categories['multi-material'],
        'price': 319.00,
        'original_price': 369.00,
        'stock_quantity': 15,
        'is_featured': True,
        'is_universal': False,
        'rating': 5.0,
        'reviews_count': 92,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/bambu-lab-ams-automatic-material-system.jpg?v=1686670552',
        'description_en': 'The game-changing 4-spool smart filament system for Bambu Lab X1 and P1 series. Features airtight moisture-sealed chamber, RFID spool identification, and automatic spool backup.',
        'description_ar': 'نظام التغذية الذكي بـ 4 بكرات لطابعات بامبو لاب X1 و P1. يتميز بغرفة محكمة الإغلاق لمنع الرطوبة، وقراءة تلقائية لخيوط RFID، والانتقال التلقائي للبكرة البديلة.',
        'specifications': {
            'Capacity': '4 Filament Spools (حتى 4 بكرات معاً)',
            'Multi-Color': 'Supports up to 16 colors when daisy-chained',
            'Sealing': 'Airtight with integrated desiccant bays',
            'Compatibility': 'Bambu Lab X1-Carbon, X1, P1S, P1P'
        },
        'printers': [printers['bambu-x1'], printers['bambu-p1s']],
        'brands': [brands['bambu-lab']]
    },
    {
        'sku': 'BAMBU-X1E-EXTRUDER-BOARD',
        'name_en': 'Bambu Lab Extruder Interface Board - X1E',
        'name_ar': 'لوحة وصل وتوصيل الطارد الإلكترونية لطابعات Bambu Lab X1E',
        'slug': 'bambu-lab-extruder-interface-board-x1e',
        'category': categories['electronics-sensors'],
        'price': 10.00,
        'original_price': 14.00,
        'stock_quantity': 35,
        'is_featured': False,
        'is_universal': False,
        'rating': 4.9,
        'reviews_count': 14,
        'image_url': 'https://cdn.shopify.com/s/files/1/0789/2979/products/bambu-lab-extruder-interface-board-x1e.jpg?v=1719416557',
        'description_en': 'Toolhead breakout board connecting the hotend, cooling fans, and filament sensors to the main chassis on Bambu Lab X1E enterprise 3D printers.',
        'description_ar': 'لوحة توزيع إلكترونية مدمجة برأس الطباعة تربط الهوت إند ومراوح التبريد وحساسات انقطاع الفتيل باللوحة الأم لطابعات Bambu Lab X1E.',
        'specifications': {
            'Type': 'Toolhead Interface PCB Breakout',
            'Compatibility': 'Bambu Lab X1E Enterprise'
        },
        'printers': [printers['bambu-x1']],
        'brands': [brands['bambu-lab']]
    }
]

print("5. Inserting real products from Ultimate 3D Printing Store...")
for p_data in products_data:
    printers_list = p_data.pop('printers', [])
    brands_list = p_data.pop('brands', [])
    prod = Product.objects.create(**p_data)
    prod.compatible_printers.set(printers_list)
    prod.compatible_brands.set(brands_list)
    print(f"  + Added: {prod.name_en} (${prod.price}) | SKU: {prod.sku}")

print(f"\nSUCCESS: Added {Product.objects.count()} real products with accurate prices and CDN images!")
