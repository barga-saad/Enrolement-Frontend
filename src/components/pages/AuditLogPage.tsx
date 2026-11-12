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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const pageSize = 20;

  useEffect(() => {
    fetchLogs();
  }, [page, filterEntity, dateFrom, dateTo]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let response;
      if (dateFrom && dateTo) {
        // ISO date-time format required by backend
        const start = `${dateFrom}T00:00:00`;
        const end = `${dateTo}T23:59:59`;
        response = await apiService.getAuditLogsByDateRange(start, end, page, pageSize);
      } else if (filterEntity) {
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
    CREATE: 'bg-orange-50 text-orange-700 border-orange-200/70 dark:bg-bcp-orange/10 dark:text-bcp-orange-light dark:border-bcp-orange/20',
    UPDATE: 'bg-brown-50 text-bcp-brown border-brown-200 dark:bg-bcp-brown/20 dark:text-brown-200 dark:border-bcp-brown/30',
    DELETE: 'bg-red-50 text-red-700 border-red-200/70 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    VALIDATE: 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    REJECT: 'bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    SUBMIT: 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    DRAFT: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-dark-bg-soft dark:text-gray-400 dark:border-dark-border',
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
      <div className="page-hero">
        <div className="flex flex-col items-center gap-3.5">
          <div className="page-hero-icon">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="page-title">
              {t('Journal d\'Audit', 'Audit Log')}
            </h1>
            <p className="page-subtitle">
              {t('Traçabilité complète des actions système', 'Complete traceability of system actions')}
              {totalElements > 0 && ` - ${totalElements} ${t('entrées', 'entries')}`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors" size={18} />
            <input
              type="text"
              placeholder={t('Rechercher par utilisateur, action ou entité...', 'Search by user, action or entity...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-input pl-10"
            />
          </div>
          <select
            value={filterEntity}
            onChange={(e) => { setFilterEntity(e.target.value); setPage(0); }}
            className="premium-input w-full lg:w-auto font-medium text-gray-700 dark:text-gray-200"
          >
            <option value="">{t('Toutes les entités', 'All entities')}</option>
            <option value="PARTNER">Partner</option>
            <option value="PARTNER_VALIDATION">Validation</option>
            <option value="USER">User</option>
            <option value="ROLE">Role</option>
          </select>
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
              className="premium-input flex-1 lg:w-auto px-3 text-gray-700 dark:text-gray-200"
              title={t('Date de début', 'Start date')}
              aria-label={t('Date de début', 'Start date')}
            />
            <span className="text-gray-400 text-sm font-medium" aria-hidden="true">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
              className="premium-input flex-1 lg:w-auto px-3 text-gray-700 dark:text-gray-200"
              title={t('Date de fin', 'End date')}
              aria-label={t('Date de fin', 'End date')}
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setPage(0); }}
                className="btn-icon flex-shrink-0"
                title={t('Effacer les dates', 'Clear dates')}
                aria-label={t('Effacer les dates', 'Clear dates')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="table-th">{t('Date', 'Date')}</th>
                <th className="table-th">{t('Utilisateur', 'User')}</th>
                <th className="table-th">{t('Action', 'Action')}</th>
                <th className="table-th">{t('Entité', 'Entity')}</th>
                <th className="table-th">ID</th>
                <th className="table-th">{t('Détails', 'Details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
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
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-bg-soft">
                        <ClipboardList className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Aucun journal trouvé', 'No audit logs found')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="data-row">
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-400 font-mono text-xs whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-gray-900 dark:text-gray-200">
                      {log.username || '-'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-400 font-medium">
                      {log.entityType}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 font-mono text-xs">
                      {log.entityId}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate" title={log.description || undefined}>
                      {log.description || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-gray-50/60 dark:bg-dark-bg-soft/40 border-t border-gray-100 dark:border-dark-border">
            <p className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
              {t('Page', 'Page')} {page + 1} {t('sur', 'of')} {totalPages} - {totalElements} {t('entrées', 'entries')}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                aria-label={t('Page précédente', 'Previous page')}
                className="btn-icon"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                aria-label={t('Page suivante', 'Next page')}
                className="btn-icon"
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
