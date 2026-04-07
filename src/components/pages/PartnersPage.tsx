import { useState, useEffect } from 'react';
import { Plus, Eye, Check, X, Edit2, Search, Filter, Download, Shield, FileText } from 'lucide-react';
import { FormInput, FormSelect, FormSection, FormBlock } from '../common/FormComponents';
import { Table, TableColumn } from '../common/Table';
import { Toggle } from '../common/Toggle';
import { useToast } from '../../utils/toastStore';
import { useAuth } from '../../hooks';
import { apiService } from '../../services/api';
import { validators, validateForm, hasErrors } from '../../utils/validation';

// Partner as returned by the API (matches PartnerRequestDto field names)
interface Partner {
  id?: number;
  name: string;
  partnerReferenceNumber: string;
  partnerType: string;
  partnerStatus: boolean;
  headquarterCountry: string;
  parentCompanyCountry?: string;
  classification: string;
  accountNumber: string;
  canal?: string;
  allowedInternalInstantTransfer: boolean;
  allowedExternalInstantTransfer: boolean;
  allowedStandardTransfer: boolean;
  allowedCashPickupTransfer: boolean;
  allowedMassCashPickupTransfer: boolean;
  allowedWalletTransfer: boolean;
  limitInternalInstantTransfer: number;
  limitExternalInstantTransfer: number;
  limitStandardTransfer: number;
  limitCashPickupTransfer: number;
  limitMassCashPickupTransfer: number;
  limitWalletTransfer: number;
  natureMassCashPickupTransfer: string;
  validDaysMassCashPickupTransfer: number;
  mainCurrency: string;
  exchangeRateNature?: string;
  exchangeGainPercentage?: number;
  subscriptionFee?: number;
  subscriptionPeriodicity?: string;
  subscriptionBillingAccount?: string;
  paymentNature: string;
  feeMode?: string;
  monthlyBilling?: boolean;
  immediateDebit?: boolean;
  reimbursement?: string;
  commissionCurrency: string;
  commissionTypeInstantInternal: string;
  commissionAmountInstantInternal: number;
  commissionRateInstantInternal: number;
  commissionTypeInstantExternal: string;
  commissionAmountInstantExternal: number;
  commissionRateInstantExternal: number;
  commissionTypeStandardExternal: string;
  commissionAmountStandardExternal: number;
  commissionRateStandardExternal: number;
  commissionTypeCashPickup: string;
  commissionAmountCashPickup: number;
  commissionRateCashPickup: number;
  commissionTypeMassCashPickup: string;
  commissionAmountMassCashPickup: number;
  commissionRateMassCashPickup: number;
  commissionTypeWallet: string;
  commissionAmountWallet: number;
  commissionRateWallet: number;
}

// Transfer type config for the table
const TRANSFER_TYPES = [
  { label: 'Virement instantané intra BP', allowedKey: 'allowedInternalInstantTransfer', limitKey: 'limitInternalInstantTransfer', commTypeKey: 'commissionTypeInstantInternal', commAmountKey: 'commissionAmountInstantInternal', commRateKey: 'commissionRateInstantInternal' },
  { label: 'Virement instantané confrère', allowedKey: 'allowedExternalInstantTransfer', limitKey: 'limitExternalInstantTransfer', commTypeKey: 'commissionTypeInstantExternal', commAmountKey: 'commissionAmountInstantExternal', commRateKey: 'commissionRateInstantExternal' },
  { label: 'Virement standard confrère', allowedKey: 'allowedStandardTransfer', limitKey: 'limitStandardTransfer', commTypeKey: 'commissionTypeStandardExternal', commAmountKey: 'commissionAmountStandardExternal', commRateKey: 'commissionRateStandardExternal' },
  { label: 'Mise à disposition unitaire', allowedKey: 'allowedCashPickupTransfer', limitKey: 'limitCashPickupTransfer', commTypeKey: 'commissionTypeCashPickup', commAmountKey: 'commissionAmountCashPickup', commRateKey: 'commissionRateCashPickup' },
  { label: 'Mise à disposition de masse', allowedKey: 'allowedMassCashPickupTransfer', limitKey: 'limitMassCashPickupTransfer', commTypeKey: 'commissionTypeMassCashPickup', commAmountKey: 'commissionAmountMassCashPickup', commRateKey: 'commissionRateMassCashPickup' },
  { label: 'Transfert Wallet', allowedKey: 'allowedWalletTransfer', limitKey: 'limitWalletTransfer', commTypeKey: 'commissionTypeWallet', commAmountKey: 'commissionAmountWallet', commRateKey: 'commissionRateWallet' },
] as const;

