import { Shield, MapPin, Smartphone, Globe2, Users, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const features = [
    {
      icon: MapPin,
      title: "Real-time GPS Tracking",
      description: "Track device locations worldwide with high precision GPS coordinates and address resolution.",
      color: "bg-blue-500",
    },
    {
      icon: Smartphone,
      title: "Device Fingerprinting",
      description: "Comprehensive device identification including IP, MAC addresses, and hardware signatures.",
      color: "bg-green-500",
    },
    {
      icon: Globe2,
      title: "Global IP Analysis",
      description: "Advanced IP geolocation with ISP detection, proxy identification, and threat analysis.",
      color: "bg-purple-500",
    },
    {
      icon: Users,
      title: "Multi-device Management",
      description: "Track multiple devices per user account with detailed historical data and analytics.",
      color: "bg-orange-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive dashboards with location patterns, device usage, and security insights.",
      color: "bg-red-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Production-ready with admin controls, audit logs, and comprehensive security features.",
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl">
                <MapPin className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Location Tracker Pro
              </h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Location Tracking
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Enterprise-grade location tracking system with real-time GPS monitoring, 
              device fingerprinting, and comprehensive analytics. Track any device, 
              anywhere in the world with precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg"
              >
                Get Started Free
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 hover:border-blue-600 px-8 py-4 text-lg"
              >
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Powerful Tracking Features
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need for comprehensive location tracking and device monitoring
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-8">
                      <div className={`${feature.color} text-white p-4 rounded-2xl w-fit mb-6`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold mb-4">
                Trusted by Organizations Worldwide
              </h3>
              <p className="text-xl text-blue-100">
                Production-ready system with enterprise-grade reliability
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">99.9%</div>
                <div className="text-blue-100">Uptime</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">Global</div>
                <div className="text-blue-100">Coverage</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">Real-time</div>
                <div className="text-blue-100">Tracking</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">Secure</div>
                <div className="text-blue-100">Platform</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Start Tracking?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of organizations using our platform for professional location tracking
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 text-lg"
            >
              Sign In to Get Started
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl">
                  <MapPin className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold">Location Tracker Pro</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Enterprise-grade location tracking and device monitoring platform.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Features</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Real-time GPS Tracking</li>
                <li>Device Fingerprinting</li>
                <li>IP Geolocation</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Platform</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Web Application</li>
                <li>Mobile Support</li>
                <li>API Access</li>
                <li>Admin Panel</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Security</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Enterprise Authentication</li>
                <li>Audit Logs</li>
                <li>Data Encryption</li>
                <li>Privacy Controls</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Location Tracker Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}