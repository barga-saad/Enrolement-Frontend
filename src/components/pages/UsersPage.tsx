/**
 * Users Management Page
 * Complete user management system with CRUD operations
 */

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import { FormInput, FormSection } from '../common/FormComponents';
import { Table, TableColumn } from '../common/Table';
import { useToast } from '../../utils/toastStore';
import { apiService } from '../../services/api';
import { validators, validateForm, hasErrors } from '../../utils/validation';

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

type ViewMode = 'list' | 'create' | 'edit';

export default function UsersPage() {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});

  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({
    isActive: true,
    roleNames: [],
  });

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Load users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      // Admin endpoints return data directly, not wrapped in ApiResponse
      const data = Array.isArray(response.data) ? response.data : [];
      setUsers(data);
      toast.success('Users loaded');
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
      // Mock data
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@bcp.com',
          firstName: 'Admin',
          lastName: 'User',
          isActive: true,
          roleNames: ['ADMIN'],
          createdAt: '2024-01-01',
        },
        {
          id: 2,
          username: 'validator',
          email: 'validator@bcp.com',
          firstName: 'Validator',
          lastName: 'User',
          isActive: true,
          roleNames: ['VALIDATOR'],
          createdAt: '2024-01-15',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Validation rules
  const validationRules = {
    username: [
      validators.required('Username'),
      validators.minLength(3),
    ],
    email: [
      validators.required('Email'),
      validators.email(),
    ],
    firstName: [validators.required('First name')],
    lastName: [validators.required('Last name')],
    password: viewMode === 'create' ? [validators.required(' Password'), validators.minLength(6)] : [],
  };

  // Filter users
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validate form
  const validateFormData = () => {
    const errors = validateForm(formData, validationRules as any);
    setFormErrors(errors);
    return !hasErrors(errors);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateFormData()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      if (viewMode === 'create') {
        const newUserData = {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          isActive: formData.isActive,
        };

        await apiService.createUser(newUserData);
        toast.success('User created successfully!');
        await fetchUsers();
        resetForm();
      } else if (viewMode === 'edit' && selectedUser) {
        const updateData = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          isActive: formData.isActive,
        };

        await apiService.updateUser(selectedUser.id, updateData);
        toast.success('User updated successfully!');
        await fetchUsers();
        resetForm();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Operation failed';
      toast.error(errorMsg);
    }
  };

  // Delete user
  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiService.deleteUser(userId);
      toast.success('User deleted successfully!');
      await fetchUsers();
    } catch (error: any) {
      toast.error('Failed to delete user');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ isActive: true, roleNames: [] });
    setFormErrors({});
    setViewMode('list');
    setSelectedUser(null);
  };

  const columns: TableColumn<User>[] = [
    { key: 'username', header: 'Username', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'firstName',
      header: 'Name',
      render: (_: string, row: User) => `${row.firstName} ${row.lastName}`,
    },
    {
      key: 'roleNames',
      header: 'Roles',
      render: (roles: string[]) => (
        <div className="flex gap-1 flex-wrap">
          {roles.map((role) => (
            <span key={role} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {role}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (isActive: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  // --- LIST VIEW ---
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <button
            onClick={() => {
              setViewMode('create');
              setSelectedUser(null);
              setFormData({ isActive: true, roleNames: [] });
            }}
            className="flex items-center gap-2 bg-cyan-700 text-white px-6 py-2 rounded-full font-semibold hover:bg-cyan-800"
          >
            <Plus size={20} /> New User
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            columns={columns}
            data={filteredUsers}
            keyField="id"
            loading={loading}
            emptyMessage="No users found"
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(row);
                    setFormData({
                      username: row.username,
                      email: row.email,
                      firstName: row.firstName,
                      lastName: row.lastName,
                      isActive: row.isActive,
                      roleNames: row.roleNames,
                    });
                    setViewMode('edit');
                  }}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          />
        </div>
      </div>
    );
  }

  // --- CREATE/EDIT FORM VIEW ---
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800">
          {viewMode === 'create' ? 'New User' : 'Edit User'}
        </h1>

        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <FormSection title="User Information">
            <FormInput
              label="Username"
              required
              disabled={viewMode === 'edit'}
              value={formData.username || ''}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={formErrors.username || undefined}
            />
            <FormInput
              label="Email"
              required
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email || undefined}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                required
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                error={formErrors.firstName || undefined}
              />
              <FormInput
                label="Last Name"
                required
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                error={formErrors.lastName || undefined}
              />
            </div>

            {viewMode === 'create' && (
              <div className="relative">
                <FormInput
                  label="Password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={formErrors.password || undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
          </FormSection>

          <FormSection title="Status">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive || false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-gray-700">Active User</span>
            </label>
          </FormSection>

          {/* Actions */}
          <div className="flex justify-between items-end pt-6 border-t">
            <button
              onClick={resetForm}
              className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-2 bg-cyan-700 text-white rounded-full font-bold hover:bg-cyan-800"
            >
              💾 Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
