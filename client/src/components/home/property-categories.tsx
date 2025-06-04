import { Link } from "wouter";

interface CategoryItem {
  title: string;
  image: string;
  link: string;
}

const categories: CategoryItem[] = [
  {
    title: 'Residential Sale',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    link: '/properties?category=residential&status=sale'
  },
  {
    title: 'Residential Rent',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    link: '/properties?category=residential&status=rent'
  },
  {
    title: 'Commercial Sale',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    link: '/properties?category=commercial&status=sale'
  },
  {
    title: 'Commercial Rent',
    image: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    link: '/properties?category=commercial&status=rent'
  }
];

export default function PropertyCategories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">Browse By Category</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={index} href={category.link} className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition relative h-80">
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 tex justify-center">
                    <h3 className="text-xl font-bold text-white mb-1 text-center justify-center">{category.title}</h3>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
