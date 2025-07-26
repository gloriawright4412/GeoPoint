import { Copy, Crosshair } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Coordinates } from "@shared/schema";
import { formatCoordinatesDMS } from "@/lib/geo-utils";

interface CoordinatesDisplayProps {
  coordinates?: Coordinates;
}

export default function CoordinatesDisplay({ coordinates }: CoordinatesDisplayProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${format} coordinates copied to clipboard`,
      });
    });
  };

  const ddCoordinates = coordinates 
    ? `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
    : "Not available";

  const dmsCoordinates = coordinates
    ? formatCoordinatesDMS(coordinates.latitude, coordinates.longitude)
    : "Not available";

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Crosshair className="text-primary mr-2 h-5 w-5" />
          GPS Coordinates
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Decimal Degrees (DD)</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg font-mono text-sm flex items-center justify-between">
              <span>{ddCoordinates}</span>
              {coordinates && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(ddCoordinates, "DD")}
                  className="text-primary hover:text-blue-700 p-1"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Degrees, Minutes, Seconds (DMS)</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg font-mono text-sm flex items-center justify-between">
              <span>{dmsCoordinates}</span>
              {coordinates && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(dmsCoordinates, "DMS")}
                  className="text-primary hover:text-blue-700 p-1"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {coordinates?.accuracy && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Accuracy: ±{Math.round(coordinates.accuracy)} meters</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
