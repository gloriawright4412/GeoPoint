import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Address } from "@shared/schema";

interface AddressDetailsProps {
  address?: Address;
}

export default function AddressDetails({ address }: AddressDetailsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="text-secondary mr-2 h-5 w-5" />
          Address Details
        </h3>
        
        {address ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Street:</span>
              <span className="font-medium">{address.street || "Not available"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">City:</span>
              <span className="font-medium">{address.city || "Not available"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">State:</span>
              <span className="font-medium">{address.state || "Not available"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ZIP Code:</span>
              <span className="font-medium">{address.zipCode || "Not available"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Country:</span>
              <span className="font-medium">{address.country || "Not available"}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No address information available</p>
            <p className="text-sm">Get your location to see address details</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
