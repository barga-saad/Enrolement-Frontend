/**
 * Roles Management Page - Full CRUD
 */

import { useState, useEffect } from 'react';
import { Shield, Search, ChevronDown, ChevronRight, Plus, Edit2, Power, X, Save } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import { useToast } from '../../utils/toastStore';
import { apiService } from '../../services/api';
import { useLangStore, t } from '../../utils/langStore';
import { roleLabel, roleDescription as sharedRoleDescription } from '../../utils/roles';
const roleDescription = (name: string, desc?: string) => sharedRoleDescription(name, desc) || '...';

interface Role {
  id: number;
  roleName: string;
  description: string;
  isActive: boolean;
  permissionNames: string[];
}

const PERMISSION_LABELS: Record<string, [string, string]> = {
  PARTNER_CREATE: ['Créer des partenaires', 'Create partners'],
  PARTNER_UPDATE_OWN: ['Modifier ses partenaires', 'Update own partners'],
  PARTNER_VALIDATE: ['Valider des partenaires', 'Validate partners'],
  PARTNER_STATUS_CHANGE: ['Activer ou désactiver les partenaires', 'Activate or deactivate partners'],
  PARTNER_VIEW_OWN: ['Consulter ses partenaires', 'View own partners'],
  PARTNER_LIST_ALL: ['Consulter tous les partenaires', 'View all partners'],
  DOCUMENT_PRINT: ['Imprimer les documents', 'Print documents'],
  REPORT_EXPORT: ['Exporter les rapports', 'Export reports'],
  ADMIN_USER_MANAGE: ['Gérer les utilisateurs', 'Manage users'],
  ADMIN_ROLE_MANAGE: ['Gérer les rôles', 'Manage roles'],
  ADMIN_PERMISSION_MANAGE: ['Gérer les permissions', 'Manage permissions'],
};

const PERMISSION_GROUPS: Array<{ label: [string, string]; codes: string[] }> = [
  { label: ['Partenaires', 'Partners'], codes: ['PARTNER_CREATE', 'PARTNER_UPDATE_OWN', 'PARTNER_STATUS_CHANGE', 'PARTNER_VALIDATE', 'PARTNER_VIEW_OWN', 'PARTNER_LIST_ALL'] },
  { label: ['Documents', 'Documents'], codes: ['DOCUMENT_PRINT', 'REPORT_EXPORT'] },
  { label: ['Administration', 'Administration'], codes: ['ADMIN_USER_MANAGE', 'ADMIN_ROLE_MANAGE', 'ADMIN_PERMISSION_MANAGE'] },
];




const EMPTY_FORM = { roleName: '', description: '', isActive: true, permissionNames: [] as string[] };

