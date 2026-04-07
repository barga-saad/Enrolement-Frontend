/**
 * Roles Management Page
 * View roles and their permissions
 */

import { useState, useEffect } from 'react';
import { Shield, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '../../utils/toastStore';
import { apiService } from '../../services/api';

interface Role {
  id: number;
  roleName: string;
  description: string;
  isActive: boolean;
  permissionNames: string[];
}

const ROLE_LABELS: Record<string, string> = {
  PROFIL_ADMIN_CENTRAL: 'Admin Central',
  PROFIL_SAISIE: 'Data Entry',
  PROFIL_VALIDATEUR: 'Validator',
  PROFIL_CONSULTATION: 'Consultation',
};

const PERMISSION_LABELS: Record<string, string> = {
  PARTNER_CREATE: 'Create Partners',
  PARTNER_UPDATE_OWN: 'Update Own Partners',
  PARTNER_VALIDATE: 'Validate Partners',
  PARTNER_DELETE: 'Delete Partners',
  PARTNER_VIEW_OWN: 'View Own Partners',
  PARTNER_LIST_ALL: 'List All Partners',
  TRANSFER_CREATE: 'Create Transfers',
  TRANSFER_VIEW_OWN: 'View Own Transfers',
  TRANSFER_LIST_ALL: 'List All Transfers',
  TRANSFER_VALIDATE: 'Validate Transfers',
  DOCUMENT_PRINT: 'Print Documents',
  REPORT_EXPORT: 'Export Reports',
  ADMIN_USER_MANAGE: 'Manage Users',
  ADMIN_ROLE_MANAGE: 'Manage Roles',
  ADMIN_PERMISSION_MANAGE: 'Manage Permissions',
};

const PERMISSION_GROUPS: Record<string, string[]> = {
  Partners: ['PARTNER_CREATE', 'PARTNER_UPDATE_OWN', 'PARTNER_VALIDATE', 'PARTNER_DELETE', 'PARTNER_VIEW_OWN', 'PARTNER_LIST_ALL'],
  Transfers: ['TRANSFER_CREATE', 'TRANSFER_VIEW_OWN', 'TRANSFER_LIST_ALL', 'TRANSFER_VALIDATE'],
  Documents: ['DOCUMENT_PRINT', 'REPORT_EXPORT'],
  Administration: ['ADMIN_USER_MANAGE', 'ADMIN_ROLE_MANAGE', 'ADMIN_PERMISSION_MANAGE'],
};

export default function RolesPage() {
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRole, setExpandedRole] = useState<number | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRoles();
      const data = Array.isArray(response.data) ? response.data : [];
      setRoles(data);
    } catch (error: any) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter((r) =>
    r.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-fadeIn">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-bcp-orange/20 border-t-bcp-orange rounded-2xl animate-spin" />
          <Shield className="absolute inset-0 m-auto w-6 h-6 text-bcp-orange/40" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Governance Sync</p>
          <div className="w-24 h-1 bg-gray-100 dark:bg-dark-bg-soft rounded-full overflow-hidden">
            <div className="bg-bcp-orange h-full w-full animate-[progress_2s_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
          <p className="text-sm text-gray-500 mt-1">View system roles and their permissions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bcp-orange/30 focus:border-bcp-orange text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredRoles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No roles found</p>
          </div>
        ) : (
          filteredRoles.map((role) => {
            const isExpanded = expandedRole === role.id;
            return (
              <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-bcp-orange to-bcp-brown flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800">
                        {ROLE_LABELS[role.roleName] || role.roleName}
                      </h3>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      role.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      {role.permissionNames?.length || 0} permissions
                    </span>
                    {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    <div className="space-y-4">
                      {Object.entries(PERMISSION_GROUPS).map(([group, permCodes]) => {
                        const granted = permCodes.filter(code => role.permissionNames?.includes(code));
                        if (granted.length === 0) return null;
                        return (
                          <div key={group}>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{group}</h4>
                            <div className="flex flex-wrap gap-2">
                              {permCodes.map(code => {
                                const has = role.permissionNames?.includes(code);
                                return (
                                  <span
                                    key={code}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                                      has
                                        ? 'bg-bcp-orange/10 text-bcp-brown border border-bcp-orange/20'
                                        : 'bg-gray-50 text-gray-300 border border-gray-100'
                                    }`}
                                  >
                                    {PERMISSION_LABELS[code] || code}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
