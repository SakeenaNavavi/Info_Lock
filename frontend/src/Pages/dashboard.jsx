import React, { useState } from 'react';
import { 
  Lock,
  FolderPlus,
  Upload,
  Share2,
  Shield,
  Star,
  Clock,
  Trash2,
  Search,
  MoreVertical,
  FileText,
  Image,
  File,
  Download
} from 'lucide-react';

const UserDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  
  const storageUsed = 75; // percentage

  const recentFiles = [
    { name: 'Tax_Documents_2024.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago', icon: FileText },
    { name: 'Passport_Scan.jpg', type: 'Image', size: '1.8 MB', modified: '1 day ago', icon: Image },
    { name: 'Insurance_Policy.pdf', type: 'PDF', size: '3.2 MB', modified: '2 days ago', icon: FileText },
    { name: 'House_Deed.pdf', type: 'PDF', size: '4.1 MB', modified: '1 week ago', icon: FileText },
  ];

  const quickActions = [
    { icon: FolderPlus, label: 'New Folder', color: 'bg-blue-100 text-blue-600' },
    { icon: Upload, label: 'Upload Files', color: 'bg-green-100 text-green-600' },
    { icon: Share2, label: 'Share Vault', color: 'bg-purple-100 text-purple-600' },
    { icon: Shield, label: 'Security Check', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-[#1a237e] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Lock className="h-6 w-6" />
            <h1 className="text-xl font-bold">My Secure Vault</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, Alex</span>
            <div className="h-8 w-8 bg-blue-400 rounded-full flex items-center justify-center">
              A
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={`${action.color} p-4 rounded-lg flex items-center justify-center space-x-2 transition-transform hover:scale-105`}
            >
              <action.icon className="h-5 w-5" />
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Storage Usage */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Storage Usage</h2>
            <span className="text-sm text-gray-500">75 GB of 100 GB Used</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-[#1a237e] h-2.5 rounded-full"
              style={{ width: `${storageUsed}%` }}
            ></div>
          </div>
        </div>

        {/* Files Section */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tabs */}
          <div className="border-b px-6 py-4">
            <div className="flex space-x-6">
              {[
                { id: 'all', label: 'All Files', icon: File },
                { id: 'starred', label: 'Starred', icon: Star },
                { id: 'recent', label: 'Recent', icon: Clock },
                { id: 'trash', label: 'Trash', icon: Trash2 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 pb-2 px-1 ${
                    selectedTab === tab.id
                      ? 'border-b-2 border-[#1a237e] text-[#1a237e]'
                      : 'text-gray-500'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Upload */}
          <div className="p-6 border-b flex justify-between items-center">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-[#1a237e] text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </button>
          </div>

          {/* Files List */}
          <div className="divide-y">
            {recentFiles.map((file, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded">
                    <file.icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.size} • Modified {file.modified}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Download className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;