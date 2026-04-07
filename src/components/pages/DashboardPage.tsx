import { useState, useEffect } from 'react';
import { Users, Shield, FileText, TrendingUp, Clock, CheckCircle, ArrowUpRight, Activity, Calendar } from 'lucide-react';
import { useToast } from '../../utils/toastStore';
import { useAuth } from '../../hooks';
import { apiService } from '../../services/api';
import { useLangStore, t } from '../../utils/langStore';

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
  const { lang: _lang } = useLangStore();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

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

        const activities: RecentActivity[] = [];
        if (Array.isArray(partners) && partners.length > 0) {
          partners.slice(0, 2).forEach((partner: any, index: number) => {
            activities.push({
              id: `partner-${index}`,
              type: 'partner',
              action: t('Profil Partenaire Créé', 'Partner Profile Created'),
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
              action: t('Nouvel Utilisateur Enregistré', 'New User Registered'),
              entity: u.username || `User ${index + 1}`,
              timestamp: new Date(u.createdAt || Date.now()).toLocaleDateString(),
              status: u.isActive ? 'success' : 'warning',
            });
          });
        }
        setRecentActivity(activities.slice(0, 5));
      } else {
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
                action: t('Révision Partenaire', 'Partner Review'),
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
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error(t('Échec de la synchronisation des métriques', 'Failed to sync dashboard metrics'));
    } finally {
      setLoading(false);
    }
  };

  const ROLE_LABELS: Record<string, string> = {
    PROFIL_ADMIN_CENTRAL: t('Admin Central', 'Central Admin'),
    PROFIL_SAISIE: t('Saisie', 'Data Entry'),
    PROFIL_VALIDATEUR: t('Validateur', 'Validator'),
    PROFIL_CONSULTATION: t('Consultation', 'Consultation'),
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
    <div className="card-base p-6 group hover:border-bcp-orange/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-bcp-orange/5 to-transparent rounded-bl-[4rem] transition-all duration-500 group-hover:w-32 group-hover:h-32" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-gray-500 dark:text-dark-text-dim text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className={`text-3xl font-black ${color}`}>
              {loading ? <div className="w-12 h-8 bg-gray-100 dark:bg-dark-bg-soft animate-pulse rounded-lg" /> : (value ?? 0)}
            </h3>
            {trend && (
              <span className="text-[10px] font-bold text-green-500 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${color.replace('text-', 'bg-').replace('-600', '-50 dark:bg-opacity-10')}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );

  const ActivityIcon = ({ type }: any) => {
    switch (type) {
      case 'user':
        return <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl"><Users size={18} className="text-blue-600 dark:text-blue-400" /></div>;
      case 'partner':
        return <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl"><FileText size={18} className="text-green-600 dark:text-green-400" /></div>;
      case 'role':
        return <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl"><Shield size={18} className="text-purple-600 dark:text-purple-400" /></div>;
      case 'approval':
        return <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl"><Clock size={18} className="text-amber-600 dark:text-amber-400" /></div>;
      default:
        return <div className="p-2 bg-gray-50 dark:bg-gray-500/10 rounded-xl"><TrendingUp size={18} className="text-gray-600 dark:text-gray-400" /></div>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-[2rem] bg-bcp-orange flex items-center justify-center shadow-xl shadow-bcp-orange/20 animate-float">
            <Activity className="text-white w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('Vue d\'ensemble', 'Overview')}</h1>
              <span className="px-3 py-1 bg-bcp-orange/10 text-bcp-orange text-[10px] font-black uppercase tracking-widest rounded-full border border-bcp-orange/20">
                {ROLE_LABELS[user?.roleNames?.[0] || ''] || user?.roleNames?.[0]}
              </span>
            </div>
            <p className="text-gray-500 dark:text-dark-text-dim text-sm font-medium mt-0.5 flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" />
              {t('Analyses d\'efficacité pour', 'Efficiency analytics for')} {user?.firstName || 'User'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-white dark:bg-dark-bg-soft border border-gray-100 dark:border-dark-border rounded-xl text-xs font-bold text-gray-600 dark:text-dark-text-dim hover:border-bcp-orange transition-all flex items-center space-x-2 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t('Actualiser Sync', 'Refresh Sync')}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
        {isAdmin && (
          <>
            <StatCard icon={Users} label={t('Utilisateurs Globaux', 'Global Users')} value={stats.totalUsers} color="text-blue-600" trend="+12%" />
            <StatCard icon={CheckCircle} label={t('Utilisateurs Actifs', 'Active Users')} value={stats.activeUsers} color="text-green-600" trend="+8%" />
            <StatCard icon={Shield} label={t('Rôles Personnalisés', 'Custom Roles')} value={stats.activeRoles} color="text-purple-600" />
          </>
        )}
        <StatCard icon={FileText} label={t('Partenaires Enregistrés', 'Registered Partners')} value={stats.totalPartners} color="text-indigo-600" trend="+15%" />
        <StatCard icon={Clock} label={t('En Attente d\'Approbation', 'Awaiting Approval')} value={stats.pendingApprovals} color="text-amber-600" />
        {isAdmin && <StatCard icon={Shield} label={t('Permissions Système', 'System Permissions')} value={stats.totalPermissions} color="text-cyan-600" />}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Activity Section */}
        <div className="card-base overflow-hidden flex flex-col">
          <div className="bg-gray-50/50 dark:bg-white/5 p-6 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {isAdmin ? t('Pulse du Système', 'System Pulse') : t('Vos Partenaires Gérés', 'Your Managed Partners')}
              </h2>
              <p className="text-gray-500 dark:text-dark-text-dim text-xs font-medium">{t('Mises à jour en temps réel', 'Real-time status updates')}</p>
            </div>
            <button className="text-[10px] font-black text-bcp-orange uppercase tracking-widest hover:underline">{t('Tout Voir', 'View All')}</button>
          </div>

          <div className="flex-1 divide-y divide-gray-100 dark:divide-dark-border">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-bcp-orange/20 border-t-bcp-orange rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-sm font-medium">{t('Synchronisation des données...', 'Synchronizing system data...')}</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="w-20 h-20 bg-gray-50 dark:bg-dark-bg-soft rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp size={32} className="opacity-20" />
                </div>
                <p className="font-bold text-gray-400">{isAdmin ? t('Aucun signal détecté', 'No pulse detected yet') : t('Prêt à enrôler des partenaires', 'Ready to start enrolling partners')}</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <ActivityIcon type={activity.type} />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-bcp-orange transition-colors">{activity.action}</p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs font-medium text-gray-500 dark:text-dark-text-dim">{activity.entity}</span>
                          <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600">{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      activity.status === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' :
                      activity.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                      'bg-red-50 dark:bg-red-500/10 text-red-600'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

