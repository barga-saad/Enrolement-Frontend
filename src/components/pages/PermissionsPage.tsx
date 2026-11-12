import { useEffect, useState } from 'react';
import { KeyRound, Power, Search } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import { useToast } from '../../utils/toastStore';
import { apiService } from '../../services/api';
import { useLangStore, t } from '../../utils/langStore';

interface Permission {
  id: number;
  permissionName: string;
  endpoint: string;
  httpMethod: string;
  description: string;
  isActive: boolean;
}

export default function PermissionsPage() {
  const toast = useToast();
  const { lang: _lang } = useLangStore();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusTarget, setStatusTarget] = useState<Permission | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    void fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await apiService.getPermissions();
      setPermissions(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error(t('Impossible de charger les permissions', 'Failed to load permissions'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!statusTarget) return;
    const nextIsActive = !statusTarget.isActive;
    setUpdating(true);
    try {
      await apiService.updatePermission(statusTarget.id, { isActive: nextIsActive });
      toast.success(nextIsActive
        ? t('Permission activée. Elle s’applique aux rôles qui la possèdent.', 'Permission activated for roles that already have it.')
        : t('Permission désactivée pour tous les rôles.', 'Permission deactivated for all roles.'));
      setStatusTarget(null);
      await fetchPermissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Impossible de modifier cette permission', 'Could not update this permission'));
    } finally {
      setUpdating(false);
    }
  };

  const filteredPermissions = permissions.filter(permission =>
    `${permission.permissionName} ${permission.endpoint} ${permission.description || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.isActive ? t('Désactiver la permission', 'Deactivate permission') : t('Activer la permission', 'Activate permission')}
        description={statusTarget?.isActive
          ? t(`Désactiver ${statusTarget.permissionName} ? Elle n’accordera plus aucun droit, quel que soit le rôle.`, `Deactivate ${statusTarget.permissionName}? It will grant no access, regardless of role.`)
          : t(`Activer ${statusTarget?.permissionName} ? Les rôles déjà associés retrouveront cette permission.`, `Activate ${statusTarget?.permissionName}? Roles already linked to it will regain this permission.`)}
        confirmLabel={statusTarget?.isActive ? t('Désactiver', 'Deactivate') : t('Activer', 'Activate')}
        cancelLabel={t('Annuler', 'Cancel')}
        busy={updating}
        tone={statusTarget?.isActive ? 'danger' : 'accent'}
        onCancel={() => setStatusTarget(null)}
        onConfirm={handleToggle}
      />

      <header className="page-hero">
        <div className="page-hero-icon">
          <KeyRound size={22} />
        </div>
        <div className="flex flex-col items-center">
          <h1 className="page-title">{t('Gestion des permissions', 'Permission management')}</h1>
          <p className="page-subtitle">{t('Une permission inactive ne donne accès à aucun rôle.', 'An inactive permission grants no access to any role.')}</p>
        </div>
      </header>

      <div className="card-base p-4">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors" size={18} />
          <input
            type="search"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder={t('Rechercher une permission...', 'Search permissions...')}
            className="premium-input pl-10"
          />
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[760px] text-left">
            <thead className="table-head">
              <tr>
                <th className="table-th px-5">{t('Permission', 'Permission')}</th>
                <th className="table-th px-5">{t('Endpoint', 'Endpoint')}</th>
                <th className="table-th px-5">{t('Statut', 'Status')}</th>
                <th className="table-th px-5 text-right">{t('Action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">{t('Chargement...', 'Loading...')}</td></tr>
              ) : filteredPermissions.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-bg-soft">
                      <KeyRound className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Aucune permission trouvée', 'No permissions found')}</p>
                  </div>
                </td></tr>
              ) : filteredPermissions.map(permission => (
                <tr key={permission.id} className="data-row">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900 dark:text-white">{permission.permissionName}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{permission.description}</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-600 dark:text-gray-300">
                    <span className="mr-2 rounded-md border border-brown-200 bg-brown-50 px-1.5 py-0.5 font-semibold text-bcp-brown dark:border-dark-border dark:bg-dark-bg-soft dark:text-brown-200">{permission.httpMethod}</span>
                    {permission.endpoint}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${permission.isActive
                      ? 'badge-success'
                      : 'badge-neutral'
                    }`}>
                      {permission.isActive ? t('Active', 'Active') : t('Inactive', 'Inactive')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setStatusTarget(permission)}
                      title={permission.isActive ? t('Désactiver', 'Deactivate') : t('Activer', 'Activate')}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${permission.isActive
                        ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                        : 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
                      }`}
                    >
                      <Power size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}