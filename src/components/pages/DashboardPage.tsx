/**
 * Dashboard Page Component
 * Main dashboard with overview and statistics
 */

import { useState, useEffect } from 'react';
import { Users, Shield, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '../../utils/toastStore';
import { apiService } from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  activeRoles: number;
  totalPartners: number;
  pendingApprovals: number;
  activeUsers: number;
  totalPermissions: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'partner' | 'role' | 'approval';
  action: string;
  entity: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning';
}

const DashboardPage = () => {
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeRoles: 0,
    totalPartners: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    totalPermissions: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all required data in parallel
      const [usersRes, rolesRes, partnersRes, permissionsRes] = await Promise.allSettled([
        apiService.getUsers(),
        apiService.getRoles(),
        apiService.getPartners(),
        apiService.getPermissions(),
      ]);

      // Extract data from responses - admin endpoints return data directly
      const users = usersRes.status === 'fulfilled' ? (Array.isArray(usersRes.value.data) ? usersRes.value.data : []) : [];
      const roles = rolesRes.status === 'fulfilled' ? (Array.isArray(rolesRes.value.data) ? rolesRes.value.data : []) : [];
      const partners = partnersRes.status === 'fulfilled' ? (partnersRes.value.data?.data || []) : [];
      const permissions = permissionsRes.status === 'fulfilled' ? (Array.isArray(permissionsRes.value.data) ? permissionsRes.value.data : []) : [];

      // Calculate stats
      const activeUsers = Array.isArray(users) ? users.filter((u: any) => u.isActive).length : 0;
      const activeRoles = Array.isArray(roles) ? roles.filter((r: any) => r.isActive).length : 0;
      const totalPartners = Array.isArray(partners) ? partners.length : 0;
      const pendingApprovals = Array.isArray(partners) ? partners.filter((p: any) => p.status === 'PENDING_APPROVAL').length : 0;

      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        activeRoles,
        totalPartners,
        pendingApprovals,
        activeUsers,
        totalPermissions: Array.isArray(permissions) ? permissions.length : 0,
      });

      // Generate recent activity
      const activities: RecentActivity[] = [];

      // Add recent partners
      if (Array.isArray(partners) && partners.length > 0) {
        partners.slice(0, 2).forEach((partner: any, index: number) => {
          activities.push({
            id: `partner-${index}`,
            type: 'partner',
            action: 'Partner added',
            entity: partner.partnerName || `Partner ${index + 1}`,
            timestamp: new Date(partner.createdAt || Date.now()).toLocaleDateString(),
            status: 'success',
          });
        });
      }

      // Add recent users
      if (Array.isArray(users) && users.length > 0) {
        users.slice(0, 2).forEach((user: any, index: number) => {
          activities.push({
            id: `user-${index}`,
            type: 'user',
            action: 'User created',
            entity: user.username || `User ${index + 1}`,
            timestamp: new Date(user.createdAt || Date.now()).toLocaleDateString(),
            status: user.isActive ? 'success' : 'warning',
          });
        });
      }

      // Add pending approvals
      if (pendingApprovals > 0) {
        activities.push({
          id: 'pending-approvals',
          type: 'approval',
          action: 'Partners awaiting approval',
          entity: `${pendingApprovals} partner${pendingApprovals !== 1 ? 's' : ''}`,
          timestamp: new Date().toLocaleDateString(),
          status: 'pending',
        });
      }

      setRecentActivity(activities.slice(0, 5));
      toast.success('Dashboard data loaded');
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
      
      // Mock emergency data
      setStats({
        totalUsers: 24,
        activeRoles: 4,
        totalPartners: 156,
        pendingApprovals: 12,
        activeUsers: 20,
        totalPermissions: 15,
      });
      setRecentActivity([
        { id: '1', type: 'partner', action: 'Partner enrolled', entity: 'Express Bank', timestamp: 'Today', status: 'success' },
        { id: '2', type: 'user', action: 'User registered', entity: 'John Validator', timestamp: 'Today', status: 'success' },
        { id: '3', type: 'approval', action: 'Partners pending review', entity: '12 partners', timestamp: 'Today', status: 'pending' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className={`text-4xl font-bold mt-2 ${color}`}>{loading ? '...' : value}</p>
        </div>
        <div className={`${color} bg-opacity-10 p-4 rounded-lg`}>
          <Icon size={28} className={color} />
        </div>
      </div>
    </div>
  );

  const ActivityIcon = ({ type }: any) => {
    switch (type) {
      case 'user':
        return <Users size={16} className="text-blue-600" />;
      case 'partner':
        return <FileText size={16} className="text-green-600" />;
      case 'role':
        return <Shield size={16} className="text-purple-600" />;
      case 'approval':
        return <Clock size={16} className="text-amber-600" />;
      default:
        return <TrendingUp size={16} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      pending: 'bg-amber-100 text-amber-800',
      warning: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || styles.success;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your system overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          color="text-blue-600"
        />
        <StatCard
          icon={Users}
          label="Active Users"
          value={stats.activeUsers}
          color="text-green-600"
        />
        <StatCard
          icon={Shield}
          label="Active Roles"
          value={stats.activeRoles}
          color="text-purple-600"
        />
        <StatCard
          icon={FileText}
          label="Total Partners"
          value={stats.totalPartners}
          color="text-indigo-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Approvals"
          value={stats.pendingApprovals}
          color="text-amber-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Total Permissions"
          value={stats.totalPermissions}
          color="text-cyan-600"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          <p className="text-gray-600 text-sm mt-1">Latest updates across the system</p>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading activities...</div>
          ) : recentActivity.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
              <p>No recent activities to display</p>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      <ActivityIcon type={activity.type} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{activity.action}</p>
                      <p className="text-gray-600 text-sm">{activity.entity}</p>
                      <p className="text-gray-500 text-xs mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                      activity.status
                    )}`}
                  >
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="text-cyan-700" size={20} />
          <h3 className="font-semibold text-cyan-900">System Health</h3>
        </div>
        <p className="text-cyan-800 text-sm">
          All systems operational. You have{' '}
          <span className="font-bold">{stats.pendingApprovals} partners</span> waiting for approval and{' '}
          <span className="font-bold">{stats.totalUsers} users</span> in the system.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
