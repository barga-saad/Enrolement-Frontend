/**
 * Dashboard Page Component
 * Main dashboard with overview and statistics
 */

import { BarChart3, Users, Shield, FileText } from 'lucide-react';

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-bcp-brown">Dashboard</h1>
        <p className="text-bcp-grey-text mt-1">Welcome to BCP Enrollment Platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-bcp-grey-text text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-bcp-brown mt-2">24</p>
            </div>
            <div className="bg-gradient-bcp bg-opacity-10 p-3 rounded-lg">
              <Users className="w-6 h-6 text-bcp-orange" />
            </div>
          </div>
        </div>

        {/* Active Roles */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-bcp-grey-text text-sm font-medium">Active Roles</p>
              <p className="text-3xl font-bold text-bcp-brown mt-2">4</p>
            </div>
            <div className="bg-gradient-bcp bg-opacity-10 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-bcp-orange" />
            </div>
          </div>
        </div>

        {/* Total Partners */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-bcp-grey-text text-sm font-medium">Total Partners</p>
              <p className="text-3xl font-bold text-bcp-brown mt-2">156</p>
            </div>
            <div className="bg-gradient-bcp bg-opacity-10 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-bcp-orange" />
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-bcp-grey-text text-sm font-medium">Pending Tasks</p>
              <p className="text-3xl font-bold text-bcp-brown mt-2">12</p>
            </div>
            <div className="bg-gradient-bcp bg-opacity-10 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-bcp-orange" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-base p-6">
        <h2 className="text-lg font-bold text-bcp-brown mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <p className="text-bcp-grey-text text-center py-8">
            No recent activities to display
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