const DEFAULT_FORM: Partial<Partner> = {
  name: '',
  partnerReferenceNumber: '',
  partnerType: 'Partenaire',
  partnerStatus: true,
  headquarterCountry: 'MA',
  parentCompanyCountry: '',
  classification: 'Medium',
  accountNumber: '',
  canal: '',
  allowedInternalInstantTransfer: false,
  allowedExternalInstantTransfer: false,
  allowedStandardTransfer: false,
  allowedCashPickupTransfer: false,
  allowedMassCashPickupTransfer: false,
  allowedWalletTransfer: false,
  limitInternalInstantTransfer: 0,
  limitExternalInstantTransfer: 0,
  limitStandardTransfer: 0,
  limitCashPickupTransfer: 0,
  limitMassCashPickupTransfer: 0,
  limitWalletTransfer: 0,
  natureMassCashPickupTransfer: '0',
  validDaysMassCashPickupTransfer: 0,
  mainCurrency: 'MAD',
  exchangeRateNature: '0',
  exchangeGainPercentage: 0,
  subscriptionFee: 0,
  subscriptionPeriodicity: '',
  subscriptionBillingAccount: '',
  paymentNature: 'Post-paiement',
  feeMode: '',
  monthlyBilling: false,
  immediateDebit: false,
  reimbursement: '',
  commissionCurrency: 'MAD',
  commissionTypeInstantInternal: 'Flat',
  commissionAmountInstantInternal: 0,
  commissionRateInstantInternal: 0,
  commissionTypeInstantExternal: 'Flat',
  commissionAmountInstantExternal: 0,
  commissionRateInstantExternal: 0,
  commissionTypeStandardExternal: 'Flat',
  commissionAmountStandardExternal: 0,
  commissionRateStandardExternal: 0,
  commissionTypeCashPickup: 'Flat',
  commissionAmountCashPickup: 0,
  commissionRateCashPickup: 0,
  commissionTypeMassCashPickup: 'Flat',
  commissionAmountMassCashPickup: 0,
  commissionRateMassCashPickup: 0,
  commissionTypeWallet: 'Flat',
  commissionAmountWallet: 0,
  commissionRateWallet: 0,
};

type ViewMode = 'list' | 'create' | 'edit' | 'validate' | 'consult';

