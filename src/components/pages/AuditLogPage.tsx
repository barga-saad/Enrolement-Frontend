import { useState, useEffect } from 'react';
import { ClipboardList, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../../utils/toastStore';
import { apiService } from '../../services/api';
import { useLangStore, t } from '../../utils/langStore';

interface AuditLog {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  username: string;
  description?: string;
  timestamp: string;
}

const AuditLogPage = () => {
  const toast = useToast();
  const { lang: _lang } = useLangStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const pageSize = 20;

  useEffect(() => {
    fetchLogs();
  }, [page, filterEntity]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let response;
      if (filterEntity) {
        response = await apiService.getAuditLogsByEntity(filterEntity, page, pageSize);
      } else {
        response = await apiService.getAuditLogs(page, pageSize);
      }
      const data = response.data?.data || response.data;
      if (data?.content) {
        setLogs(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setLogs(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setLogs([]);
      }
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      toast.error(t('Échec du chargement des journaux', 'Failed to load audit logs'));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (log.username || '').toLowerCase().includes(term) ||
      (log.action || '').toLowerCase().includes(term) ||
      (log.entityType || '').toLowerCase().includes(term) ||
      (log.description || '').toLowerCase().includes(term)
    );
  });

  const ACTION_COLORS: Record<string, string> = {
    CREATE: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400',
    UPDATE: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400',
    DELETE: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400',
    VALIDATE: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400',
    REJECT: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400',
    SUBMIT: 'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-400',
    DRAFT: 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-500/10 dark:text-gray-400',
  };

  const getActionColor = (action: string) => {
    const upper = (action || '').toUpperCase();
    for (const key of Object.keys(ACTION_COLORS)) {
      if (upper.includes(key)) return ACTION_COLORS[key];
    }
    return ACTION_COLORS.CREATE;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-bcp-orange flex items-center justify-center shadow-lg shadow-bcp-orange/20">
            <ClipboardList className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('Journal d\'Audit', 'Audit Log')}
            </h1>
            <p className="text-gray-500 dark:text-dark-text-dim text-sm font-medium mt-1">
              {t('Traçabilité complète des actions système', 'Complete traceability of system actions')}
              {totalElements > 0 && ` — ${totalElements} ${t('entrées', 'entries')}`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-base p-4 bg-white/50 dark:bg-dark-bg-soft/50 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors" size={18} />
            <input
              type="text"
              placeholder={t('Rechercher par utilisateur, action ou entité...', 'Search by user, action or entity...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-[1.25rem] focus:ring-4 focus:ring-bcp-orange/10 focus:border-bcp-orange outline-none transition-all text-sm"
            />
          </div>
          <select
            value={filterEntity}
            onChange={(e) => { setFilterEntity(e.target.value); setPage(0); }}
            className="px-4 py-3 bg-white dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-[1.25rem] text-sm font-bold text-gray-600 dark:text-dark-text-dim focus:ring-4 focus:ring-bcp-orange/10 focus:border-bcp-orange outline-none"
          >
            <option value="">{t('Toutes les entités', 'All entities')}</option>
            <option value="PARTNER">Partner</option>
            <option value="PARTNER_VALIDATION">Validation</option>
            <option value="USER">User</option>
            <option value="ROLE">Role</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden bg-white/50 dark:bg-dark-bg-soft/50 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-dark-border">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-400">{t('Date', 'Date')}</th>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-400">{t('Utilisateur', 'User')}</th>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-400">{t('Action', 'Action')}</th>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-400">{t('Entité', 'Entity')}</th>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-400">ID</th>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-400">{t('Détails', 'Details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-bcp-orange border-t-transparent rounded-full animate-spin" />
                      <span>{t('Chargement...', 'Loading...')}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {t('Aucun journal trouvé', 'No audit logs found')}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-orange-50/20 dark:hover:bg-bcp-orange/5 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR') : '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                      {log.username || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-semibold">
                      {log.entityType}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {log.entityId}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">
                      {log.description || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-dark-border">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('Page', 'Page')} {page + 1} {t('sur', 'of')} {totalPages} — {totalElements} {t('entrées', 'entries')}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-xl bg-gray-50 dark:bg-dark-bg-soft border border-gray-100 dark:border-dark-border text-gray-500 hover:text-bcp-orange hover:border-bcp-orange transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-xl bg-gray-50 dark:bg-dark-bg-soft border border-gray-100 dark:border-dark-border text-gray-500 hover:text-bcp-orange hover:border-bcp-orange transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;
