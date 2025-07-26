import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getDeviceInfo, getMacAddress, getIMEI } from "@/lib/device-fingerprint";
import { useAuth } from "@/hooks/useAuth";

export function useTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Register device on auth
  const deviceRegistrationMutation = useMutation({
    mutationFn: async () => {
      const deviceInfo = getDeviceInfo();
      const macAddress = await getMacAddress();
      const imei = await getIMEI();
      
      const response = await apiRequest("POST", "/api/device/register", {
        ...deviceInfo,
        macAddress,
        imei,
        appVersion: "1.0.0",
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Device registered:", data);
      localStorage.setItem("deviceFingerprint", data.fingerprint);
    },
    onError: (error) => {
      console.error("Device registration failed:", error);
    },
  });

  // Location tracking mutation
  const locationTrackingMutation = useMutation({
    mutationFn: async (locationData: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      altitude?: number;
      speed?: number;
      heading?: number;
    }) => {
      const response = await apiRequest("POST", "/api/location/track", {
        ...locationData,
        trackingMethod: "gps",
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Location tracked:", data);
    },
    onError: (error) => {
      console.error("Location tracking failed:", error);
    },
  });

  // Get user devices
  const { data: userDevices } = useQuery({
    queryKey: ["/api/user/devices"],
    enabled: isAuthenticated,
  });

  // Get user locations
  const { data: userLocations } = useQuery({
    queryKey: ["/api/user/locations"],
    enabled: isAuthenticated,
  });

  // Get user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated,
  });

  // Start tracking
  const startTracking = useCallback(() => {
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
      maximumAge: 30000, // Cache position for 30 seconds
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
        };

        if (isAuthenticated) {
          locationTrackingMutation.mutate(locationData);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Location error",
          description: "Failed to get your location",
          variant: "destructive",
        });
        setIsTracking(false);
      },
      options
    );

    setWatchId(id);
    setIsTracking(true);
    
    toast({
      title: "Tracking started",
      description: "Your location is now being tracked",
    });
  }, [isAuthenticated, locationTrackingMutation, toast]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    
    toast({
      title: "Tracking stopped",
      description: "Location tracking has been disabled",
    });
  }, [watchId, toast]);

  // Register device when authenticated
  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem("deviceFingerprint")) {
      deviceRegistrationMutation.mutate();
    }
  }, [isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    isTracking,
    startTracking,
    stopTracking,
    userDevices,
    userLocations,
    userStats,
    isRegistering: deviceRegistrationMutation.isPending,
    isLocationTracking: locationTrackingMutation.isPending,
  };
}