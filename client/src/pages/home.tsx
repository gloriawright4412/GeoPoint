import { useState, useEffect } from "react";
import { MapPin, Search, Navigation, Smartphone, Settings, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "@/hooks/use-location";
import { useAuth } from "@/hooks/useAuth";
import { useTracking } from "@/hooks/useTracking";
import CoordinatesDisplay from "@/components/coordinates-display";
import AddressDetails from "@/components/address-details";
import IpInfo from "@/components/ip-info";
import LocationMap from "@/components/location-map";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    isTracking, 
    startTracking, 
    stopTracking, 
    userStats,
    isRegistering 
  } = useTracking();
  
  const {
    currentLocation,
    isLoading,
    error,
    getCurrentLocation,
    searchLocation,
  } = useLocation();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter an address to search for.",
        variant: "destructive",
      });
      return;
    }

    try {
      await searchLocation(searchTerm);
      toast({
        title: "Location found",
        description: "Successfully found the location on the map.",
      });
    } catch (err) {
      toast({
        title: "Search failed",
        description: "Could not find the specified location. Please try a different address.",
        variant: "destructive",
      });
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      await getCurrentLocation();
      toast({
        title: "Location acquired",
        description: "Successfully retrieved your current location.",
      });
    } catch (err) {
      toast({
        title: "Location error",
        description: "Could not access your current location. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Auto-register device and start tracking when authenticated
  useEffect(() => {
    if (user && !isRegistering) {
      // Auto-start tracking for authenticated users
      const autoTrack = localStorage.getItem('auto-track');
      if (autoTrack !== 'false') {
        startTracking();
      }
    }
  }, [user, isRegistering]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Header with User Info */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Location Tracker Pro
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Tracking Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className={`text-sm font-medium ${isTracking ? 'text-green-600' : 'text-gray-500'}`}>
                  {isTracking ? 'Live Tracking' : 'Offline'}
                </span>
              </div>
              
              {/* Navigation */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Devices</p>
                  <p className="text-xl font-bold">{userStats?.deviceCount || 0}</p>
                </div>
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Locations</p>
                  <p className="text-xl font-bold">{userStats?.locationCount || 0}</p>
                </div>
                <Navigation className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-sm font-bold">
                    {isTracking ? 'Tracking' : 'Stopped'}
                  </p>
                </div>
                <div className={`h-6 w-6 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Control</p>
                  <Button 
                    size="sm"
                    onClick={isTracking ? stopTracking : startTracking}
                    className={isTracking ? 
                      'bg-red-600 hover:bg-red-700 text-white' : 
                      'bg-green-600 hover:bg-green-700 text-white'
                    }
                  >
                    {isTracking ? 'Stop' : 'Start'}
                  </Button>
                </div>
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Location Search & Analysis
            </CardTitle>
            <CardDescription>
              Search for any location, analyze IP addresses, or track current position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter address, coordinates, or IP address (e.g., 123 Main St, 40.7128,-74.0060, or 8.8.8.8)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={handleGetCurrentLocation}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Current Location
                </Button>

                <Button
                  variant={isTracking ? "destructive" : "default"}
                  onClick={isTracking ? stopTracking : startTracking}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Status */}
        {isRegistering && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                <span>Initializing device tracking system...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <Badge variant="destructive">Error</Badge>
                <span>{typeof error === 'string' ? error : 'An error occurred'}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                <span>Processing location data...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Enhanced Map */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Interactive Tracking Map
                </div>
                {currentLocation && (
                  <Badge variant="outline" className="text-green-600">
                    Live Data
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 rounded-lg overflow-hidden">
                <LocationMap location={currentLocation} />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Details Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="coordinates" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="coordinates">GPS Data</TabsTrigger>
                <TabsTrigger value="address">Address Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="coordinates" className="mt-4">
                <CoordinatesDisplay location={currentLocation} />
              </TabsContent>
              
              <TabsContent value="address" className="mt-4">
                <AddressDetails address={null} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm mb-2">
            Enterprise Location Tracking System • Real-time GPS • Global Coverage
          </p>
          <div className="flex justify-center space-x-4 text-xs">
            <span>Powered by OpenStreetMap</span>
            <span>•</span>
            <span>Advanced IP Geolocation</span>
            <span>•</span>
            <span>Secure Device Fingerprinting</span>
          </div>
        </div>
      </div>
    </div>
  );
}