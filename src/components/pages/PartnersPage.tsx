import { useState, useEffect } from 'react';
import { Plus, Eye, Check, X, Edit2, Search, Filter, Download, Shield, FileText } from 'lucide-react';
import { FormInput, FormSelect, FormSection, FormBlock, FormToggleRow } from '../common/FormComponents';
import { Table, TableColumn } from '../common/Table';
import { Toggle } from '../common/Toggle';
import { useToast } from '../../utils/toastStore';
import { useAuth } from '../../hooks';
import { apiService } from '../../services/api';
import { validators, validateForm, hasErrors } from '../../utils/validation';

interface Partner {
  id: number;
  code: string;
  name: string;
  type: string;
  country: string;
  classification: string;
  accountNumber: string;
  status: 'active' | 'inactive' | 'pending' | 'validation';
  createdAt: string;
}

interface TransactionType {
  type: string;
  enabled: boolean;
  limit: number;
  details?: string;
}

type ViewMode = 'list' | 'create' | 'edit' | 'validate' | 'consult';

const PartnersPage = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Partner>>({
    type: 'Enterprise',
    country: 'Morocco',
    status: 'active',
  });

  const isAdmin = user?.roleNames?.some((role) => role === 'PROFIL_ADMIN_CENTRAL') || false;
  const isValidator = user?.roleNames?.some((role) => role === 'PROFIL_VALIDATEUR') || false;
  const isSaisie = user?.roleNames?.some((role) => role === 'PROFIL_SAISIE') || false;
  const isConsultation = user?.roleNames?.some((role) => role === 'PROFIL_CONSULTATION') || false;

  const canCreate = isAdmin || isSaisie;
  const canValidate = isAdmin || isValidator;

  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
  const [transactions, setTransactions] = useState<TransactionType[]>([
    { type: 'Virement instantané intra BP', enabled: true, limit: 10000 },
    { type: 'Virement instantané confrère', enabled: false, limit: 0 },
    { type: 'Virement SRBM confrère (RTGS)', enabled: false, limit: 0 },
    { type: 'Virement ordinaire confrère', enabled: true, limit: 50000 },
    { type: 'Transfert Wallet', enabled: false, limit: 0 },
    { type: 'Mise à disposition', enabled: true, limit: 5000 },
  ]);

  const [compliance] = useState({
    donnerOrdre: { type: true, number: true, city: true },
    beneficiaire: { type: true, number: true, address: true },
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPartners();
      const data = response.data.data || response.data;
      setPartners(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading partners:', error);
      setPartners([
        { id: 1, code: 'JESAINTL', name: 'JESAINTL', type: 'Enterprise', country: 'Morocco', classification: 'Large', accountNumber: 'MA00000000000000000000001', status: 'pending', createdAt: '2024-03-11' },
        { id: 2, code: 'JESANURG', name: 'JESANURG', type: 'Enterprise', country: 'Morocco', classification: 'Medium', accountNumber: 'MA00000000000000000000002', status: 'validation', createdAt: '2024-03-10' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validationRules = {
    name: [validators.required('Partner name'), validators.minLength(3)],
    accountNumber: [validators.required('Account number'), validators.bankAccount()],
    country: [validators.required('Country')],
    classification: [validators.required('Classification')],
  };

  const filteredPartners = partners.filter((p) => {
    const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (isAdmin) return true;
    if (isValidator) return p.status === 'pending' || p.status === 'validation';
    return true;
  });

  const validateFormData = () => {
    const errors = validateForm(formData, validationRules as any);
    setFormErrors(errors);
    return !hasErrors(errors);
  };

  const handleSubmit = async () => {
    if (!validateFormData()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      if (viewMode === 'create') {
        const newPartnerData = {
          name: formData.name,
          type: formData.type,
          country: formData.country,
          classification: formData.classification,
          accountNumber: formData.accountNumber,
          status: formData.status,
          transactionTypes: transactions.filter(t => t.enabled),
        };
        await apiService.createPartner(newPartnerData);
        toast.success('Partner created successfully!');
        await fetchPartners();
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sync partner data');
    }
  };

  const resetForm = () => {
    setFormData({ type: 'Enterprise', country: 'Morocco', status: 'active' });
    setFormErrors({});
    setViewMode('list');
  };

  const statusColors = {
    active: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
    inactive: 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20',
    pending: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    validation: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
  };

  const columns: TableColumn<Partner>[] = [
    { key: 'code', header: 'Client ID', sortable: true },
    { 
      key: 'name', 
      header: 'Partner Designation', 
      sortable: true,
      render: (name) => <span className="font-bold text-gray-900 dark:text-white">{name}</span>
    },
    { key: 'createdAt', header: 'Enrollment Date', sortable: true },
    {
      key: 'status',
      header: 'Security Status',
      render: (status: string) => (
        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusColors[status as keyof typeof statusColors]}`}>
          {status === 'validation' ? 'Awaiting' : status === 'pending' ? 'Pending' : status}
        </span>
      ),
    },
  ];

  if (viewMode === 'list') {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Partner Registry</h1>
            <p className="text-gray-500 dark:text-dark-text-dim text-sm font-medium mt-1">
              {isSaisie ? 'Enroll and manage your verified partner accounts' :
               isValidator ? 'Governance and validation of pending partner requests' :
               'Secure consultation of the partner database'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2.5 bg-white dark:bg-dark-bg-soft border border-gray-100 dark:border-dark-border rounded-xl text-gray-500 hover:text-bcp-orange transition-colors">
              <Download size={20} />
            </button>
            {canCreate && (
              <button
                onClick={() => { setViewMode('create'); setSelectedPartner(null); }}
                className="btn-primary space-x-2"
              >
                <Plus size={20} /> 
                <span>New Partner</span>
              </button>
            )}
          </div>
        </div>

        <div className="card-base p-2 bg-white/50 dark:bg-dark-bg-soft/50 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center gap-4 p-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by ID, name or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-[1.25rem] focus:ring-4 focus:ring-bcp-orange/10 focus:border-bcp-orange outline-none transition-all text-sm"
              />
            </div>
            <button className="flex items-center space-x-2 px-6 py-3 bg-white dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-[1.25rem] text-sm font-bold text-gray-600 dark:text-dark-text-dim hover:border-bcp-orange transition-all">
              <Filter size={16} />
              <span>Advanced Filter</span>
            </button>
          </div>
          
          <Table
            columns={columns}
            data={filteredPartners}
            keyField="id"
            loading={loading}
            emptyMessage={loading ? 'Synchronizing registry...' : 'No matching partners identified'}
            actions={(row) => (
              <div className="flex gap-2">
                {canValidate && (row.status === 'pending' || row.status === 'validation') && (
                  <button
                    onClick={() => { setSelectedPartner(row); setViewMode('validate'); }}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 transition-all"
                  >
                    Validate
                  </button>
                )}
                <button
                  onClick={() => { setSelectedPartner(row); setViewMode('consult'); }}
                  className="p-2 bg-gray-50 dark:bg-dark-bg dark:border-dark-border rounded-xl text-gray-400 hover:text-bcp-orange hover:bg-orange-50 transition-all"
                >
                  <Eye size={18} />
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
      <div className="space-y-8 max-w-6xl mx-auto animate-slideUp">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'create' ? 'Partner Enrollment' : 'Update Profile'}
            </h1>
            <p className="text-gray-500 dark:text-dark-text-dim text-sm font-medium">Compliance-driven partner setup</p>
          </div>
          <button onClick={resetForm} className="p-3 text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="bg-white dark:bg-dark-bg-card rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-dark-border p-8 md:p-12 space-y-12">
          {/* IDENTITY */}
          <FormSection title="Core Identity" subtitle="Official registration details and classification">
            <FormBlock title="System ID & Status" bgColor="gray">
              <FormInput label="Internal Code" value={formData.code || 'SYS_GEN_PENDING'} disabled />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Entity Type"
                  required
                  value={formData.type || 'Enterprise'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  options={[
                    { value: 'Enterprise', label: 'Joint Stock' },
                    { value: 'Individual', label: 'Sole Proprietor' },
                    { value: 'SME', label: 'Startup/SME' },
                  ]}
                />
                <FormSelect
                  label="Account Status"
                  required
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  options={[
                    { value: 'active', label: 'Activeable' },
                    { value: 'inactive', label: 'On Hold' },
                  ]}
                />
              </div>
            </FormBlock>

            <FormBlock title="Legal Profile" bgColor="orange">
              <FormInput
                label="Designation / Trade Name"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={formErrors.name || undefined}
                placeholder="Full legal entity name"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Jurisdiction"
                  required
                  value={formData.country || 'Morocco'}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  error={formErrors.country || undefined}
                  options={[
                    { value: 'Morocco', label: 'Morocco (Main)' },
                    { value: 'France', label: 'EU Hub (France)' },
                    { value: 'Tunisia', label: 'MENA (Tunisia)' },
                  ]}
                />
                <FormSelect
                  label="Risk Tier"
                  required
                  value={formData.classification || ''}
                  onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                  error={formErrors.classification || undefined}
                  options={[
                    { value: 'Large', label: 'Tier 1 (Large)' },
                    { value: 'Medium', label: 'Tier 2 (Medium)' },
                    { value: 'Small', label: 'Tier 3 (Emerging)' },
                  ]}
                />
              </div>
            </FormBlock>
          </FormSection>

          {/* BANKING */}
          <FormSection title="Financial Gateway" subtitle="Payment methods and transaction thresholds">
            <div className="col-span-full">
              <FormInput
                label="Master Settlement Account (RIB)"
                required
                placeholder="XX XXX XXXXXXXXXXXX XXXXX X XX"
                value={formData.accountNumber || ''}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                error={formErrors.accountNumber || undefined}
              />
            </div>

            <div className="col-span-full mt-6 card-base overflow-hidden border border-gray-100 dark:border-dark-border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-dark-border">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-400">Transaction Protocol</th>
                    <th className="px-6 py-4 text-center font-bold text-xs uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-gray-400">Daily Exposure (MAD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className={`transition-colors ${!tx.enabled ? 'bg-gray-50/50 opacity-40' : 'hover:bg-orange-50/20'}`}>
                      <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">{tx.type}</td>
                      <td className="px-6 py-4 text-center">
                        <Toggle
                          checked={tx.enabled}
                          onChange={(checked) => {
                            const updated = [...transactions];
                            updated[idx].enabled = checked;
                            setTransactions(updated);
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input
                          type="number"
                          value={tx.limit}
                          onChange={(e) => {
                            const updated = [...transactions];
                            updated[idx].limit = parseFloat(e.target.value);
                            setTransactions(updated);
                          }}
                          disabled={!tx.enabled}
                          className="w-32 text-right bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 font-bold focus:ring-bcp-orange/20 focus:border-bcp-orange transition-all"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormSection>

          {/* ACTIONS */}
          <div className="flex justify-between items-center pt-10 border-t border-gray-100 dark:border-dark-border">
            <button
              onClick={resetForm}
              className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg-soft transition-all"
            >
              Cancel Setup
            </button>
            <button
              onClick={handleSubmit}
              className="px-12 py-4 bg-gradient-to-r from-bcp-orange to-bcp-orange-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] hover:shadow-orange-500/30 transition-all flex items-center space-x-3"
            >
              <span>Initialize Enrollment</span>
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VALIDATION & CONSULT VIEWS SIMILARLY UPDATED ---
  if ((viewMode === 'validate' || viewMode === 'consult') && selectedPartner) {
    const isVal = viewMode === 'validate';
    return (
      <div className="space-y-8 max-w-5xl mx-auto animate-slideUp">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {isVal ? 'Demand Certification' : 'Partner Intelligence'}
          </h1>
          <button onClick={() => setViewMode('list')} className="p-3 text-gray-400 hover:text-bcp-orange transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="bg-white dark:bg-dark-bg-card rounded-[2.5rem] border border-gray-100 dark:border-dark-border p-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Shield size={200} className="text-bcp-orange" />
          </div>
          
          <div className="relative z-10 space-y-10">
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[selectedPartner.status as keyof typeof statusColors]}`}>
                  {selectedPartner.status}
                </span>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-4">{selectedPartner.name}</h2>
                <p className="text-gray-500 font-bold font-mono mt-1 tracking-tighter">REF: {selectedPartner.code}</p>
              </div>
              <div className="w-20 h-20 bg-gray-50 dark:bg-dark-bg-soft rounded-3xl flex items-center justify-center border border-gray-100 dark:border-dark-border">
                <FileText size={32} className="text-bcp-orange" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Asset Class', value: selectedPartner.type },
                { label: 'Origin Country', value: selectedPartner.country },
                { label: 'Risk Rating', value: selectedPartner.classification },
                { label: 'Registered On', value: selectedPartner.createdAt },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-gray-50/50 dark:bg-dark-bg-soft/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{item.value}</p>
                </div>
              ))}
              <div className="md:col-span-2 p-6 bg-orange-50/30 dark:bg-bcp-orange/5 rounded-2xl border border-bcp-orange/10">
                <p className="text-[10px] font-black text-bcp-orange uppercase tracking-widest mb-1">Settlement RIB</p>
                <p className="text-xl font-black text-bcp-brown dark:text-white font-mono">{selectedPartner.accountNumber}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-10 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => setViewMode('list')}
                className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all font-medium"
              >
                Exit View
              </button>
              {isVal ? (
                <>
                  <button className="btn-secondary space-x-2 bg-red-600 shadow-status-error/20">
                    <X size={20} /> <span>Reject Demand</span>
                  </button>
                  <button className="btn-primary space-x-2 bg-green-600 shadow-status-success/20">
                    <Check size={20} /> <span>Approve Entry</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setViewMode('edit')}
                  className="btn-primary space-x-2"
                >
                  <Edit2 size={18} /> <span>Modify Architecture</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PartnersPage;

