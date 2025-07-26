import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  Users, 
  Smartphone, 
  MapPin, 
  Activity, 
  Search,
  Eye,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");

  // Admin statistics
  const { data: adminStats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  // Users list
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Devices list
  const { data: devices } = useQuery({
    queryKey: ["/api/admin/devices"],
  });

  // Real-time locations
  const { data: realtimeLocations } = useQuery({
    queryKey: ["/api/admin/locations/realtime"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-red-600 text-white p-2 rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-500">System-wide monitoring and management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-600">Live Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Devices</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats?.activeDevices || 0}</p>
                </div>
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Location Pings</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats?.totalLocations || 0}</p>
                </div>
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Threat Level</p>
                  <p className="text-2xl font-bold text-gray-900">Low</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users, devices, or IP addresses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Search type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="device">Devices</SelectItem>
                  <SelectItem value="ip">IP Addresses</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Tabs */}
        <Tabs defaultValue="realtime" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="realtime">Real-time Activity</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="devices">Device Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="realtime" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Location Updates</span>
                  <Badge variant="default" className="bg-green-600">
                    <Activity className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {realtimeLocations?.slice(0, 10).map((location: any) => (
                    <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {parseFloat(location.latitude).toFixed(6)}, {parseFloat(location.longitude).toFixed(6)}
                          </p>
                          <p className="text-sm text-gray-600">
                            User: {location.user?.email} • Device: {location.device?.deviceModel || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(location.createdAt).toLocaleString()} • IP: {location.ipAddress}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-green-600">
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
                  
                  {(!realtimeLocations || realtimeLocations.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      No real-time location data available.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-gray-500">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={user.isAdmin ? "default" : "secondary"}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Devices: {user.deviceCount || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!users || users.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      No users found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Device Registry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices?.map((device: any) => (
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
                            Owner: {device.user?.email} • IP: {device.ipAddress}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={device.isActive ? "default" : "secondary"}>
                          {device.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Last seen: {new Date(device.lastSeenAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!devices || devices.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      No devices found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total API Calls</span>
                      <span className="font-bold">{adminStats?.apiCalls || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Response Time</span>
                      <span className="font-bold">{adminStats?.avgResponseTime || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database Queries</span>
                      <span className="font-bold">{adminStats?.dbQueries || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate</span>
                      <span className="font-bold text-green-600">0.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Security Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Proxy Connections</span>
                      <span className="font-bold text-orange-600">{adminStats?.proxyConnections || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VPN Connections</span>
                      <span className="font-bold text-orange-600">{adminStats?.vpnConnections || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blocked IPs</span>
                      <span className="font-bold text-red-600">{adminStats?.blockedIps || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Threat Level</span>
                      <Badge variant="outline" className="text-green-600">Low</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}