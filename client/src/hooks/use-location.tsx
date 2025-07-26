import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LocationData } from "@shared/schema";

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | undefined>();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const { toast } = useToast();

  const geocodeMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest("POST", "/api/geocode", { address });
      return response.json();
    },
    onSuccess: (data) => {
      const locationData: LocationData = {
        coordinates: data.coordinates,
        address: data.address,
        timestamp: new Date().toISOString(),
      };
      setCurrentLocation(locationData);
      toast({
        title: "Location found",
        description: `Found coordinates for the search query`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search failed",
        description: error.message || "Could not find the specified location",
        variant: "destructive",
      });
    },
  });

  const reverseGeocodeMutation = useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      const response = await apiRequest("POST", "/api/reverse-geocode", { latitude, longitude });
      return response.json();
    },
  });

  const ipLookupMutation = useMutation({
    mutationFn: async (ip?: string) => {
      const response = await apiRequest("POST", "/api/ip-lookup", { ip });
      return response.json();
    },
  });

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        const locationData: LocationData = {
          coordinates,
          timestamp: new Date().toISOString(),
        };

        setCurrentLocation(locationData);

        // Get address for coordinates
        try {
          const addressData = await reverseGeocodeMutation.mutateAsync({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          });
          
          setCurrentLocation(prev => ({
            ...prev!,
            address: addressData.address,
          }));
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        }

        // Get IP information
        try {
          const ipData = await ipLookupMutation.mutateAsync(undefined);
          setCurrentLocation(prev => ({
            ...prev!,
            ipInfo: ipData.ipInfo,
          }));
        } catch (error) {
          console.error("IP lookup failed:", error);
        }

        toast({
          title: "Location updated",
          description: "Your current location has been found",
        });
      },
      (error) => {
        let message = "Failed to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location services.";
            setShowPermissionModal(true);
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }

        toast({
          title: "Location error",
          description: message,
          variant: "destructive",
        });

        // Fallback to IP-based location
        ipLookupMutation.mutate(undefined);
      },
      options
    );
  }, [toast, reverseGeocodeMutation, ipLookupMutation]);

  const searchLocation = useCallback((query: string) => {
    // Check if query looks like coordinates
    const coordRegex = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    if (coordRegex.test(query)) {
      const [lat, lng] = query.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        const coordinates = { latitude: lat, longitude: lng };
        const locationData: LocationData = {
          coordinates,
          timestamp: new Date().toISOString(),
        };
        setCurrentLocation(locationData);

        // Get address for coordinates
        reverseGeocodeMutation.mutate({ latitude: lat, longitude: lng });
        return;
      }
    }

    // Otherwise treat as address
    geocodeMutation.mutate(query);
  }, [geocodeMutation, reverseGeocodeMutation]);

  return {
    currentLocation,
    isLoading: geocodeMutation.isPending || reverseGeocodeMutation.isPending || ipLookupMutation.isPending,
    error: geocodeMutation.error || reverseGeocodeMutation.error || ipLookupMutation.error,
    getCurrentLocation,
    searchLocation,
    showPermissionModal,
    setShowPermissionModal,
  };
}
