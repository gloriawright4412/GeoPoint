import { useState } from "react";
import { MapPin, Smartphone, Navigation, Clock, Settings, LogOut, Shield, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useTracking } from "@/hooks/useTracking";

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    isTracking, 
    startTracking, 
    stopTracking, 
    userDevices, 
    userLocations, 
    userStats 
  } = useTracking();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.firstName || user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className={`text-sm font-medium ${isTracking ? 'text-green-600' : 'text-gray-500'}`}>
                  {isTracking ? 'Live Tracking' : 'Offline'}
                </span>
              </div>
              
              {user?.isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/admin'}
                  className="flex items-center space-x-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              )}
              
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Devices</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats?.deviceCount || 0}</p>
                </div>
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Location Records</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats?.locationCount || 0}</p>
                </div>
                <Navigation className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tracking Status</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isTracking ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <Activity className={`h-8 w-8 ${isTracking ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Update</p>
                  <p className="text-sm font-bold text-gray-900">
                    {userStats?.lastLocation ? 
                      new Date(userStats.lastLocation.createdAt).toLocaleString() : 
                      'Never'
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Control */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">
                  {isTracking ? 
                    'Your location is being tracked in real-time. You can stop tracking at any time.' :
                    'Start tracking to monitor your device location and collect analytics data.'
                  }
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant={isTracking ? "default" : "secondary"}>
                    {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={isTracking ? stopTracking : startTracking}
                className={isTracking ? 
                  'bg-red-600 hover:bg-red-700' : 
                  'bg-green-600 hover:bg-green-700'
                }
              >
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for detailed data */}
        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="devices">My Devices</TabsTrigger>
            <TabsTrigger value="locations">Location History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registered Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userDevices?.map((device: any) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{device.deviceModel || 'Unknown Device'}</p>
                          <p className="text-sm text-gray-500">
                            {device.platform} • {device.browser}
                          </p>
                          <p className="text-xs text-gray-400">
                            Last seen: {new Date(device.lastSeenAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={device.isActive ? "default" : "secondary"}>
                          {device.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          IP: {device.ipAddress}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!userDevices || userDevices.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      No devices registered yet. Start tracking to register this device.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userLocations?.slice(0, 10).map((location: any) => (
                    <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Navigation className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {parseFloat(location.latitude).toFixed(6)}, {parseFloat(location.longitude).toFixed(6)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {location.address || 'Address not available'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(location.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {location.trackingMethod || 'GPS'}
                        </Badge>
                        {location.accuracy && (
                          <p className="text-xs text-gray-500 mt-1">
                            ±{parseFloat(location.accuracy).toFixed(0)}m
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!userLocations || userLocations.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      No location data yet. Start tracking to collect location history.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Account Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Email:</span> {user?.email}</p>
                      <p><span className="font-medium">Name:</span> {user?.firstName || 'Not set'} {user?.lastName || ''}</p>
                      <p><span className="font-medium">Account Type:</span> {user?.isAdmin ? 'Administrator' : 'User'}</p>
                      <p><span className="font-medium">Member since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Privacy Settings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Real-time location tracking</span>
                        <Badge variant={isTracking ? "default" : "secondary"}>
                          {isTracking ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Device fingerprinting</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>IP tracking</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}