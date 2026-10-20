import urllib.request
import json
import re

url = 'https://ultimate3dprintingstore.com/collections/3d-printer-parts/products.json?limit=30'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode('utf-8'))

products = data.get('products', [])
print(f"Scraped {len(products)} products from Ultimate 3D Printing Store!")

items = []
for p in products:
    title = p['title']
    price = p['variants'][0]['price']
    sku = p['variants'][0].get('sku') or f"U3D-{p['id']}"
    img = p['images'][0]['src'] if p.get('images') else ''
    body_html = p.get('body_html', '')
    clean_desc = re.sub(r'<[^>]+>', ' ', body_html).strip()
    clean_desc = ' '.join(clean_desc.split())[:200]
    items.append({
        'title': title,
        'price': price,
        'sku': sku,
        'img': img,
        'desc': clean_desc
    })

with open('scraped_items.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print("Saved to scraped_items.json successfully!")