export default function RolesPage() {
  const toast = useToast();
  const { lang: _lang } = useLangStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRole, setExpandedRole] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [statusTarget, setStatusTarget] = useState<Role | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await apiService.getRoles();
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error(t('Erreur lors du chargement des rôles', 'Failed to load roles'));
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingRole(null);
    setFormData({ roleName: '', description: '', isActive: true, permissionNames: [] });
    setShowModal(true);
  };

  const openEdit = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRole(role);
    setFormData({ roleName: role.roleName, description: role.description, isActive: role.isActive, permissionNames: [...(role.permissionNames || [])] });
    setShowModal(true);
  };

  const togglePerm = (code: string) => {
    setFormData(prev => ({
      ...prev,
      permissionNames: prev.permissionNames.includes(code)
        ? prev.permissionNames.filter(p => p !== code)
        : [...prev.permissionNames, code],
    }));
  };

  const toggleGroupAll = (perms: string[]) => {
    const allSelected = perms.every(p => formData.permissionNames.includes(p));
    setFormData(prev => ({
      ...prev,
      permissionNames: allSelected
        ? prev.permissionNames.filter(p => !perms.includes(p))
        : [...new Set([...prev.permissionNames, ...perms])],
    }));
  };

  const handleSave = async () => {
    if (!formData.roleName.trim()) { toast.error(t('Le nom du rôle est requis', 'Role name is required')); return; }
    try {
      setSaving(true);
      if (editingRole) {
        await apiService.updateRole(editingRole.id, formData);
        toast.success(t('Rôle mis à jour', 'Role updated'));
      } else {
        await apiService.createRole(formData);
        toast.success(t('Rôle créé', 'Role created'));
      }
      setShowModal(false);
      fetchRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('Erreur lors de la sauvegarde', 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRoleActive = async () => {
    if (!statusTarget) return;
    const nextIsActive = !statusTarget.isActive;
    try {
      setUpdatingStatus(true);
      await apiService.updateRole(statusTarget.id, { isActive: nextIsActive });
      toast.success(nextIsActive
        ? t('Rôle activé. Attribuez-le aux utilisateurs concernés.', 'Role activated. Assign it to the appropriate users.')
        : t('Rôle désactivé et retiré des utilisateurs', 'Role deactivated and revoked from users'));
      setStatusTarget(null);
      await fetchRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('Impossible de modifier le statut de ce rôle', 'Could not update this role status'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredRoles = roles.filter(r =>
    r.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-fadeIn">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-bcp-orange/20 border-t-bcp-orange rounded-2xl animate-spin" />
          <Shield className="absolute inset-0 m-auto w-6 h-6 text-bcp-orange/40" />
        </div>
        <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-[0.3em]">{t('Chargement...', 'Loading...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.isActive ? t('Désactiver le rôle', 'Deactivate role') : t('Activer le rôle', 'Activate role')}
        description={statusTarget?.isActive
          ? t(`Désactiver ${statusTarget.roleName} ? Il sera retiré de ses utilisateurs, et sa réactivation ne le réattribuera pas.`, `Deactivate ${statusTarget.roleName}? It will be revoked from its users and won't be reassigned when reactivated.`)
          : t(`Activer ${statusTarget?.roleName} ? Il sera disponible pour attribution, sans être réattribué automatiquement.`, `Activate ${statusTarget?.roleName}? It will be available to assign, but won't be automatically reassigned.`)}
        confirmLabel={statusTarget?.isActive ? t('Désactiver', 'Deactivate') : t('Activer', 'Activate')}
        cancelLabel={t('Annuler', 'Cancel')}
        busy={updatingStatus}
        tone={statusTarget?.isActive ? 'danger' : 'accent'}
        onCancel={() => setStatusTarget(null)}
        onConfirm={handleToggleRoleActive}
      />
      {/* Header */}
      <div className="page-hero">
        <div className="page-hero-icon"><Shield className="w-6 h-6" /></div>
        <div className="flex flex-col items-center">
          <h1 className="page-title">{t('Gestion des rôles', 'Role management')}</h1>
          <p className="page-subtitle">{t('Gérez les rôles et leurs permissions', 'Manage roles and their permissions')}</p>
        </div>
        <div className="page-hero-actions">
          <button
            onClick={openCreate}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            {t('Créer un rôle', 'Create role')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card-base p-4">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors" size={18} />
          <input
            type="text"
            placeholder={t('Rechercher un rôle...', 'Search roles...')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="premium-input pl-10"
          />
        </div>
      </div>

      {/* Roles list */}
      <div className="space-y-4">
        {filteredRoles.length === 0 ? (
          <div className="card-base p-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-bg-soft">
              <Shield className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Aucun rôle trouvé', 'No roles found')}</p>
          </div>
        ) : filteredRoles.map(role => {
          const isExpanded = expandedRole === role.id;
          return (
            <div key={role.id} className={`card-base overflow-hidden ${isExpanded ? 'border-bcp-orange/30 shadow-bcp-soft' : ''}`}>
              <button
                onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                aria-expanded={isExpanded}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/70 dark:hover:bg-dark-bg-soft/40 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bcp-orange to-bcp-brown flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{roleLabel(role.roleName)} <span className="text-xs text-gray-400 font-mono font-normal">({role.roleName})</span></h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{roleDescription(role.roleName, role.description)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${role.isActive ? 'badge-success' : 'badge-neutral'}`}>
                    {role.isActive ? t('Actif', 'Active') : t('Inactif', 'Inactive')}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-50 dark:bg-dark-bg-soft px-2 py-1 rounded-lg">
                    {t(`${role.permissionNames?.length || 0} permission(s)`, `${role.permissionNames?.length || 0} permission(s)`)}
                  </span>
                  <button
                    onClick={e => openEdit(role, e)}
                    className="p-2 rounded-lg text-gray-400 hover:text-bcp-orange hover:bg-orange-50 dark:hover:bg-bcp-orange/10 transition"
                    title={t('Modifier', 'Edit')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setStatusTarget(role); }}
                    className={`p-2 rounded-lg text-gray-400 transition ${role.isActive
                      ? 'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                      : 'hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10'
                    }`}
                    title={role.isActive ? t('Désactiver', 'Deactivate') : t('Activer', 'Activate')}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-100 dark:border-dark-border pt-4">
                  <div className="space-y-5">
                    {PERMISSION_GROUPS.map(({ label: group, codes: permCodes }) => {
                      const granted = permCodes.filter(c => role.permissionNames?.includes(c));
                      if (granted.length === 0) return null;
                      return (
                        <div key={group[0]}>
                          <h4 className="section-label mb-2">{t(group[0], group[1])}</h4>
                          <div className="flex flex-wrap gap-2">
                            {permCodes.map(code => {
                              const has = role.permissionNames?.includes(code);
                              return (
                                <span key={code} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${has ? 'bg-orange-50 text-bcp-brown dark:bg-bcp-orange/10 dark:text-bcp-orange border-bcp-orange/25' : 'bg-gray-50 dark:bg-dark-bg-soft text-gray-400 dark:text-gray-500 border-gray-200/70 dark:border-dark-border line-through decoration-gray-300'}`}>
                                  {PERMISSION_LABELS[code] ? t(...PERMISSION_LABELS[code]) : code}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {(!role.permissionNames || role.permissionNames.length === 0) && (
                      <p className="text-sm text-gray-400 italic">{t('Aucune permission attribuée', 'No permissions assigned')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl max-h-[90vh] flex flex-col animate-slideUp" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100 dark:border-dark-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bcp-orange to-bcp-brown flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingRole ? t('Modifier le rôle', 'Edit role') : t('Créer un rôle', 'Create role')}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} aria-label={t('Fermer', 'Close')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg-soft transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 px-6 sm:px-8 py-6 space-y-6">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('Nom du rôle', 'Role name')} *</label>
                <input
                  type="text"
                  value={formData.roleName}
                  onChange={e => setFormData(prev => ({ ...prev, roleName: e.target.value }))}
                  placeholder={t('Ex. : PROFIL_SUPERVISEUR', 'e.g. PROFIL_SUPERVISOR')}
                  className="premium-input font-mono"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('Description', 'Description')}</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder={t('Description du rôle...', 'Role description...')}
                  className="premium-input resize-none"
                />
              </div>
              {!editingRole && <div className="flex items-center justify-between gap-4 p-4 bg-gray-50/70 dark:bg-dark-bg-soft/50 rounded-xl border border-gray-200/70 dark:border-dark-border">
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{t('Rôle actif', 'Active role')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('Ce rôle peut être attribué aux utilisateurs', 'This role can be assigned to users')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex w-12 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-bcp-orange' : 'bg-gray-200 dark:bg-dark-bg-soft'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>}

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('Permissions', 'Permissions')}</label>
                <div className="space-y-4">
                  {PERMISSION_GROUPS.map(({ label: group, codes: perms }) => {
                    const allSel = perms.every(p => formData.permissionNames.includes(p));
                    const someSel = perms.some(p => formData.permissionNames.includes(p)) && !allSel;
                    return (
                      <div key={group[0]} className="border border-gray-200/70 dark:border-dark-border rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleGroupAll(perms)}
                          className={`w-full flex items-center justify-between px-5 py-3 text-left transition ${allSel ? 'bg-bcp-orange/10' : 'bg-gray-50 dark:bg-dark-bg-soft/50'}`}
                        >
                          <span className={`text-xs font-semibold uppercase tracking-wider ${allSel ? 'text-bcp-brown dark:text-bcp-orange' : someSel ? 'text-amber-600' : 'text-gray-500 dark:text-gray-400'}`}>{t(group[0], group[1])}</span>
                          <span className={`text-xs font-semibold ${allSel ? 'text-bcp-orange' : 'text-gray-400'}`}>
                            {allSel ? t('Tout désélectionner', 'Deselect all') : t('Tout sélectionner', 'Select all')}
                          </span>
                        </button>
                        <div className="p-4 grid grid-cols-1 gap-2">
                          {perms.map(code => {
                            const checked = formData.permissionNames.includes(code);
                            return (
                              <label key={code} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${checked ? 'border-bcp-orange/30 bg-bcp-orange/5 dark:bg-bcp-orange/10' : 'border-transparent hover:bg-gray-50 dark:hover:bg-dark-bg-soft/50'}`}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePerm(code)}
                                  className="w-4 h-4 rounded border-gray-300 accent-bcp-orange"
                                />
                                <div>
                                  <p className={`text-sm font-semibold ${checked ? 'text-bcp-brown dark:text-bcp-orange' : 'text-gray-600 dark:text-gray-300'}`}>{PERMISSION_LABELS[code] ? t(...PERMISSION_LABELS[code]) : code}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">{code}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end px-6 sm:px-8 py-4 bg-gray-50/80 dark:bg-dark-bg-soft/60 border-t border-gray-100 dark:border-dark-border flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="btn-outline">
                {t('Annuler', 'Cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                <Save className="w-4 h-4" />
                {saving ? t('Enregistrement...', 'Saving...') : t('Enregistrer', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}