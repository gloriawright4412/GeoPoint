import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
}

export default function PermissionModal({ isOpen, onClose, onAllow }: PermissionModalProps) {
  const handleAllow = () => {
    onAllow();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-primary text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center">Location Access Required</DialogTitle>
          <DialogDescription className="text-center">
            We need access to your location to show your current position on the map and provide accurate coordinates.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex space-x-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Deny
          </Button>
          <Button onClick={handleAllow} className="flex-1 bg-primary hover:bg-blue-700">
            Allow
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
