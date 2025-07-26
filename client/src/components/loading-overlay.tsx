import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
}

export default function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <Loader2 className="animate-spin h-16 w-16 text-primary mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900">Getting your location...</p>
        <p className="text-sm text-gray-600 mt-1">This may take a few seconds</p>
      </div>
    </div>
  );
}
