import React, { useState, useEffect } from 'react';
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
  BarChart3,
  Globe,
  Monitor,
  Smartphone
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [userActivities, setUserActivities] = useState([]);

  useEffect(() => {
    // Fetch user activities
    const fetchUserActivities = async () => {
      try {
        const response = await axios.get('/api/admin/user-activities', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        setUserActivities(response.data.activities);
      } catch (error) {
        console.error('Failed to fetch user activities:', error);
      }
    };

    fetchUserActivities();
  }, []);

  const stats = [
    { label: 'Total Users', value: '2,847', icon: Users, change: '+12%' },
    { label: 'Active Vaults', value: '1,234', icon: Lock, change: '+5%' },
    { label: 'Storage Used', value: '4.2 TB', icon: FolderLock, change: '+8%' },
    { label: 'Security Score', value: '98%', icon: Shield, change: '+2%' },
  ];

  // Map activity types to readable labels and colors
  const activityTypeStyles = {
    'LOGIN': { label: 'Login', color: 'text-green-600' },
    'LOGOUT': { label: 'Logout', color: 'text-red-600' },
    'REGISTRATION': { label: 'Registration', color: 'text-blue-600' },
    'PASSWORD_CHANGE': { label: 'Password Change', color: 'text-yellow-600' },
    'EMAIL_VERIFICATION': { label: 'Email Verification', color: 'text-purple-600' },
    'OTP_LOGIN': { label: 'OTP Login', color: 'text-indigo-600' }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar and header remain the same as previous implementation */}
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Existing Stats Grid */}
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

        {/* User Activities Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent User Activities</h2>
            <button className="text-[#1a237e] hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {userActivities.map((activity, index) => {
              const activityStyle = activityTypeStyles[activity.action] || { 
                label: activity.action, 
                color: 'text-gray-600' 
              };
              
              return (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center space-x-4">
                    {/* Action Type Icon */}
                    <div className={`${activityStyle.color} p-2 rounded-full bg-opacity-10`}>
                      {activity.action === 'LOGIN' && <Monitor className="h-5 w-5" />}
                      {activity.action === 'LOGOUT' && <Smartphone className="h-5 w-5" />}
                      {activity.action === 'REGISTRATION' && <Users className="h-5 w-5" />}
                      {activity.device.deviceType === 'Mobile' && <Smartphone className="h-5 w-5" />}
                      {activity.device.deviceType === 'Desktop' && <Monitor className="h-5 w-5" />}
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.email}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className={`${activityStyle.color} font-semibold`}>
                          {activityStyle.label}
                        </span>
                        <span>•</span>
                        <span>{activity.device.browser} on {activity.device.os}</span>
                        <span>•</span>
                        <span>{activity.location?.city}, {activity.location?.country}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;