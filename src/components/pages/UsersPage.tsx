/**
 * Users Management Page
 * Manage users and assign roles
 */

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, Shield, X, UserPlus, ArrowLeft } from 'lucide-react';
import { useToast } from '../../utils/toastStore';
import { apiService } from '../../services/api';

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

const ROLE_LABELS: Record<string, string> = {
  PROFIL_ADMIN_CENTRAL: 'Admin Central',
  PROFIL_SAISIE: 'Data Entry',
  PROFIL_VALIDATEUR: 'Validator',
  PROFIL_CONSULTATION: 'Consultation',
};

type ViewMode = 'list' | 'create' | 'edit';

export default function UsersPage() {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [users, setUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [assigningRole, setAssigningRole] = useState(false);

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
      toast.error('Failed to load data');
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
    if (!formData.username || !formData.email || !formData.firstName || !formData.lastName) {
      toast.error('Please fill all required fields');
      return;
    }
    if (viewMode === 'create' && (!formData.password || formData.password.length < 6)) {
      toast.error('Password must be at least 6 characters');
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
        toast.success('User created successfully');
      } else if (selectedUser) {
        await apiService.updateUser(selectedUser.id, {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          isActive: formData.isActive,
        });
        toast.success('User updated successfully');
      }
      await fetchData();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await apiService.deleteUser(userId);
      toast.success('User deleted');
      await fetchData();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleAssignRole = async (userId: number, roleId: number) => {
    setAssigningRole(true);
    try {
      await apiService.assignRoleToUser(userId, roleId);
      toast.success('Role assigned successfully');
      await fetchData();
      // Update the modal user
      const updated = (await apiService.getUsers()).data;
      const refreshed = (Array.isArray(updated) ? updated : []).find((u: User) => u.id === userId);
      if (refreshed) setRoleModalUser(refreshed);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign role');
    } finally {
      setAssigningRole(false);
    }
  };

  const handleRevokeRole = async (userId: number, roleId: number) => {
    setAssigningRole(true);
    try {
      await apiService.revokeRoleFromUser(userId, roleId);
      toast.success('Role revoked');
      await fetchData();
      const updated = (await apiService.getUsers()).data;
      const refreshed = (Array.isArray(updated) ? updated : []).find((u: User) => u.id === userId);
      if (refreshed) setRoleModalUser(refreshed);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to revoke role');
    } finally {
      setAssigningRole(false);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', firstName: '', lastName: '', password: '', isActive: true });
    setViewMode('list');
    setSelectedUser(null);
  };

  // ─── LIST VIEW ───
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {/* Role Assignment Modal */}
        {roleModalUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="bg-gradient-to-r from-bcp-orange to-bcp-brown px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">
                  Manage Roles — {roleModalUser.firstName} {roleModalUser.lastName}
                </h3>
                <button onClick={() => setRoleModalUser(null)} className="text-white/80 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Current roles */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Roles</h4>
                  {roleModalUser.roleNames.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No roles assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {roleModalUser.roleNames.map((roleName) => {
                        const role = allRoles.find(r => r.roleName === roleName);
                        return (
                          <span key={roleName} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bcp-orange/10 text-bcp-brown border border-bcp-orange/20 rounded-lg text-sm font-medium">
                            <Shield size={14} />
                            {ROLE_LABELS[roleName] || roleName}
                            <button
                              onClick={() => role && handleRevokeRole(roleModalUser.id, role.id)}
                              disabled={assigningRole}
                              className="ml-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                              title="Revoke role"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Available roles */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Assign Role</h4>
                  <div className="space-y-2">
                    {allRoles
                      .filter(r => r.isActive && !roleModalUser.roleNames.includes(r.roleName))
                      .map((role) => (
                        <button
                          key={role.id}
                          onClick={() => handleAssignRole(roleModalUser.id, role.id)}
                          disabled={assigningRole}
                          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-bcp-orange/5 hover:border-bcp-orange/30 transition disabled:opacity-50 group"
                        >
                          <div className="text-left">
                            <p className="font-medium text-gray-700 group-hover:text-bcp-brown">
                              {ROLE_LABELS[role.roleName] || role.roleName}
                            </p>
                            <p className="text-xs text-gray-400">{role.description}</p>
                          </div>
                          <UserPlus size={18} className="text-gray-300 group-hover:text-bcp-orange" />
                        </button>
                      ))}
                    {allRoles.filter(r => r.isActive && !roleModalUser.roleNames.includes(r.roleName)).length === 0 && (
                      <p className="text-sm text-gray-400 italic">All roles are already assigned</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                <button
                  onClick={() => setRoleModalUser(null)}
                  className="px-5 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage users and assign roles</p>
          </div>
          <button
            onClick={() => {
              setViewMode('create');
              setSelectedUser(null);
              setFormData({ username: '', email: '', firstName: '', lastName: '', password: '', isActive: true });
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-bcp-orange to-bcp-brown text-white px-5 py-2.5 rounded-lg font-medium hover:shadow-lg transition"
          >
            <Plus size={18} /> New User
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bcp-orange/30 focus:border-bcp-orange text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-4 animate-fadeIn">
              <div className="w-12 h-12 border-4 border-bcp-orange/20 border-t-bcp-orange rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Synchronizing Registry</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No users found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Roles</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bcp-orange to-bcp-brown flex items-center justify-center text-white text-sm font-bold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roleNames.length === 0 ? (
                          <span className="text-xs text-gray-300 italic">No roles</span>
                        ) : user.roleNames.map((role) => (
                          <span key={role} className="px-2 py-0.5 bg-bcp-orange/10 text-bcp-brown text-xs rounded-md font-medium">
                            {ROLE_LABELS[role] || role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRoleModalUser(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-bcp-orange/10 text-bcp-brown border border-bcp-orange/20 rounded-lg text-xs font-medium hover:bg-bcp-orange/20 transition"
                          title="Manage roles"
                        >
                          <Shield size={14} /> Roles
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
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-medium hover:bg-blue-100 transition"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // ─── CREATE / EDIT FORM ───
  return (
    <div className="space-y-6 max-w-2xl">
      <button
        onClick={resetForm}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Users
      </button>

      <h1 className="text-2xl font-bold text-gray-800">
        {viewMode === 'create' ? 'Create User' : 'Edit User'}
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              type="text"
              disabled={viewMode === 'edit'}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bcp-orange/30 focus:border-bcp-orange text-sm disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bcp-orange/30 focus:border-bcp-orange text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bcp-orange/30 focus:border-bcp-orange text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bcp-orange/30 focus:border-bcp-orange text-sm"
            />
          </div>
        </div>

        {viewMode === 'create' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bcp-orange/30 focus:border-bcp-orange text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-bcp-orange focus:ring-bcp-orange"
          />
          <span className="text-sm text-gray-700">Active</span>
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={resetForm}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-bcp-orange to-bcp-brown text-white rounded-lg font-medium hover:shadow-lg transition text-sm"
          >
            {viewMode === 'create' ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
