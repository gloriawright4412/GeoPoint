import { Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IpInfo as IpInfoType } from "@shared/schema";

interface IpInfoProps {
  ipInfo?: IpInfoType;
}

export default function IpInfo({ ipInfo }: IpInfoProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="text-accent mr-2 h-5 w-5" />
          Network Information
        </h3>
        
        {ipInfo ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">IP Address:</span>
              <span className="font-mono text-sm">{ipInfo.ip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ISP:</span>
              <span className="font-medium">{ipInfo.isp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timezone:</span>
              <span className="font-medium">{ipInfo.timezone}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Globe className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No network information available</p>
            <p className="text-sm">Get your location to see IP details</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
