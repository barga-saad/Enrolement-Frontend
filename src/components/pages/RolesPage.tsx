/**
 * Roles Management Page
 * Complete role management system with CRUD operations and permissions matrix
 */

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { FormInput, FormSection } from '../common/FormComponents';
import { Table, TableColumn } from '../common/Table';
import { useToast } from '../../utils/toastStore';
import { apiService } from '../../services/api';
import { validators, validateForm, hasErrors } from '../../utils/validation';

interface Role {
  id: number;
  roleName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  permissionCount?: number;
}

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  granted?: boolean;
}

type ViewMode = 'list' | 'create' | 'edit';

export default function RolesPage() {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});

  const [formData, setFormData] = useState<Partial<Role>>({
    isActive: true,
  });

  const [rolePermissions, setRolePermissions] = useState<Record<number, boolean>>({});

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Load roles from API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRoles();
      // Admin endpoints return data directly
      const data = Array.isArray(response.data) ? response.data : [];
      setRoles(data);
      toast.success('Roles loaded');
    } catch (error: any) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
      // Mock data
      setRoles([
        {
          id: 1,
          roleName: 'ADMIN',
          description: 'Administrator with full access',
          isActive: true,
          createdAt: '2024-01-01',
          permissionCount: 15,
        },
        {
          id: 2,
          roleName: 'VALIDATOR',
          description: 'Can validate partner enrollments',
          isActive: true,
          createdAt: '2024-01-15',
          permissionCount: 5,
        },
        {
          id: 3,
          roleName: 'VIEWER',
          description: 'View-only access to partners',
          isActive: true,
          createdAt: '2024-02-01',
          permissionCount: 2,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load permissions from API
  const fetchPermissions = async () => {
    try {
      const response = await apiService.getPermissions();
      // Admin endpoints return data directly
      const data = Array.isArray(response.data) ? response.data : [];
      setPermissions(data);
    } catch (error: any) {
      console.error('Error loading permissions:', error);
      // Mock permissions
      setPermissions([
        {
          id: 1,
          code: 'PARTNER_CREATE',
          name: 'Create Partners',
          description: 'Can create new partner records',
          granted: false,
        },
        {
          id: 2,
          code: 'PARTNER_READ',
          name: 'View Partners',
          description: 'Can view partner details',
          granted: false,
        },
        {
          id: 3,
          code: 'PARTNER_UPDATE',
          name: 'Edit Partners',
          description: 'Can modify partner information',
          granted: false,
        },
        {
          id: 4,
          code: 'PARTNER_DELETE',
          name: 'Delete Partners',
          description: 'Can delete partner records',
          granted: false,
        },
        {
          id: 5,
          code: 'PARTNER_VALIDATE',
          name: 'Validate Partners',
          description: 'Can approve/reject partners',
          granted: false,
        },
        {
          id: 6,
          code: 'USER_CREATE',
          name: 'Create Users',
          description: 'Can create new users',
          granted: false,
        },
        {
          id: 7,
          code: 'USER_READ',
          name: 'View Users',
          description: 'Can view user details',
          granted: false,
        },
        {
          id: 8,
          code: 'USER_UPDATE',
          name: 'Edit Users',
          description: 'Can modify user information',
          granted: false,
        },
        {
          id: 9,
          code: 'USER_DELETE',
          name: 'Delete Users',
          description: 'Can delete users',
          granted: false,
        },
        {
          id: 10,
          code: 'ROLE_CREATE',
          name: 'Create Roles',
          description: 'Can create new roles',
          granted: false,
        },
        {
          id: 11,
          code: 'ROLE_READ',
          name: 'View Roles',
          description: 'Can view role details',
          granted: false,
        },
        {
          id: 12,
          code: 'ROLE_UPDATE',
          name: 'Edit Roles',
          description: 'Can modify role information',
          granted: false,
        },
        {
          id: 13,
          code: 'ROLE_DELETE',
          name: 'Delete Roles',
          description: 'Can delete roles',
          granted: false,
        },
        {
          id: 14,
          code: 'TRANSFER_CREATE',
          name: 'Create Transfers',
          description: 'Can create fund transfers',
          granted: false,
        },
        {
          id: 15,
          code: 'TRANSFER_APPROVE',
          name: 'Approve Transfers',
          description: 'Can approve transfers',
          granted: false,
        },
      ]);
    }
  };

  // Validation rules
  const validationRules = {
    roleName: [
      validators.required('Role name'),
      validators.minLength(2),
    ],
    description: [validators.required('Description')],
  };

  // Filter roles
  const filteredRoles = roles.filter((r) =>
    r.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
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
        const newRoleData = {
          roleName: formData.roleName,
          description: formData.description,
          isActive: formData.isActive,
          permissions: Object.keys(rolePermissions)
            .filter((key) => rolePermissions[parseInt(key)])
            .map((key) => parseInt(key)),
        };

        await apiService.createRole(newRoleData);
        toast.success('Role created successfully!');
        await fetchRoles();
        resetForm();
      } else if (viewMode === 'edit' && selectedRole) {
        const updateData = {
          description: formData.description,
          isActive: formData.isActive,
          permissions: Object.keys(rolePermissions)
            .filter((key) => rolePermissions[parseInt(key)])
            .map((key) => parseInt(key)),
        };

        await apiService.updateRole(selectedRole.id, updateData);
        toast.success('Role updated successfully!');
        await fetchRoles();
        resetForm();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Operation failed';
      toast.error(errorMsg);
    }
  };

  // Delete role
  const handleDelete = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await apiService.deleteRole(roleId);
      toast.success('Role deleted successfully!');
      await fetchRoles();
    } catch (error: any) {
      toast.error('Failed to delete role');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ isActive: true });
    setRolePermissions({});
    setFormErrors({});
    setViewMode('list');
    setSelectedRole(null);
  };

  const columns: TableColumn<Role>[] = [
    { key: 'roleName', header: 'Role Name', sortable: true },
    { key: 'description', header: 'Description', sortable: true },
    {
      key: 'permissionCount',
      header: 'Permissions',
      render: (permissionCount: number | undefined) => (
        <span className="font-semibold text-blue-600">{permissionCount || 0}</span>
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

  // Permission groups for better organization
  const permissionGroups = {
    Partners: permissions.filter((p) => p.code.includes('PARTNER')),
    Users: permissions.filter((p) => p.code.includes('USER')),
    Roles: permissions.filter((p) => p.code.includes('ROLE')),
    Transfers: permissions.filter((p) => p.code.includes('TRANSFER')),
  };

  // --- LIST VIEW ---
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Role Management</h1>
          <button
            onClick={() => {
              setViewMode('create');
              setSelectedRole(null);
              setFormData({ isActive: true });
              setRolePermissions({});
            }}
            className="flex items-center gap-2 bg-cyan-700 text-white px-6 py-2 rounded-full font-semibold hover:bg-cyan-800"
          >
            <Plus size={20} /> New Role
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by role name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table<Role>
            columns={columns}
            data={filteredRoles}
            keyField="id"
            loading={loading}
            emptyMessage="No roles found"
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedRole(row);
                    setFormData({
                      roleName: row.roleName,
                      description: row.description,
                      isActive: row.isActive,
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
      <div className="space-y-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800">
          {viewMode === 'create' ? 'New Role' : 'Edit Role'}
        </h1>

        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <FormSection title="Role Information">
            <FormInput
              label="Role Name"
              required
              disabled={viewMode === 'edit'}
              value={formData.roleName || ''}
              onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
              error={formErrors.roleName || undefined}
            />
            <FormInput
              label="Description"
              required
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={formErrors.description || undefined}
            />
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive || false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-gray-700">Active Role</span>
            </label>
          </FormSection>

          {/* Permissions Matrix */}
          <FormSection title="Permissions">
            <p className="text-sm text-gray-600 mb-4">
              Select permissions to grant to this role
            </p>

            <div className="space-y-6">
              {Object.entries(permissionGroups).map(([group, perms]) => (
                <div key={group}>
                  <h4 className="font-semibold text-gray-800 mb-3 text-lg border-b-2 border-cyan-600 pb-2">
                    {group}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {perms.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={rolePermissions[permission.id] || false}
                          onChange={(e) =>
                            setRolePermissions({
                              ...rolePermissions,
                              [permission.id]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 mt-0.5 rounded"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{permission.name}</p>
                          <p className="text-sm text-gray-600">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Permission Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Selected permissions:{' '}
              <span className="font-bold text-blue-600">
                {Object.values(rolePermissions).filter(Boolean).length} / {permissions.length}
              </span>
            </p>
          </div>

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
