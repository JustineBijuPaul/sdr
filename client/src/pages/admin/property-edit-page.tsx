import { useParams } from "wouter";
import Sidebar from "@/components/admin/sidebar";
import PropertyForm from "@/components/admin/property-form";

export default function PropertyEditPage() {
  const params = useParams();
  const propertyId = params.id ? parseInt(params.id) : undefined;
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 p-8 lg:pl-72">
        <div className="max-w-5xl mx-auto">
          <PropertyForm propertyId={propertyId} />
        </div>
      </div>
    </div>
  );
}
