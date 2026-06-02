/**
 * Roles Management Page - Full CRUD
 */

import { useState, useEffect } from 'react';
import { Shield, Search, ChevronDown, ChevronRight, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { useToast } from '../../utils/toastStore';
import { apiService } from '../../services/api';
import { t } from '../../utils/langStore';

interface Role {
  id: number;
  roleName: string;
  description: string;
  isActive: boolean;
  permissionNames: string[];
}

const PERMISSION_LABELS: Record<string, string> = {
  PARTNER_CREATE: 'Creer Partenaires',
  PARTNER_UPDATE_OWN: 'Modifier ses Partenaires',
  PARTNER_VALIDATE: 'Valider Partenaires',
  PARTNER_DELETE: 'Supprimer Partenaires',
  PARTNER_VIEW_OWN: 'Voir ses Partenaires',
  PARTNER_LIST_ALL: 'Lister tous les Partenaires',
  TRANSFER_CREATE: 'Creer Transferts',
  TRANSFER_VIEW_OWN: 'Voir ses Transferts',
  TRANSFER_LIST_ALL: 'Lister tous les Transferts',
  TRANSFER_VALIDATE: 'Valider Transferts',
  DOCUMENT_PRINT: 'Imprimer Documents',
  REPORT_EXPORT: 'Exporter Rapports',
  ADMIN_USER_MANAGE: 'Gerer Utilisateurs',
  ADMIN_ROLE_MANAGE: 'Gerer Roles',
  ADMIN_PERMISSION_MANAGE: 'Gerer Permissions',
};

const PERMISSION_GROUPS: Record<string, string[]> = {
  Partenaires: ['PARTNER_CREATE', 'PARTNER_UPDATE_OWN', 'PARTNER_VALIDATE', 'PARTNER_DELETE', 'PARTNER_VIEW_OWN', 'PARTNER_LIST_ALL'],
  Transferts: ['TRANSFER_CREATE', 'TRANSFER_VIEW_OWN', 'TRANSFER_LIST_ALL', 'TRANSFER_VALIDATE'],
  Documents: ['DOCUMENT_PRINT', 'REPORT_EXPORT'],
  Administration: ['ADMIN_USER_MANAGE', 'ADMIN_ROLE_MANAGE', 'ADMIN_PERMISSION_MANAGE'],
};

const EMPTY_FORM = { roleName: '', description: '', isActive: true, permissionNames: [] as string[] };

export default function RolesPage() {
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRole, setExpandedRole] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await apiService.getRoles();
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error(t('Erreur lors du chargement des roles', 'Failed to load roles'));
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
    if (!formData.roleName.trim()) { toast.error(t('Le nom du role est requis', 'Role name is required')); return; }
    try {
      setSaving(true);
      if (editingRole) {
        await apiService.updateRole(editingRole.id, formData);
        toast.success(t('Role mis a jour', 'Role updated'));
      } else {
        await apiService.createRole(formData);
        toast.success(t('Role cree', 'Role created'));
      }
      setShowModal(false);
      fetchRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('Erreur lors de la sauvegarde', 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiService.deleteRole(deleteTarget.id);
      toast.success(t('Role supprime', 'Role deleted'));
      setDeleteTarget(null);
      fetchRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('Impossible de supprimer ce role', 'Cannot delete role'));
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
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('Gestion des Roles', 'Role Management')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('Gerez les roles et leurs permissions', 'Manage roles and their permissions')}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-bcp-orange text-white rounded-xl font-bold text-sm hover:bg-bcp-orange/90 transition-all shadow-lg shadow-bcp-orange/20"
        >
          <Plus className="w-4 h-4" />
          {t('Creer un role', 'Create Role')}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-dark-bg-card rounded-2xl border border-gray-100 dark:border-dark-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('Rechercher un role...', 'Search roles...')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-border dark:bg-dark-bg-soft dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-bcp-orange/30 focus:border-bcp-orange text-sm"
          />
        </div>
      </div>

      {/* Roles list */}
      <div className="space-y-4">
        {filteredRoles.length === 0 ? (
          <div className="bg-white dark:bg-dark-bg-card rounded-2xl border border-gray-100 dark:border-dark-border p-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('Aucun role trouve', 'No roles found')}</p>
          </div>
        ) : filteredRoles.map(role => {
          const isExpanded = expandedRole === role.id;
          return (
            <div key={role.id} className="bg-white dark:bg-dark-bg-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
              <button
                onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-bg-soft/40 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bcp-orange to-bcp-brown flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800 dark:text-white">{role.roleName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{role.description || '...'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${role.isActive ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-dark-bg-soft dark:text-gray-400'}`}>
                    {role.isActive ? t('Actif', 'Active') : t('Inactif', 'Inactive')}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-50 dark:bg-dark-bg-soft px-2 py-1 rounded-lg">
                    {role.permissionNames?.length || 0} perms
                  </span>
                  <button
                    onClick={e => openEdit(role, e)}
                    className="p-2 rounded-lg text-gray-400 hover:text-bcp-orange hover:bg-orange-50 dark:hover:bg-bcp-orange/10 transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteTarget(role); }}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-100 dark:border-dark-border pt-4">
                  <div className="space-y-5">
                    {Object.entries(PERMISSION_GROUPS).map(([group, permCodes]) => {
                      const granted = permCodes.filter(c => role.permissionNames?.includes(c));
                      if (granted.length === 0) return null;
                      return (
                        <div key={group}>
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{group}</h4>
                          <div className="flex flex-wrap gap-2">
                            {permCodes.map(code => {
                              const has = role.permissionNames?.includes(code);
                              return (
                                <span key={code} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${has ? 'bg-bcp-orange/10 text-bcp-brown dark:text-bcp-orange border-bcp-orange/20' : 'bg-gray-50 dark:bg-dark-bg-soft text-gray-300 border-gray-100 dark:border-dark-border'}`}>
                                  {PERMISSION_LABELS[code] || code}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {(!role.permissionNames || role.permissionNames.length === 0) && (
                      <p className="text-sm text-gray-400 italic">{t('Aucune permission assignee', 'No permissions assigned')}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-bg-card rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100 dark:border-dark-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bcp-orange to-bcp-brown flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-black text-gray-800 dark:text-white">
                  {editingRole ? t('Modifier le role', 'Edit Role') : t('Creer un role', 'Create Role')}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg-soft transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('Nom du role', 'Role Name')} *</label>
                <input
                  type="text"
                  value={formData.roleName}
                  onChange={e => setFormData(prev => ({ ...prev, roleName: e.target.value }))}
                  placeholder="ex: PROFIL_SUPERVISEUR"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-dark-border dark:bg-dark-bg-soft dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-bcp-orange/30 focus:border-bcp-orange font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('Description', 'Description')}</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder={t('Description du role...', 'Role description...')}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-dark-border dark:bg-dark-bg-soft dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-bcp-orange/30 focus:border-bcp-orange resize-none"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg-soft/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{t('Role actif', 'Active Role')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('Les utilisateurs peuvent etre assignes a ce role', 'Users can be assigned this role')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex w-12 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-bcp-orange' : 'bg-gray-200 dark:bg-dark-bg-soft'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t('Permissions', 'Permissions')}</label>
                <div className="space-y-4">
                  {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
                    const allSel = perms.every(p => formData.permissionNames.includes(p));
                    const someSel = perms.some(p => formData.permissionNames.includes(p)) && !allSel;
                    return (
                      <div key={group} className="border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleGroupAll(perms)}
                          className={`w-full flex items-center justify-between px-5 py-3 text-left transition ${allSel ? 'bg-bcp-orange/10' : 'bg-gray-50 dark:bg-dark-bg-soft/50'}`}
                        >
                          <span className={`text-xs font-black uppercase tracking-widest ${allSel ? 'text-bcp-brown dark:text-bcp-orange' : someSel ? 'text-amber-600' : 'text-gray-500 dark:text-gray-400'}`}>{group}</span>
                          <span className={`text-xs font-semibold ${allSel ? 'text-bcp-orange' : 'text-gray-400'}`}>
                            {allSel ? t('Tout deselectionner', 'Deselect all') : t('Tout selectionner', 'Select all')}
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
                                  <p className={`text-sm font-semibold ${checked ? 'text-bcp-brown dark:text-bcp-orange' : 'text-gray-600 dark:text-gray-300'}`}>{PERMISSION_LABELS[code] || code}</p>
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

            <div className="flex gap-3 justify-end px-8 py-5 border-t border-gray-100 dark:border-dark-border flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg-soft transition">
                {t('Annuler', 'Cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-bcp-orange text-white rounded-xl font-bold text-sm hover:bg-bcp-orange/90 transition disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? t('Enregistrement...', 'Saving...') : t('Enregistrer', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-bg-card rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800 dark:text-white">{t('Supprimer le role', 'Delete Role')}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{t('Cette action est irreversible', 'This action is irreversible')}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {t('Voulez-vous vraiment supprimer le role', 'Are you sure you want to delete the role')}{' '}
              <span className="font-bold text-gray-800 dark:text-white">{deleteTarget.roleName}</span> ?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg-soft transition">
                {t('Annuler', 'Cancel')}
              </button>
              <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition">
                {t('Supprimer', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}