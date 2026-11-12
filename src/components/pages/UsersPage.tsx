/**
 * Users Management Page
 * Manage users and assign roles
 */

import { useState, useEffect } from 'react';
import { Plus, Edit2, Power, Search, Eye, EyeOff, Shield, X, UserPlus, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import { useToast } from '../../utils/toastStore';
import { apiService } from '../../services/api';
import { useLangStore, t } from '../../utils/langStore';
import { roleLabel, roleDescription, hasAnyRole, PROFIL_ADMIN_CENTRAL, ASSIGNABLE_BY_HABILITATION, PROTECTED_FROM_HABILITATION } from '../../utils/roles';
import { useAuth } from '../../hooks';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleNames: string[];
  createdAt: string;
}

interface Role {
  id: number;
  roleName: string;
  description: string;
  isActive: boolean;
}




type ViewMode = 'list' | 'create' | 'edit';

export default function UsersPage() {
  const toast = useToast();
  const { lang: _lang } = useLangStore();
  const { user: currentUser } = useAuth();
  // Habilitation agent: may only manage non-admin accounts and grant agent d'enrôlement / consultant
  // (the backend enforces the same rules)
  const isCentralAdmin = hasAnyRole(currentUser?.roleNames, [PROFIL_ADMIN_CENTRAL]);
  const canManageUser = (target: { roleNames: string[] }) =>
    isCentralAdmin || !hasAnyRole(target.roleNames, PROTECTED_FROM_HABILITATION);
  const canGrantRole = (roleName: string) => isCentralAdmin || ASSIGNABLE_BY_HABILITATION.includes(roleName);
  const protectedTitle = t("Seul l'administrateur central peut modifier ce compte", 'Only the central administrator can modify this account');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [users, setUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [assigningRole, setAssigningRole] = useState(false);
  const [statusTarget, setStatusTarget] = useState<User | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    username: string; email: string; firstName: string; lastName: string;
    password: string; isActive: boolean;
  }>({ username: '', email: '', firstName: '', lastName: '', password: '', isActive: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        apiService.getUsers(),
        apiService.getRoles(),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setAllRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(t('Impossible de charger les données', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formData.username.trim()) errors.username = t('L’identifiant est obligatoire.', 'Username is required.');
    if (!formData.email.trim()) {
      errors.email = t('L’adresse e-mail est obligatoire.', 'Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = t('Saisissez une adresse e-mail valide.', 'Enter a valid email address.');
    }
    if (!formData.firstName.trim()) errors.firstName = t('Le prénom est obligatoire.', 'First name is required.');
    if (!formData.lastName.trim()) errors.lastName = t('Le nom est obligatoire.', 'Last name is required.');
    if (viewMode === 'create' && !formData.password) {
      errors.password = t('Le mot de passe est obligatoire.', 'Password is required.');
    } else if (viewMode === 'create' && formData.password.length < 6) {
      errors.password = t('Le mot de passe doit contenir au moins 6 caractères.', 'Password must contain at least 6 characters.');
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error(t('Corrigez les champs signalés avant de continuer.', 'Correct the highlighted fields before continuing.'));
      return;
    }

    try {
      if (viewMode === 'create') {
        await apiService.createUser({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          isActive: formData.isActive,
        });
        toast.success(t('Utilisateur créé avec succès', 'User created successfully'));
      } else if (selectedUser) {
        await apiService.updateUser(selectedUser.id, {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          isActive: formData.isActive,
        });
        toast.success(t('Utilisateur mis à jour avec succès', 'User updated successfully'));
      }
      await fetchData();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.errorMessage || error.response?.data?.message || t('Échec de l’opération', 'Operation failed'));
    }
  };

  const handleToggleUserActive = async () => {
    if (!statusTarget) return;
    const nextIsActive = !statusTarget.isActive;
    setUpdatingStatus(true);
    try {
      await apiService.updateUser(statusTarget.id, { isActive: nextIsActive });
      toast.success(nextIsActive
        ? t('Utilisateur activé. Attribuez-lui les rôles nécessaires.', 'User activated. Assign the required roles.')
        : t('Utilisateur désactivé et rôles retirés', 'User deactivated and roles revoked'));
      setStatusTarget(null);
      await fetchData();
    } catch {
      toast.error(t('Impossible de modifier le statut de l’utilisateur', 'Failed to update user status'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignRole = async (userId: number, roleId: number) => {
    setAssigningRole(true);
    try {
      await apiService.assignRoleToUser(userId, roleId);
      toast.success(t('Rôle attribué avec succès', 'Role assigned successfully'));
      await fetchData();
      // Update the modal user
      const updated = (await apiService.getUsers()).data;
      const refreshed = (Array.isArray(updated) ? updated : []).find((u: User) => u.id === userId);
      if (refreshed) setRoleModalUser(refreshed);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.errorMessage || error.response?.data?.message || t('Échec de l’attribution du rôle', 'Failed to assign role'));
    } finally {
      setAssigningRole(false);
    }
  };

  const handleRevokeRole = async (userId: number, roleId: number) => {
    setAssigningRole(true);
    try {
      await apiService.revokeRoleFromUser(userId, roleId);
      toast.success(t('Rôle retiré', 'Role revoked'));
      await fetchData();
      const updated = (await apiService.getUsers()).data;
      const refreshed = (Array.isArray(updated) ? updated : []).find((u: User) => u.id === userId);
      if (refreshed) setRoleModalUser(refreshed);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.errorMessage || error.response?.data?.message || t('Échec du retrait du rôle', 'Failed to revoke role'));
    } finally {
      setAssigningRole(false);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', firstName: '', lastName: '', password: '', isActive: true });
    setFormErrors({});
    setViewMode('list');
    setSelectedUser(null);
  };

  // ─── LIST VIEW ───
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <ConfirmDialog
          open={statusTarget !== null}
          title={statusTarget?.isActive ? t('Désactiver le compte', 'Deactivate account') : t('Activer le compte', 'Activate account')}
          description={statusTarget?.isActive
            ? t(`Désactiver @${statusTarget.username} ? L’accès sera bloqué et tous ses rôles seront révoqués.`, `Deactivate @${statusTarget.username}? Access will be blocked and all assigned roles will be revoked.`)
            : t(`Activer @${statusTarget?.username} ? Le compte n’aura aucun rôle. Un administrateur devra lui attribuer les rôles nécessaires.`, `Activate @${statusTarget?.username}? The account will have no roles until an administrator assigns them.`)}
          confirmLabel={statusTarget?.isActive ? t('Désactiver', 'Deactivate') : t('Activer', 'Activate')}
          cancelLabel={t('Annuler', 'Cancel')}
          busy={updatingStatus}
          tone={statusTarget?.isActive ? 'danger' : 'accent'}
          onCancel={() => setStatusTarget(null)}
          onConfirm={handleToggleUserActive}
        />
        {/* Role Assignment Modal */}
        {roleModalUser && (
          <div className="modal-backdrop">
            <div className="modal-panel max-w-lg animate-slideUp" role="dialog" aria-modal="true">
              <div className="bg-gradient-to-r from-bcp-orange to-bcp-brown px-6 py-4 flex items-center justify-between gap-4">
                <h3 className="text-white font-semibold text-base sm:text-lg">
                  {t('Gérer les rôles', 'Manage roles')} - {roleModalUser.firstName} {roleModalUser.lastName}
                </h3>
                <button onClick={() => setRoleModalUser(null)} aria-label={t('Fermer', 'Close')} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Current roles */}
                <div>
                  <h4 className="section-label mb-2.5">{t('Rôles attribués', 'Assigned roles')}</h4>
                  {roleModalUser.roleNames.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">{t('Aucun rôle attribué', 'No roles assigned')}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {roleModalUser.roleNames.map((roleName) => {
                        const role = allRoles.find(r => r.roleName === roleName);
                        return (
                          <span key={roleName} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-orange-50 text-bcp-brown border border-bcp-orange/25 rounded-lg text-sm font-medium dark:bg-bcp-orange/10 dark:text-bcp-orange-light dark:border-bcp-orange/20">
                            <Shield size={14} />
                            {roleLabel(roleName)}
                            {canGrantRole(roleName) && <button
                              onClick={() => role && handleRevokeRole(roleModalUser.id, role.id)}
                              disabled={assigningRole}
                              className="ml-0.5 p-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                              title={t('Retirer le rôle', 'Revoke role')}
                            >
                              <X size={14} />
                            </button>}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Available roles */}
                <div>
                  <h4 className="section-label mb-2.5">{t('Attribuer un rôle', 'Assign role')}</h4>
                  <div className="space-y-2">
                    {allRoles
                      .filter(r => r.isActive && !roleModalUser.roleNames.includes(r.roleName) && canGrantRole(r.roleName))
                      .map((role) => (
                        <button
                          key={role.id}
                          onClick={() => handleAssignRole(roleModalUser.id, role.id)}
                          disabled={assigningRole}
                          className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-dark-border rounded-xl hover:bg-orange-50/50 dark:hover:bg-bcp-orange/5 hover:border-bcp-orange/40 transition disabled:opacity-50 group"
                        >
                          <div className="text-left">
                            <p className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-bcp-brown dark:group-hover:text-bcp-orange">
                              {roleLabel(role.roleName)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{roleDescription(role.roleName, role.description)}</p>
                          </div>
                          <UserPlus size={18} className="text-gray-300 group-hover:text-bcp-orange" />
                        </button>
                      ))}
                    {allRoles.filter(r => r.isActive && !roleModalUser.roleNames.includes(r.roleName) && canGrantRole(r.roleName)).length === 0 && (
                      <p className="text-sm text-gray-400 italic">{t('Tous les rôles sont déjà attribués', 'All roles are already assigned')}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50/80 dark:bg-dark-bg-soft/60 border-t border-gray-100 dark:border-dark-border flex justify-end">
                <button
                  onClick={() => setRoleModalUser(null)}
                  className="btn-outline"
                >
                  {t('Fermer', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="page-hero">
          <div className="page-hero-icon"><UsersIcon className="w-6 h-6" /></div>
          <div className="flex flex-col items-center">
            <h1 className="page-title">{t('Gestion des utilisateurs', 'User management')}</h1>
            <p className="page-subtitle">{t('Gérez les utilisateurs et attribuez leurs rôles', 'Manage users and assign roles')}</p>
          </div>
          <div className="page-hero-actions">
          <button
            onClick={() => {
              setViewMode('create');
              setSelectedUser(null);
              setFormData({ username: '', email: '', firstName: '', lastName: '', password: '', isActive: true });
            }}
            className="btn-primary"
          >
            <Plus size={18} /> {t('Nouvel utilisateur', 'New user')}
          </button>
          </div>
        </div>

        {/* Search */}
        <div className="card-base p-4">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors" size={18} />
            <input
              type="text"
              placeholder={t('Rechercher un utilisateur...', 'Search users...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-input pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card-base min-w-0 max-w-full overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-4 animate-fadeIn">
              <div className="w-10 h-10 border-[3px] border-bcp-orange/20 border-t-bcp-orange rounded-full animate-spin" />
              <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-[0.3em]">{t('Synchronisation du registre', 'Synchronizing registry')}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-bg-soft">
                <UsersIcon className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Aucun utilisateur trouvé', 'No users found')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[1040px] table-fixed">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[26%]" />
              </colgroup>
              <thead className="table-head">
                <tr>
                  <th className="table-th">{t('Utilisateur', 'User')}</th>
                  <th className="table-th">{t('E-mail', 'Email')}</th>
                  <th className="table-th">{t('Rôles', 'Roles')}</th>
                  <th className="table-th">{t('Statut', 'Status')}</th>
                  <th className="table-th text-right">{t('Actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="data-row">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-bcp-orange to-bcp-brown flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-600 dark:text-gray-300 truncate">{user.email}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {user.roleNames.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">{t('Aucun rôle', 'No roles')}</span>
                        ) : user.roleNames.map((role) => (
                          <span key={role} className="badge badge-brand rounded-md">
                            {roleLabel(role)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`badge ${
                        user.isActive ? 'badge-success' : 'badge-neutral'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {user.isActive ? t('Actif', 'Active') : t('Inactif', 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRoleModalUser(user)}
                          disabled={!user.isActive || !canManageUser(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-bcp-brown border border-bcp-orange/25 rounded-lg text-xs font-semibold hover:bg-orange-100 hover:border-bcp-orange/40 dark:bg-bcp-orange/10 dark:text-bcp-orange-light dark:border-bcp-orange/20 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-50"
                          title={!canManageUser(user) ? protectedTitle : user.isActive ? t('Gérer les rôles', 'Manage roles') : t('Activez le compte avant d’attribuer des rôles', 'Activate the account before assigning roles')}
                        >
                          <Shield size={14} /> {t('Rôles', 'Roles')}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setFormData({
                              username: user.username,
                              email: user.email,
                              firstName: user.firstName,
                              lastName: user.lastName,
                              password: '',
                              isActive: user.isActive,
                            });
                            setViewMode('edit');
                          }}
                          disabled={!canManageUser(user)}
                          title={!canManageUser(user) ? protectedTitle : undefined}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold hover:border-bcp-brown/40 hover:text-bcp-brown dark:bg-dark-bg-soft dark:text-gray-300 dark:border-dark-border dark:hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Edit2 size={14} /> {t('Modifier', 'Edit')}
                        </button>
                        <button
                          onClick={() => setStatusTarget(user)}
                          disabled={!canManageUser(user)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${user.isActive
                            ? 'bg-red-50 text-red-600 border-red-200/70 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/70 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          }`}
                          title={!canManageUser(user) ? protectedTitle : user.isActive ? t('Désactiver le compte', 'Deactivate account') : t('Activer le compte', 'Activate account')}
                        >
                          <Power size={14} /> {user.isActive ? t('Désactiver', 'Deactivate') : t('Activer', 'Activate')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── CREATE / EDIT FORM ───
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <button
        onClick={resetForm}
        className="btn-ghost -ml-3 px-3 py-2 text-gray-600"
      >
        <ArrowLeft size={16} /> {t('Retour aux utilisateurs', 'Back to users')}
      </button>

      <div className="page-hero">
        <div className="page-hero-icon">{viewMode === 'create' ? <UserPlus className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}</div>
        <h1 className="page-title">
          {viewMode === 'create' ? t('Créer un utilisateur', 'Create user') : t('Modifier l’utilisateur', 'Edit user')}
        </h1>
      </div>

      <div className="card-base p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('Identifiant', 'Username')} *</label>
            <input
              type="text"
              disabled={viewMode === 'edit'}
              value={formData.username}
              onChange={(e) => { setFormData({ ...formData, username: e.target.value }); setFormErrors(prev => ({ ...prev, username: '' })); }}
              aria-invalid={Boolean(formErrors.username)}
              aria-describedby={formErrors.username ? 'user-username-error' : undefined}
              className={`premium-input disabled:bg-gray-50 disabled:text-gray-400 ${formErrors.username ? '!border-red-400 !bg-red-50/40 dark:!bg-red-500/10 focus:!border-red-500 focus:!ring-red-500/15' : ''}`}
            />
            {formErrors.username && <p id="user-username-error" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{formErrors.username}</p>}
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('E-mail', 'Email')} *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFormErrors(prev => ({ ...prev, email: '' })); }}
              aria-invalid={Boolean(formErrors.email)}
              aria-describedby={formErrors.email ? 'user-email-error' : undefined}
              className={`premium-input ${formErrors.email ? '!border-red-400 !bg-red-50/40 dark:!bg-red-500/10 focus:!border-red-500 focus:!ring-red-500/15' : ''}`}
            />
            {formErrors.email && <p id="user-email-error" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{formErrors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('Prénom', 'First name')} *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); setFormErrors(prev => ({ ...prev, firstName: '' })); }}
              aria-invalid={Boolean(formErrors.firstName)}
              aria-describedby={formErrors.firstName ? 'user-first-name-error' : undefined}
              className={`premium-input ${formErrors.firstName ? '!border-red-400 !bg-red-50/40 dark:!bg-red-500/10 focus:!border-red-500 focus:!ring-red-500/15' : ''}`}
            />
            {formErrors.firstName && <p id="user-first-name-error" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{formErrors.firstName}</p>}
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('Nom', 'Last name')} *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); setFormErrors(prev => ({ ...prev, lastName: '' })); }}
              aria-invalid={Boolean(formErrors.lastName)}
              aria-describedby={formErrors.lastName ? 'user-last-name-error' : undefined}
              className={`premium-input ${formErrors.lastName ? '!border-red-400 !bg-red-50/40 dark:!bg-red-500/10 focus:!border-red-500 focus:!ring-red-500/15' : ''}`}
            />
            {formErrors.lastName && <p id="user-last-name-error" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{formErrors.lastName}</p>}
          </div>
        </div>

        {viewMode === 'create' && (
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('Mot de passe', 'Password')} *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setFormErrors(prev => ({ ...prev, password: '' })); }}
                aria-invalid={Boolean(formErrors.password)}
                aria-describedby={formErrors.password ? 'user-password-error' : undefined}
                className={`premium-input pr-10 ${formErrors.password ? '!border-red-400 !bg-red-50/40 dark:!bg-red-500/10 focus:!border-red-500 focus:!ring-red-500/15' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('Masquer le mot de passe', 'Hide password') : t('Afficher le mot de passe', 'Show password')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bcp-orange"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formErrors.password && <p id="user-password-error" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{formErrors.password}</p>}
          </div>
        )}

        {viewMode === 'create' ? (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 accent-bcp-orange text-bcp-orange focus:ring-bcp-orange"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('Actif', 'Active')}</span>
          </label>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('Le statut se modifie depuis la liste des utilisateurs.', 'Change the status from the user list.')}</p>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t border-gray-100 dark:border-dark-border">
          <button
            onClick={resetForm}
            className="btn-outline"
          >
            {t('Annuler', 'Cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            {viewMode === 'create' ? t('Créer l’utilisateur', 'Create user') : t('Enregistrer les modifications', 'Save changes')}
          </button>
        </div>
      </div>
    </div>
  );
}