const PartnersPage = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Partner>>({ ...DEFAULT_FORM });
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});

  const isAdmin = user?.roleNames?.some((role) => role === 'PROFIL_ADMIN_CENTRAL') || false;
  const isValidator = user?.roleNames?.some((role) => role === 'PROFIL_VALIDATEUR') || false;
  const isSaisie = user?.roleNames?.some((role) => role === 'PROFIL_SAISIE') || false;
  const isConsultation = user?.roleNames?.some((role) => role === 'PROFIL_CONSULTATION') || false;

  const canCreate = isAdmin || isSaisie;
  const canValidate = isAdmin || isValidator;

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
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const validationRules = {
    name: [validators.required('Partner name'), validators.minLength(3)],
    accountNumber: [validators.required('Account number'), validators.bankAccount()],
    headquarterCountry: [validators.required('Country')],
    classification: [validators.required('Classification')],
    partnerReferenceNumber: [validators.required('Reference number')],
  };

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      (p.partnerReferenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
        await apiService.createPartner(formData);
        toast.success('Partner created successfully!');
        await fetchPartners();
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create partner');
    }
  };

  const resetForm = () => {
    setFormData({ ...DEFAULT_FORM });
    setFormErrors({});
    setViewMode('list');
  };

  const updateForm = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const columns: TableColumn<Partner>[] = [
    { key: 'partnerReferenceNumber' as any, header: 'Reference', sortable: true },
    { 
      key: 'name' as any, 
      header: 'Partner Designation', 
      sortable: true,
      render: (name: string) => <span className="font-bold text-gray-900 dark:text-white">{name}</span>
    },
    { key: 'partnerType' as any, header: 'Type', sortable: true },
    { key: 'headquarterCountry' as any, header: 'Country', sortable: true },
    {
      key: 'partnerStatus' as any,
      header: 'Status',
      render: (status: boolean) => (
        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
          status
            ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
            : 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20'
        }`}>
          {status ? 'Active' : 'Inactive'}
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

          {/* ── SECTION 1: CORE IDENTITY ── */}
          <FormSection title="Core Identity" subtitle="Official registration details and classification">
            <FormBlock title="System ID & Status" bgColor="gray">
              <FormInput
                label="Partner Reference Number"
                required
                value={formData.partnerReferenceNumber || ''}
                onChange={(e) => updateForm('partnerReferenceNumber', e.target.value)}
                error={formErrors.partnerReferenceNumber || undefined}
                placeholder="e.g. 042999"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Partner Type"
                  required
                  value={formData.partnerType || 'Partenaire'}
                  onChange={(e) => updateForm('partnerType', e.target.value)}
                  options={[
                    { value: 'Partenaire', label: 'Partenaire' },
                    { value: 'Individual', label: 'Individual' },
                    { value: 'Enterprise', label: 'Enterprise' },
                  ]}
                />
                <FormSelect
                  label="Status"
                  required
                  value={formData.partnerStatus ? 'true' : 'false'}
                  onChange={(e) => updateForm('partnerStatus', e.target.value === 'true')}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                  ]}
                />
              </div>
            </FormBlock>

            <FormBlock title="Legal Profile" bgColor="orange">
              <FormInput
                label="Designation / Trade Name"
                required
                value={formData.name || ''}
                onChange={(e) => updateForm('name', e.target.value)}
                error={formErrors.name || undefined}
                placeholder="Full legal entity name"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Headquarter Country"
                  required
                  value={formData.headquarterCountry || 'MA'}
                  onChange={(e) => updateForm('headquarterCountry', e.target.value)}
                  error={formErrors.headquarterCountry || undefined}
                  options={[
                    { value: 'MA', label: 'Morocco' },
                    { value: 'FR', label: 'France' },
                    { value: 'US', label: 'United States' },
                    { value: 'TN', label: 'Tunisia' },
                    { value: 'DZ', label: 'Algeria' },
                    { value: 'SN', label: 'Senegal' },
                    { value: 'CI', label: "Côte d'Ivoire" },
                    { value: 'GB', label: 'United Kingdom' },
                    { value: 'DE', label: 'Germany' },
                  ]}
                />
                <FormSelect
                  label="Parent Company Country"
                  value={formData.parentCompanyCountry || ''}
                  onChange={(e) => updateForm('parentCompanyCountry', e.target.value)}
                  options={[
                    { value: '', label: 'None' },
                    { value: 'MA', label: 'Morocco' },
                    { value: 'FR', label: 'France' },
                    { value: 'US', label: 'United States' },
                    { value: 'TN', label: 'Tunisia' },
                    { value: 'GB', label: 'United Kingdom' },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Classification"
                  required
                  value={formData.classification || ''}
                  onChange={(e) => updateForm('classification', e.target.value)}
                  error={formErrors.classification || undefined}
                  options={[
                    { value: 'Internationnal', label: 'International' },
                    { value: 'Local', label: 'Local' },
                    { value: 'Large', label: 'Large' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Small', label: 'Small' },
                  ]}
                />
                <FormInput
                  label="Canal"
                  value={formData.canal || ''}
                  onChange={(e) => updateForm('canal', e.target.value)}
                  placeholder="e.g. WESTERN_UNION"
                />
              </div>
            </FormBlock>
          </FormSection>

          {/* ── SECTION 2: FINANCIAL SETTINGS ── */}
          <FormSection title="Financial Settings" subtitle="Payment and currency configuration">
            <FormBlock title="Banking & Currency" bgColor="gray">
              <FormInput
                label="Account Number (RIB)"
                required
                placeholder="16-digit account number"
                value={formData.accountNumber || ''}
                onChange={(e) => updateForm('accountNumber', e.target.value)}
                error={formErrors.accountNumber || undefined}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormSelect
                  label="Main Currency"
                  required
                  value={formData.mainCurrency || 'MAD'}
                  onChange={(e) => updateForm('mainCurrency', e.target.value)}
                  options={[
                    { value: 'MAD', label: 'MAD' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'GBP', label: 'GBP' },
                    { value: 'XOF', label: 'XOF' },
                  ]}
                />
                <FormSelect
                  label="Commission Currency"
                  required
                  value={formData.commissionCurrency || 'MAD'}
                  onChange={(e) => updateForm('commissionCurrency', e.target.value)}
                  options={[
                    { value: 'MAD', label: 'MAD' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'GBP', label: 'GBP' },
                    { value: 'XOF', label: 'XOF' },
                  ]}
                />
                <FormSelect
                  label="Payment Nature"
                  required
                  value={formData.paymentNature || 'Post-paiement'}
                  onChange={(e) => updateForm('paymentNature', e.target.value)}
                  options={[
                    { value: 'Post-paiement', label: 'Post-paiement' },
                    { value: 'Prépaiement', label: 'Prépaiement' },
                  ]}
                />
              </div>
            </FormBlock>
          </FormSection>

          {/* ── SECTION 3: TRANSFER PERMISSIONS & LIMITS ── */}
          <FormSection title="Transfer Permissions & Limits" subtitle="Configure allowed transfer types and daily limits">
            <div className="col-span-full card-base overflow-hidden border border-gray-100 dark:border-dark-border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-dark-border">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-400">Transfer Type</th>
                    <th className="px-6 py-4 text-center font-bold text-xs uppercase tracking-widest text-gray-400">Enabled</th>
                    <th className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-gray-400">Daily Limit (MAD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                  {TRANSFER_TYPES.map((tt) => {
                    const enabled = !!(formData as any)[tt.allowedKey];
                    return (
                      <tr key={tt.allowedKey} className={`transition-colors ${!enabled ? 'bg-gray-50/50 opacity-50' : 'hover:bg-orange-50/20'}`}>
                        <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">{tt.label}</td>
                        <td className="px-6 py-4 text-center">
                          <Toggle
                            checked={enabled}
                            onChange={(checked: boolean) => updateForm(tt.allowedKey, checked)}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <input
                            type="number"
                            value={(formData as any)[tt.limitKey] || 0}
                            onChange={(e) => updateForm(tt.limitKey, parseFloat(e.target.value) || 0)}
                            disabled={!enabled}
                            className="w-36 text-right bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 font-bold focus:ring-bcp-orange/20 focus:border-bcp-orange transition-all disabled:opacity-40"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <FormBlock title="Mass Cash Pickup Details" bgColor="gray">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Nature"
                  value={formData.natureMassCashPickupTransfer || '0'}
                  onChange={(e) => updateForm('natureMassCashPickupTransfer', e.target.value)}
                  placeholder="0"
                />
                <FormInput
                  label="Valid Days"
                  type="number"
                  value={String(formData.validDaysMassCashPickupTransfer || 0)}
                  onChange={(e) => updateForm('validDaysMassCashPickupTransfer', parseInt(e.target.value) || 0)}
                />
              </div>
            </FormBlock>
          </FormSection>

          {/* ── SECTION 4: COMMISSION SETTINGS ── */}
          <FormSection title="Commission Settings" subtitle="Per-transfer-type commission configuration">
            <div className="col-span-full card-base overflow-hidden border border-gray-100 dark:border-dark-border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-dark-border">
                  <tr>
                    <th className="px-5 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-400">Transfer Type</th>
                    <th className="px-5 py-4 text-center font-bold text-xs uppercase tracking-widest text-gray-400">Commission Type</th>
                    <th className="px-5 py-4 text-right font-bold text-xs uppercase tracking-widest text-gray-400">Amount</th>
                    <th className="px-5 py-4 text-right font-bold text-xs uppercase tracking-widest text-gray-400">Rate (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                  {TRANSFER_TYPES.map((tt) => (
                    <tr key={tt.commTypeKey} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">{tt.label}</td>
                      <td className="px-5 py-4 text-center">
                        <select
                          value={(formData as any)[tt.commTypeKey] || 'Flat'}
                          onChange={(e) => updateForm(tt.commTypeKey, e.target.value)}
                          className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 text-sm font-bold focus:ring-bcp-orange/20 focus:border-bcp-orange"
                        >
                          <option value="Flat">Flat</option>
                          <option value="Percentage">Percentage</option>
                          <option value="Mixed">Mixed</option>
                          <option value="0">None (0)</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={(formData as any)[tt.commAmountKey] || 0}
                          onChange={(e) => updateForm(tt.commAmountKey, parseFloat(e.target.value) || 0)}
                          className="w-28 text-right bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 font-bold focus:ring-bcp-orange/20 focus:border-bcp-orange transition-all"
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={(formData as any)[tt.commRateKey] || 0}
                          onChange={(e) => updateForm(tt.commRateKey, parseFloat(e.target.value) || 0)}
                          className="w-28 text-right bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 font-bold focus:ring-bcp-orange/20 focus:border-bcp-orange transition-all"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormSection>

          {/* ── SECTION 5: EXCHANGE & TARIFF ── */}
          <FormSection title="Exchange & Tariff" subtitle="Exchange rates and fee conditions">
            <FormBlock title="Exchange Settings" bgColor="gray">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Exchange Rate Nature"
                  value={formData.exchangeRateNature || '0'}
                  onChange={(e) => updateForm('exchangeRateNature', e.target.value)}
                  placeholder="0"
                />
                <FormInput
                  label="Exchange Gain %"
                  type="number"
                  step="0.01"
                  value={String(formData.exchangeGainPercentage || 0)}
                  onChange={(e) => updateForm('exchangeGainPercentage', parseFloat(e.target.value) || 0)}
                />
              </div>
            </FormBlock>

            <FormBlock title="Tariff Conditions" bgColor="orange">
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Fee Mode"
                  value={formData.feeMode || ''}
                  onChange={(e) => updateForm('feeMode', e.target.value)}
                  options={[
                    { value: '', label: 'None' },
                    { value: 'OUR', label: 'OUR (Sender pays)' },
                    { value: 'BEN', label: 'BEN (Receiver pays)' },
                    { value: 'SHA', label: 'SHA (Shared)' },
                  ]}
                />
                <FormInput
                  label="Reimbursement"
                  value={formData.reimbursement || ''}
                  onChange={(e) => updateForm('reimbursement', e.target.value)}
                  placeholder="e.g. true / false"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-bg-soft/50 border border-gray-100 dark:border-dark-border">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Monthly Billing</span>
                  <Toggle
                    checked={formData.monthlyBilling || false}
                    onChange={(checked: boolean) => updateForm('monthlyBilling', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-bg-soft/50 border border-gray-100 dark:border-dark-border">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Immediate Debit</span>
                  <Toggle
                    checked={formData.immediateDebit || false}
                    onChange={(checked: boolean) => updateForm('immediateDebit', checked)}
                  />
                </div>
              </div>
            </FormBlock>
          </FormSection>

          {/* ── SECTION 6: SUBSCRIPTION ── */}
          <FormSection title="Subscription" subtitle="Subscription fee configuration">
            <FormBlock title="Subscription Details" bgColor="gray">
              <div className="grid grid-cols-3 gap-4">
                <FormInput
                  label="Subscription Fee"
                  type="number"
                  step="0.01"
                  value={String(formData.subscriptionFee || 0)}
                  onChange={(e) => updateForm('subscriptionFee', parseFloat(e.target.value) || 0)}
                />
                <FormInput
                  label="Periodicity"
                  value={formData.subscriptionPeriodicity || ''}
                  onChange={(e) => updateForm('subscriptionPeriodicity', e.target.value)}
                  placeholder="e.g. Monthly"
                />
                <FormInput
                  label="Billing Account"
                  value={formData.subscriptionBillingAccount || ''}
                  onChange={(e) => updateForm('subscriptionBillingAccount', e.target.value)}
                  placeholder="Account number"
                />
              </div>
            </FormBlock>
          </FormSection>

          {/* ACTIONS */}
          <div className="flex justify-between items-center pt-10 border-t border-gray-100 dark:border-dark-border">
            <button
              onClick={resetForm}
              className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg-soft transition-all"
            >
              Cancel
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

  // --- CONSULT VIEW ---
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
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  selectedPartner.partnerStatus
                    ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400'
                    : 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-500/10 dark:text-gray-400'
                }`}>
                  {selectedPartner.partnerStatus ? 'Active' : 'Inactive'}
                </span>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-4">{selectedPartner.name}</h2>
                <p className="text-gray-500 font-bold font-mono mt-1 tracking-tighter">REF: {selectedPartner.partnerReferenceNumber}</p>
              </div>
              <div className="w-20 h-20 bg-gray-50 dark:bg-dark-bg-soft rounded-3xl flex items-center justify-center border border-gray-100 dark:border-dark-border">
                <FileText size={32} className="text-bcp-orange" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Partner Type', value: selectedPartner.partnerType },
                { label: 'Country', value: selectedPartner.headquarterCountry },
                { label: 'Classification', value: selectedPartner.classification },
                { label: 'Main Currency', value: selectedPartner.mainCurrency },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-gray-50/50 dark:bg-dark-bg-soft/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{item.value}</p>
                </div>
              ))}
              <div className="md:col-span-2 p-6 bg-orange-50/30 dark:bg-bcp-orange/5 rounded-2xl border border-bcp-orange/10">
                <p className="text-[10px] font-black text-bcp-orange uppercase tracking-widest mb-1">Account Number</p>
                <p className="text-xl font-black text-bcp-brown dark:text-white font-mono">{selectedPartner.accountNumber}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-10 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => setViewMode('list')}
                className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                Exit View
              </button>
              {isVal ? (
                <>
                  <button className="btn-secondary space-x-2 bg-red-600 shadow-status-error/20">
                    <X size={20} /> <span>Reject</span>
                  </button>
                  <button className="btn-primary space-x-2 bg-green-600 shadow-status-success/20">
                    <Check size={20} /> <span>Approve</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setViewMode('edit')}
                  className="btn-primary space-x-2"
                >
                  <Edit2 size={18} /> <span>Edit</span>
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
