import { useEffect } from 'react';

export function ProductListSchema({ products }) {
  useEffect(() => {
    if (!products) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": products.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": product.image,
          "brand": {
            "@type": "Brand",
            "name": "Katmandu Shop"
          },
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "NPR",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }
      }))
    };

    // Add the schema to the document head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [products]);

  return null;
}

export function BreadcrumbSchema({ items }) {
  useEffect(() => {
    if (!items) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [items]);

  return null;
}

export function OrganizationSchema() {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Katmandu Shop",
      "url": "https://katmandushop.com",
      "logo": "https://katmandushop.com/katmandu-shop-high-resolution-logo.png",
      "description": "Authentic Nepali fashion and accessories store offering traditional and modern clothing.",
      "sameAs": [
        "https://facebook.com/katmandushop",
        "https://instagram.com/katmandushop"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
