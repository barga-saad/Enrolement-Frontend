import { useState, useEffect } from 'react';
import { Users, Shield, FileText, Clock, CheckCircle, ArrowUpRight, Activity, Calendar } from 'lucide-react';
import { useToast } from '../../utils/toastStore';
import { useAuth } from '../../hooks';
import { apiService } from '../../services/api';
import { useLangStore, t } from '../../utils/langStore';
import { roleLabel } from '../../utils/roles';

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
  const [, setRecentActivity] = useState<RecentActivity[]>([]);
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
        const [usersRes, rolesRes, permissionsRes, auditRes, partnerStatsRes] = await Promise.allSettled([
          apiService.getUsers(),
          apiService.getRoles(),
          apiService.getPermissions(),
          apiService.getAuditLogs(0, 5),
          apiService.getPartnerStats(),
        ]);

        const users = usersRes.status === 'fulfilled' ? (Array.isArray(usersRes.value.data) ? usersRes.value.data : []) : [];
        const roles = rolesRes.status === 'fulfilled' ? (Array.isArray(rolesRes.value.data) ? rolesRes.value.data : []) : [];
        const permissions = permissionsRes.status === 'fulfilled' ? (Array.isArray(permissionsRes.value.data) ? permissionsRes.value.data : []) : [];
        const partnerStats = partnerStatsRes.status === 'fulfilled' ? (partnerStatsRes.value.data?.data || {}) : {};
        const auditLogs = auditRes.status === 'fulfilled' ? (auditRes.value.data?.data?.content || auditRes.value.data?.content || auditRes.value.data?.data || []) : [];

        const activeUsers = Array.isArray(users) ? users.filter((u: any) => u.isActive).length : 0;
        const activeRoles = Array.isArray(roles) ? roles.filter((r: any) => r.isActive).length : 0;
        setStats({
          totalUsers: Array.isArray(users) ? users.length : 0,
          activeRoles,
          activeUsers,
          totalPermissions: Array.isArray(permissions) ? permissions.length : 0,
          totalPartners: partnerStats.validated ?? 0,
          pendingApprovals: partnerStats.pending ?? 0,
        });

        const ACTION_STATUS: Record<string, 'success' | 'pending' | 'warning'> = {
          CREATE: 'success', VALIDATE: 'success', UPDATE: 'pending', SUBMIT: 'pending', REJECT: 'warning', DELETE: 'warning', DRAFT: 'pending',
        };
        const ACTION_TYPE: Record<string, 'partner' | 'user' | 'role' | 'approval'> = {
          PARTNER: 'partner', PARTNER_VALIDATION: 'approval', USER: 'user', ROLE: 'role',
        };
        const activities: RecentActivity[] = Array.isArray(auditLogs) ? auditLogs.slice(0, 5).map((log: any) => ({
          id: String(log.id),
          type: ACTION_TYPE[log.entityType] || 'partner',
          action: log.action || '-',
          entity: log.username || `#${log.entityId}`,
          timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR') : '-',
          status: Object.entries(ACTION_STATUS).find(([k]) => (log.action || '').toUpperCase().includes(k))?.[1] || 'success',
        })) : [];
        setRecentActivity(activities.slice(0, 5));
      } else {
        try {
          const partnersRes = await apiService.getPartners();
          const partners = partnersRes.data?.data || [];
          setStats({
            totalPartners: Array.isArray(partners) ? partners.filter((p: any) => p.workflowStatus === 'VALIDATED').length : 0,
            pendingApprovals: Array.isArray(partners) ? partners.filter((p: any) => p.workflowStatus === 'PENDING').length : 0,
          });

          const activities: RecentActivity[] = Array.isArray(partners) ? partners.slice(0, 3).map((partner: any, index: number) => ({
            id: `partner-${index}`,
            type: 'partner' as const,
            action: t('Partenaire', 'Partner') + ' - ' + (partner.workflowStatus || ''),
            entity: partner.partnerName || partner.name || `Partner ${index + 1}`,
            timestamp: partner.createdAt ? new Date(partner.createdAt).toLocaleDateString('fr-FR') : '-',
            status: partner.workflowStatus === 'VALIDATED' ? 'success' as const : partner.workflowStatus === 'REJECTED' ? 'warning' as const : 'pending' as const,
          })) : [];
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


  // Icon chip background per accent colour (palette: orange / brown / semantic status)
  const STAT_ICON_BG: Record<string, string> = {
    'text-bcp-orange': 'bg-orange-50 dark:bg-bcp-orange/10',
    'text-bcp-brown': 'bg-brown-50 dark:bg-bcp-brown/20',
    'text-emerald-600': 'bg-emerald-50 dark:bg-emerald-500/10',
    'text-amber-600': 'bg-amber-50 dark:bg-amber-500/10',
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
    <div className="card-base card-interactive p-5 group relative overflow-hidden">
      {/* Decorative corner rings + hover accent line */}
      <svg className="absolute -right-10 -bottom-12 h-36 w-36 pointer-events-none" viewBox="0 0 140 140" fill="none" aria-hidden="true">
        <circle cx="70" cy="70" r="60" stroke="#FF9900" strokeOpacity="0.14" strokeWidth="1.2" />
        <circle cx="70" cy="70" r="44" stroke="#6B4C3A" strokeOpacity="0.10" strokeWidth="1" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-bcp-orange via-bcp-orange-light to-bcp-brown opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-gray-500 dark:text-dark-text-dim text-[11px] font-semibold uppercase tracking-[0.1em] mb-2">{label}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold tabular-nums tracking-tight text-brown-900 dark:text-white">
              {loading ? <div className="w-12 h-8 bg-gray-100 dark:bg-dark-bg-soft animate-pulse rounded-lg" /> : (value ?? 0)}
            </h3>
            {trend && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 ring-black/[0.04] transition-transform duration-300 group-hover:scale-105 ${STAT_ICON_BG[color] || 'bg-gray-100 dark:bg-dark-bg-soft'}`}>
          <Icon size={22} className={`${color} ${color === 'text-bcp-brown' ? 'dark:text-brown-300' : ''}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page introduction */}
      <div className="page-hero">
        <div className="page-hero-icon">
          <Activity className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-center">
          {/* All roles held by the user */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2.5">
            {(user?.roleNames ?? []).map((role) => (
              <span key={role} className="badge badge-brand uppercase tracking-wider text-[10px]">
                {roleLabel(role)}
              </span>
            ))}
          </div>
          <h1 className="page-title">{t('Vue d\'ensemble', 'Overview')}</h1>
          <p className="page-subtitle flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-1.5 text-bcp-orange" />
            {t('Analyses d\'efficacité pour', 'Efficiency analytics for')} {user?.firstName || 'User'}
          </p>
        </div>

        <div className="page-hero-actions">
          <button
            onClick={loadDashboardData}
            aria-busy={loading}
            className="btn-outline"
          >
            <Activity className={`w-4 h-4 ${loading ? 'animate-pulse text-bcp-orange' : ''}`} />
            <span>{t('Actualiser Sync', 'Refresh Sync')}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-4 md:gap-6 ${isAdmin ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {isAdmin && (
          <>
            <StatCard icon={Users} label={t('Utilisateurs Globaux', 'Global Users')} value={stats.totalUsers} color="text-bcp-brown" />
            <StatCard icon={CheckCircle} label={t('Utilisateurs Actifs', 'Active Users')} value={stats.activeUsers} color="text-emerald-600" />
            <StatCard icon={Shield} label={t('Rôles Personnalisés', 'Custom Roles')} value={stats.activeRoles} color="text-bcp-orange" />
          </>
        )}
        <StatCard icon={FileText} label={t('Partenaires Enregistrés', 'Registered Partners')} value={stats.totalPartners} color="text-bcp-orange" />
        <StatCard icon={Clock} label={t('En Attente d\'Approbation', 'Awaiting Approval')} value={stats.pendingApprovals} color="text-amber-600" />
        {isAdmin && <StatCard icon={Shield} label={t('Permissions Système', 'System Permissions')} value={stats.totalPermissions} color="text-bcp-brown" />}
      </div>

    </div>
  );
};

export default DashboardPage;

