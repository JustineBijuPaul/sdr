import { ChevronRight, Home } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  // Generate structured data for breadcrumbs
  useEffect(() => {
    const breadcrumbStructuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": item.href ? `https://southdelhirealty.com${item.href}` : undefined
      }))
    };

    let script = document.querySelector('#breadcrumb-structured-data') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'breadcrumb-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(breadcrumbStructuredData);

    return () => {
      const existingScript = document.querySelector('#breadcrumb-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [items]);

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
            )}
            
            {index === 0 && (
              <Home className="h-4 w-4 mr-1" />
            )}
            
            {item.href && !item.isActive ? (
              <Link 
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={item.isActive ? "text-foreground font-medium" : ""}
                aria-current={item.isActive ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Utility function to generate breadcrumbs for property pages
export function generatePropertyBreadcrumbs(property?: any) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/properties" }
  ];

  if (property) {
    breadcrumbs.push({
      label: property.title,
      isActive: true
    });
  }

  return breadcrumbs;
}

// Utility function to generate breadcrumbs for filtered property pages
export function generateFilteredPropertyBreadcrumbs(filters: any) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/properties" }
  ];

  if (filters.type) {
    const typeFormatted = filters.type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    breadcrumbs.push({
      label: typeFormatted,
      isActive: true
    });
  } else if (filters.location) {
    const locationFormatted = filters.location.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    breadcrumbs.push({
      label: locationFormatted,
      isActive: true
    });
  }

  return breadcrumbs;
} 