/**
 * Dashboard Page Component
 * Main dashboard with overview and statistics (role-based)
 */

import { useState, useEffect } from 'react';
import { Users, Shield, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '../../utils/toastStore';
import { useAuth } from '../../hooks';
import { apiService } from '../../services/api';

interface DashboardStats {
  totalUsers?: number;
  activeRoles?: number;
  totalPartners?: number;
  pendingApprovals?: number;
  activeUsers?: number;
  totalPermissions?: number;
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
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  const isAdmin = user?.roleNames?.some(
    (role) => role.toUpperCase() === 'ADMIN' || role.toUpperCase().includes('ADMIN')
  ) || false;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        // Admin sees all data
        const [usersRes, rolesRes, partnersRes, permissionsRes] = await Promise.allSettled([
          apiService.getUsers(),
          apiService.getRoles(),
          apiService.getPartners(),
          apiService.getPermissions(),
        ]);

        const users = usersRes.status === 'fulfilled' ? (Array.isArray(usersRes.value.data) ? usersRes.value.data : []) : [];
        const roles = rolesRes.status === 'fulfilled' ? (Array.isArray(rolesRes.value.data) ? rolesRes.value.data : []) : [];
        const partners = partnersRes.status === 'fulfilled' ? (partnersRes.value.data?.data || []) : [];
        const permissions = permissionsRes.status === 'fulfilled' ? (Array.isArray(permissionsRes.value.data) ? permissionsRes.value.data : []) : [];

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

        // Generate activities
        const activities: RecentActivity[] = [];
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
        if (Array.isArray(users) && users.length > 0) {
          users.slice(0, 2).forEach((u: any, index: number) => {
            activities.push({
              id: `user-${index}`,
              type: 'user',
              action: 'User created',
              entity: u.username || `User ${index + 1}`,
              timestamp: new Date(u.createdAt || Date.now()).toLocaleDateString(),
              status: u.isActive ? 'success' : 'warning',
            });
          });
        }
        setRecentActivity(activities.slice(0, 5));
      } else {
        // Non-admin users only see partner stats
        try {
          const partnersRes = await apiService.getPartners();
          const partners = partnersRes.data?.data || [];
          setStats({
            totalPartners: Array.isArray(partners) ? partners.length : 0,
            pendingApprovals: Array.isArray(partners) ? partners.filter((p: any) => p.status === 'PENDING_APPROVAL').length : 0,
          });

          const activities: RecentActivity[] = [];
          if (Array.isArray(partners) && partners.length > 0) {
            partners.slice(0, 3).forEach((partner: any, index: number) => {
              activities.push({
                id: `partner-${index}`,
                type: 'partner',
                action: 'Partner',
                entity: partner.partnerName || `Partner ${index + 1}`,
                timestamp: new Date(partner.createdAt || Date.now()).toLocaleDateString(),
                status: 'success',
              });
            });
          }
          setRecentActivity(activities);
        } catch (error) {
          console.error('Error loading partner data:', error);
        }
      }

      toast.success('Dashboard loaded');
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const ROLE_LABELS: Record<string, string> = {
    PROFIL_ADMIN_CENTRAL: 'Admin Central',
    PROFIL_SAISIE: 'Saisie',
    PROFIL_VALIDATEUR: 'Validateur',
    PROFIL_CONSULTATION: 'Consultation',
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{loading ? '...' : (value ?? 0)}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bcp-orange/10 to-bcp-brown/10 flex items-center justify-center">
          <Icon size={24} className="text-bcp-brown" />
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
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          {user?.roleNames?.[0] && (
            <span className="px-3 py-1 bg-bcp-orange/10 text-bcp-brown text-xs font-semibold rounded-lg border border-bcp-orange/20">
              {ROLE_LABELS[user.roleNames[0]] || user.roleNames[0]}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.firstName || 'User'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
        {isAdmin && (
          <>
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="text-blue-600" />
            <StatCard icon={Users} label="Active Users" value={stats.activeUsers} color="text-green-600" />
            <StatCard icon={Shield} label="Active Roles" value={stats.activeRoles} color="text-purple-600" />
          </>
        )}
        <StatCard icon={FileText} label="Total Partners" value={stats.totalPartners} color="text-indigo-600" />
        <StatCard icon={Clock} label="Pending Approvals" value={stats.pendingApprovals} color="text-amber-600" />
        {isAdmin && <StatCard icon={CheckCircle} label="Total Permissions" value={stats.totalPermissions} color="text-cyan-600" />}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800">
            {isAdmin ? 'Recent Activity' : 'Your Partners'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {isAdmin ? 'Latest updates across the system' : 'Partners you can manage'}
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : recentActivity.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
              <p>{isAdmin ? 'No recent activities' : 'No partners to display'}</p>
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
                  {isAdmin && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(activity.status)}`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl p-6 border border-bcp-orange/20 bg-gradient-to-r from-bcp-orange/5 to-bcp-brown/5">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-bcp-brown" size={20} />
          <h3 className="font-semibold text-bcp-brown">
            {isAdmin ? 'Administration' : 'Votre Profil'}
          </h3>
        </div>
        <p className="text-bcp-brown/80 text-sm">
          {isAdmin 
            ? 'Vous avez un accès complet à la gestion des utilisateurs, rôles et permissions.'
            : `Profil: ${ROLE_LABELS[user?.roleNames?.[0] || ''] || user?.roleNames?.[0] || 'Aucun rôle'}. Gérez les partenaires selon vos permissions.`}
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
