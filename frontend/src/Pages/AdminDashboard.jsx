import React from 'react';
import { 
  Lock, 
  Users, 
  Activity, 
  Shield, 
  Settings, 
  Bell,
  Search,
  FileText,
  FolderLock,
  BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Users', value: '2,847', icon: Users, change: '+12%' },
    { label: 'Active Vaults', value: '1,234', icon: Lock, change: '+5%' },
    { label: 'Storage Used', value: '4.2 TB', icon: FolderLock, change: '+8%' },
    { label: 'Security Score', value: '98%', icon: Shield, change: '+2%' },
  ];

  const recentActivity = [
    { user: 'Sarah Chen', action: 'Created new vault', time: '2 mins ago' },
    { user: 'Mike Johnson', action: 'Updated security key', time: '15 mins ago' },
    { user: 'Emma Davis', action: 'Shared vault access', time: '1 hour ago' },
    { user: 'Alex Kim', action: 'Added new documents', time: '2 hours ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-[#1a237e] text-white p-4">
        <div className="flex items-center mb-8">
          <Lock className="h-8 w-8" />
          <h1 className="text-xl font-bold ml-2">SecureVault</h1>
        </div>
        
        <nav className="space-y-2">
          {[
            { icon: Activity, label: 'Dashboard' },
            { icon: FolderLock, label: 'Vaults' },
            { icon: Users, label: 'Users' },
            { icon: FileText, label: 'Documents' },
            { icon: BarChart3, label: 'Analytics' },
            { icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.label}
              className="flex items-center w-full p-3 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="ml-3">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search vaults, users, or documents..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button className="p-2 relative mx-4">
            <Bell className="h-6 w-6 text-gray-600" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="h-6 w-6 text-[#1a237e]" />
                <span className="text-green-500 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-gray-500 text-sm">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-[#1a237e] hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;