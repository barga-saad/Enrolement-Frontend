import { useState, useEffect } from 'react';
import { Plus, Eye, Check, X, Edit2, Search, Filter, Download, Shield, FileText, Save, Send, AlertTriangle } from 'lucide-react';
import { FormInput, FormSelect, FormSection, FormBlock } from '../common/FormComponents';
import { Table, TableColumn } from '../common/Table';
import { Toggle } from '../common/Toggle';
import { useToast } from '../../utils/toastStore';
import { useAuth } from '../../hooks';
import { apiService } from '../../services/api';
import { validators, validateForm, hasErrors } from '../../utils/validation';
import { useLangStore, t } from '../../utils/langStore';

// Partner as returned by the API (matches PartnerRequestDto field names)
interface Partner {
  id?: number;
  name: string;
  partnerReferenceNumber: string;
  partnerType: string;
  partnerStatus: string;
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
  natureMassCashPickupTransfer: number;
  validDaysMassCashPickupTransfer: number;
  mainCurrency: string;
  exchangeRateNature?: string;
  exchangeGainPercentage?: number;
  subscriptionFee?: number;
  subscriptionPeriodicity?: string;
  subscriptionBillingAccount?: number;
  paymentNature: string;
  feeMode?: string;
  monthlyBilling?: boolean;
  immediateDebit?: boolean;
  reimbursement?: boolean;
  commissionCurrency: string;
  commissionTypeInstantInternal: string;
  commissionAmountInstantInternal: number;
  commissionRateInstantInternal: number;
  commissionMinInstantInternal?: number;
  commissionMaxInstantInternal?: number;
  commissionTypeInstantExternal: string;
  commissionAmountInstantExternal: number;
  commissionRateInstantExternal: number;
  commissionMinInstantExternal?: number;
  commissionMaxInstantExternal?: number;
  commissionTypeStandardExternal: string;
  commissionAmountStandardExternal: number;
  commissionRateStandardExternal: number;
  commissionMinStandardExternal?: number;
  commissionMaxStandardExternal?: number;
  commissionTypeCashPickup: string;
  commissionAmountCashPickup: number;
  commissionRateCashPickup: number;
  commissionMinCashPickup?: number;
  commissionMaxCashPickup?: number;
  commissionTypeMassCashPickup: string;
  commissionAmountMassCashPickup: number;
  commissionRateMassCashPickup: number;
  commissionMinMassCashPickup?: number;
  commissionMaxMassCashPickup?: number;
  commissionTypeWallet: string;
  commissionAmountWallet: number;
  commissionRateWallet: number;
  commissionMinWallet?: number;
  commissionMaxWallet?: number;
}

interface ValidationRecord {
  id: number;
  partnerId: number;
  partnerName: string;
  partnerReferenceNumber: string;
  workflowStatus: string;
  actionType: string;
  createdBy: string;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

const TRANSFER_TYPES = [
  { label: 'Virement instantané intra BP', allowedKey: 'allowedInternalInstantTransfer', limitKey: 'limitInternalInstantTransfer', commTypeKey: 'commissionTypeInstantInternal', commAmountKey: 'commissionAmountInstantInternal', commRateKey: 'commissionRateInstantInternal', commMinKey: 'commissionMinInstantInternal', commMaxKey: 'commissionMaxInstantInternal' },
  { label: 'Virement instantané confrère', allowedKey: 'allowedExternalInstantTransfer', limitKey: 'limitExternalInstantTransfer', commTypeKey: 'commissionTypeInstantExternal', commAmountKey: 'commissionAmountInstantExternal', commRateKey: 'commissionRateInstantExternal', commMinKey: 'commissionMinInstantExternal', commMaxKey: 'commissionMaxInstantExternal' },
  { label: 'Virement standard confrère', allowedKey: 'allowedStandardTransfer', limitKey: 'limitStandardTransfer', commTypeKey: 'commissionTypeStandardExternal', commAmountKey: 'commissionAmountStandardExternal', commRateKey: 'commissionRateStandardExternal', commMinKey: 'commissionMinStandardExternal', commMaxKey: 'commissionMaxStandardExternal' },
  { label: 'Mise à disposition unitaire', allowedKey: 'allowedCashPickupTransfer', limitKey: 'limitCashPickupTransfer', commTypeKey: 'commissionTypeCashPickup', commAmountKey: 'commissionAmountCashPickup', commRateKey: 'commissionRateCashPickup', commMinKey: 'commissionMinCashPickup', commMaxKey: 'commissionMaxCashPickup' },
  { label: 'Mise à disposition de masse', allowedKey: 'allowedMassCashPickupTransfer', limitKey: 'limitMassCashPickupTransfer', commTypeKey: 'commissionTypeMassCashPickup', commAmountKey: 'commissionAmountMassCashPickup', commRateKey: 'commissionRateMassCashPickup', commMinKey: 'commissionMinMassCashPickup', commMaxKey: 'commissionMaxMassCashPickup' },
  { label: 'Transfert Wallet', allowedKey: 'allowedWalletTransfer', limitKey: 'limitWalletTransfer', commTypeKey: 'commissionTypeWallet', commAmountKey: 'commissionAmountWallet', commRateKey: 'commissionRateWallet', commMinKey: 'commissionMinWallet', commMaxKey: 'commissionMaxWallet' },
] as const;

const DEFAULT_FORM: Partial<Partner> = {
  name: '',
  partnerReferenceNumber: '',
  partnerType: 'Partenaire',
  partnerStatus: 'ACTIVE',
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
  natureMassCashPickupTransfer: 0,
  validDaysMassCashPickupTransfer: 0,
  mainCurrency: 'MAD',
  exchangeRateNature: '0',
  exchangeGainPercentage: 0,
  subscriptionFee: 0,
  subscriptionPeriodicity: '',
  subscriptionBillingAccount: 0,
  paymentNature: 'Post-paiement',
  feeMode: '',
  monthlyBilling: false,
  immediateDebit: false,
  reimbursement: false,
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

interface PartnersPageProps {
  initialMode?: 'create' | 'edit' | 'validate' | 'consult';
}

const WORKFLOW_BADGES: Record<string, { bg: string; text: string; labelFr: string; labelEn: string }> = {
  PENDING:   { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', labelFr: 'En attente', labelEn: 'Pending' },
  VALIDATED: { bg: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20', text: 'text-green-600 dark:text-green-400', labelFr: 'Validé', labelEn: 'Validated' },
  REJECTED:  { bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20', text: 'text-red-600 dark:text-red-400', labelFr: 'Rejeté', labelEn: 'Rejected' },
  DRAFT:     { bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', labelFr: 'Brouillon', labelEn: 'Draft' },
};

const PartnersPage = ({ initialMode }: PartnersPageProps) => {
  const toast = useToast();
  const { user } = useAuth();
  const { lang: _lang } = useLangStore();
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode === 'create' ? 'create' : 'list');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [pendingValidations, setPendingValidations] = useState<ValidationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedValidation, setSelectedValidation] = useState<ValidationRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Partner>>({ ...DEFAULT_FORM });
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const isAdmin = user?.roleNames?.some((role) => role === 'PROFIL_ADMIN_CENTRAL') || false;
  const isValidator = user?.roleNames?.some((role) => role === 'PROFIL_VALIDATEUR') || false;
  const isSaisie = user?.roleNames?.some((role) => role === 'PROFIL_SAISIE') || false;
  const canCreate = isAdmin || isSaisie;

  useEffect(() => {
    if (initialMode === 'validate') {
      fetchPendingValidations();
    } else if (initialMode !== 'create') {
      fetchPartners();
    } else {
      setLoading(false);
    }
  }, [initialMode]);

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

  const fetchPendingValidations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPendingValidations();
      const data = response.data.data || response.data;
      setPendingValidations(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading validations:', error);
      setPendingValidations([]);
    } finally {
      setLoading(false);
    }
  };

  const validationRules = {
    name: [validators.required(t('Nom du partenaire', 'Partner name')), validators.minLength(3)],
    accountNumber: [validators.required(t('Numéro de compte', 'Account number')), validators.bankAccount()],
    headquarterCountry: [validators.required(t('Pays', 'Country'))],
    classification: [validators.required(t('Classification', 'Classification'))],
    partnerReferenceNumber: [validators.required(t('Numéro de référence', 'Reference number'))],
  };

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      (p.partnerReferenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredValidations = pendingValidations.filter((v) => {
    const matchesSearch =
      (v.partnerReferenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.partnerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.createdBy || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const validateFormData = () => {
    const errors = validateForm(formData, validationRules as any);
    setFormErrors(errors);
    return !hasErrors(errors);
  };

  const handleSubmit = async () => {
    if (!validateFormData()) {
      toast.error(t('Veuillez corriger les erreurs de validation', 'Please fix validation errors'));
      return;
    }

    try {
      if (viewMode === 'create') {
        const response = await apiService.createPartner(formData);
        const created = response.data?.data || response.data;
        if (created?.id) {
          await apiService.submitForValidation(created.id);
          toast.success(t('Partenaire créé et soumis pour validation', 'Partner created and submitted for validation'));
        } else {
          toast.success(t('Partenaire créé avec succès', 'Partner created successfully'));
        }
        resetForm();
      } else if (viewMode === 'edit' && selectedPartner?.id) {
        await apiService.updatePartner(String(selectedPartner.id), formData);
        toast.success(t('Partenaire mis à jour et soumis pour validation', 'Partner updated and submitted for validation'));
        resetForm();
        await fetchPartners();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Échec de l\'opération', 'Operation failed'));
    }
  };

  const handleSaveDraft = async () => {
    if (!validateFormData()) {
      toast.error(t('Veuillez corriger les erreurs de validation', 'Please fix validation errors'));
      return;
    }

    try {
      if (viewMode === 'create') {
        const response = await apiService.createPartner(formData);
        const created = response.data?.data || response.data;
        if (created?.id) {
          await apiService.saveDraft(created.id);
        }
        toast.success(t('Brouillon sauvegardé', 'Draft saved'));
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Échec de la sauvegarde', 'Save failed'));
    }
  };

  const handleValidate = async (validationId: number) => {
    try {
      const response = await apiService.validatePartner(validationId);
      const result = response.data;
      if (result?.message?.includes('FOUR_EYES')) {
        toast.error(t('Vous ne pouvez pas valider votre propre saisie (principe des 4 yeux)', 'You cannot validate your own entry (4-eyes principle)'));
        return;
      }
      toast.success(t('Partenaire validé avec succès', 'Partner validated successfully'));
      setViewMode('list');
      setSelectedPartner(null);
      setSelectedValidation(null);
      await fetchPendingValidations();
    } catch (error: any) {
      const msg = error.response?.data?.message || '';
      if (msg.includes('FOUR_EYES')) {
        toast.error(t('Vous ne pouvez pas valider votre propre saisie (principe des 4 yeux)', 'You cannot validate your own entry (4-eyes principle)'));
      } else {
        toast.error(msg || t('Échec de la validation', 'Validation failed'));
      }
    }
  };

  const handleReject = async (validationId: number) => {
    if (!rejectReason.trim()) {
      toast.error(t('Veuillez saisir un motif de rejet', 'Please enter a rejection reason'));
      return;
    }
    try {
      await apiService.rejectPartner(validationId, rejectReason);
      toast.success(t('Partenaire rejeté', 'Partner rejected'));
      setShowRejectModal(false);
      setRejectReason('');
      setViewMode('list');
      setSelectedPartner(null);
      setSelectedValidation(null);
      await fetchPendingValidations();
    } catch (error: any) {
      const msg = error.response?.data?.message || '';
      if (msg.includes('FOUR_EYES')) {
        toast.error(t('Vous ne pouvez pas rejeter votre propre saisie (principe des 4 yeux)', 'You cannot reject your own entry (4-eyes principle)'));
      } else {
        toast.error(msg || t('Échec du rejet', 'Rejection failed'));
      }
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await apiService.exportPartnersCsv();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `partners_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t('Export CSV téléchargé', 'CSV export downloaded'));
    } catch (error: any) {
      toast.error(t('Échec de l\'export', 'Export failed'));
    }
  };

  const resetForm = () => {
    setFormData({ ...DEFAULT_FORM });
    setFormErrors({});
    setSelectedPartner(null);
    setSelectedValidation(null);
    setViewMode('list');
  };

  const updateForm = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const openEditPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData({ ...partner });
    setViewMode('edit');
  };

  const openConsultPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setViewMode('consult');
  };

  const openValidatePartner = async (validation: ValidationRecord) => {
    try {
      const response = await apiService.getPartner(String(validation.partnerId));
      const partner = response.data?.data || response.data;
      setSelectedPartner(partner);
      setSelectedValidation(validation);
      setViewMode('validate');
    } catch {
      toast.error(t('Impossible de charger le partenaire', 'Failed to load partner'));
    }
  };

  // ═══════════════════════════════════════════════════
  //  VALIDATION LIST VIEW (for /partners/validate)
  // ═══════════════════════════════════════════════════
  if (initialMode === 'validate' && viewMode === 'list') {
    const validationColumns: TableColumn<ValidationRecord>[] = [
      { key: 'partnerReferenceNumber' as any, header: t('Référence', 'Reference'), sortable: true },
      {
        key: 'partnerName' as any,
        header: t('Désignation', 'Designation'),
        sortable: true,
        render: (name: string) => <span className="font-bold text-gray-900 dark:text-white">{name}</span>,
      },
      { key: 'actionType' as any, header: t('Action', 'Action'), sortable: true,
        render: (action: string) => (
          <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
            action === 'CREATE' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400' :
            'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400'
          }`}>{action === 'CREATE' ? t('Création', 'Create') : t('Modification', 'Update')}</span>
        ),
      },
      { key: 'createdBy' as any, header: t('Saisi par', 'Created by'), sortable: true },
      { key: 'createdAt' as any, header: t('Date', 'Date'), sortable: true,
        render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
      },
      {
        key: 'workflowStatus' as any,
        header: t('Statut', 'Status'),
        render: (status: string) => {
          const badge = WORKFLOW_BADGES[status] || WORKFLOW_BADGES.PENDING;
          return (
            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${badge.bg} ${badge.text}`}>
              {t(badge.labelFr, badge.labelEn)}
            </span>
          );
        },
      },
    ];

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('Validation des demandes', 'Request Validation')}
            </h1>
            <p className="text-gray-500 dark:text-dark-text-dim text-sm font-medium mt-1">
              {t('Gouvernance et validation des demandes partenaires en attente', 'Governance and validation of pending partner requests')}
            </p>
          </div>
        </div>

        <div className="card-base p-2 bg-white/50 dark:bg-dark-bg-soft/50 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center gap-4 p-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors" size={18} />
              <input
                type="text"
                placeholder={t('Rechercher par référence, nom ou saisisseur...', 'Search by reference, name or creator...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-[1.25rem] focus:ring-4 focus:ring-bcp-orange/10 focus:border-bcp-orange outline-none transition-all text-sm"
              />
            </div>
          </div>

          <Table
            columns={validationColumns}
            data={filteredValidations}
            keyField="id"
            loading={loading}
            emptyMessage={loading ? t('Chargement...', 'Loading...') : t('Aucune demande en attente', 'No pending requests')}
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openValidatePartner(row)}
                  className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-500 hover:text-green-600 hover:bg-green-100 transition-all"
                  title={t('Examiner', 'Review')}
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

  // ═══════════════════════════════════════════════════
  //  PARTNER LIST VIEW (for consult, edit, or default)
  // ═══════════════════════════════════════════════════
  if (viewMode === 'list') {
    const columns: TableColumn<Partner>[] = [
      { key: 'partnerReferenceNumber' as any, header: t('Référence', 'Reference'), sortable: true },
      {
        key: 'name' as any,
        header: t('Désignation', 'Designation'),
        sortable: true,
        render: (name: string) => <span className="font-bold text-gray-900 dark:text-white">{name}</span>,
      },
      { key: 'partnerType' as any, header: t('Type', 'Type'), sortable: true },
      { key: 'headquarterCountry' as any, header: t('Pays', 'Country'), sortable: true },
      {
        key: 'partnerStatus' as any,
        header: t('Statut', 'Status'),
        render: (status: string) => (
          <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
            status === 'ACTIVE'
              ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
              : 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20'
          }`}>
            {status === 'ACTIVE' ? t('Actif', 'Active') : t('Inactif', 'Inactive')}
          </span>
        ),
      },
    ];

    const pageTitle = initialMode === 'consult'
      ? t('Consultation des partenaires', 'Partner Consultation')
      : initialMode === 'edit'
        ? t('Modification des partenaires', 'Partner Modification')
        : t('Registre des partenaires', 'Partner Registry');

    const pageSubtitle = initialMode === 'consult'
      ? t('Consultation sécurisée de la base partenaires', 'Secure consultation of the partner database')
      : initialMode === 'edit'
        ? t('Sélectionnez un partenaire à modifier', 'Select a partner to modify')
        : isSaisie
          ? t('Enrôlement et gestion des comptes partenaires', 'Enroll and manage partner accounts')
          : isValidator
            ? t('Gouvernance et validation des demandes partenaires', 'Governance and validation of partner requests')
            : t('Consultation sécurisée de la base partenaires', 'Secure consultation of the partner database');

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{pageTitle}</h1>
            <p className="text-gray-500 dark:text-dark-text-dim text-sm font-medium mt-1">{pageSubtitle}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCsv}
              className="p-2.5 bg-white dark:bg-dark-bg-soft border border-gray-100 dark:border-dark-border rounded-xl text-gray-500 hover:text-bcp-orange transition-colors"
              title={t('Exporter CSV', 'Export CSV')}
            >
              <Download size={20} />
            </button>
            {canCreate && !initialMode && (
              <button
                onClick={() => { setViewMode('create'); setSelectedPartner(null); }}
                className="btn-primary space-x-2"
              >
                <Plus size={20} />
                <span>{t('Nouveau Partenaire', 'New Partner')}</span>
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
                placeholder={t('Rechercher par référence ou désignation...', 'Search by reference or designation...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-[1.25rem] focus:ring-4 focus:ring-bcp-orange/10 focus:border-bcp-orange outline-none transition-all text-sm"
              />
            </div>
            <button className="flex items-center space-x-2 px-6 py-3 bg-white dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-[1.25rem] text-sm font-bold text-gray-600 dark:text-dark-text-dim hover:border-bcp-orange transition-all">
              <Filter size={16} />
              <span>{t('Filtre avancé', 'Advanced Filter')}</span>
            </button>
          </div>

          <Table
            columns={columns}
            data={filteredPartners}
            keyField="id"
            loading={loading}
            emptyMessage={loading ? t('Synchronisation du registre...', 'Synchronizing registry...') : t('Aucun partenaire trouvé', 'No partners found')}
            actions={(row) => (
              <div className="flex gap-2">
                {initialMode === 'edit' ? (
                  <button
                    onClick={() => openEditPartner(row)}
                    className="p-2 bg-orange-50 dark:bg-bcp-orange/10 rounded-xl text-bcp-orange hover:bg-orange-100 transition-all"
                    title={t('Modifier', 'Edit')}
                  >
                    <Edit2 size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => openConsultPartner(row)}
                    className="p-2 bg-gray-50 dark:bg-dark-bg dark:border-dark-border rounded-xl text-gray-400 hover:text-bcp-orange hover:bg-orange-50 transition-all"
                    title={t('Consulter', 'View')}
                  >
                    <Eye size={18} />
                  </button>
                )}
              </div>
            )}
          />
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  //  CREATE / EDIT FORM VIEW
  // ═══════════════════════════════════════════════════
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-8 max-w-6xl mx-auto animate-slideUp">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'create' ? t('Enrôlement Partenaire', 'Partner Enrollment') : t('Modification Partenaire', 'Update Partner')}
            </h1>
            <p className="text-gray-500 dark:text-dark-text-dim text-sm font-medium">
              {t('Paramétrage conforme du profil partenaire', 'Compliance-driven partner setup')}
            </p>
          </div>
          <button onClick={resetForm} className="p-3 text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="bg-white dark:bg-dark-bg-card rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-dark-border p-8 md:p-12 space-y-12">

          {/* ── SECTION 1: IDENTITÉ ── */}
          <FormSection title={t('Identité', 'Core Identity')} subtitle={t('Détails d\'enregistrement officiel et classification', 'Official registration details and classification')}>
            <FormBlock title={t('ID Système & Statut', 'System ID & Status')} bgColor="gray">
              <FormInput
                label={t('Numéro de Référence Partenaire', 'Partner Reference Number')}
                required
                value={formData.partnerReferenceNumber || ''}
                onChange={(e) => updateForm('partnerReferenceNumber', e.target.value)}
                error={formErrors.partnerReferenceNumber || undefined}
                placeholder="ex: 042999"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label={t('Type de Partenaire', 'Partner Type')}
                  required
                  value={formData.partnerType || 'Partenaire'}
                  onChange={(e) => updateForm('partnerType', e.target.value)}
                  options={[
                    { value: 'Partenaire', label: 'Partenaire' },
                    { value: 'Individual', label: t('Individuel', 'Individual') },
                    { value: 'Enterprise', label: t('Entreprise', 'Enterprise') },
                  ]}
                />
                <FormSelect
                  label={t('Statut', 'Status')}
                  required
                  value={formData.partnerStatus || 'ACTIVE'}
                  onChange={(e) => updateForm('partnerStatus', e.target.value)}
                  options={[
                    { value: 'ACTIVE', label: t('Actif', 'Active') },
                    { value: 'INACTIVE', label: t('Inactif', 'Inactive') },
                  ]}
                />
              </div>
            </FormBlock>

            <FormBlock title={t('Profil Juridique', 'Legal Profile')} bgColor="orange">
              <FormInput
                label={t('Désignation / Raison Sociale', 'Designation / Trade Name')}
                required
                value={formData.name || ''}
                onChange={(e) => updateForm('name', e.target.value)}
                error={formErrors.name || undefined}
                placeholder={t('Nom complet de l\'entité', 'Full legal entity name')}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label={t('Pays du Siège', 'Headquarter Country')}
                  required
                  value={formData.headquarterCountry || 'MA'}
                  onChange={(e) => updateForm('headquarterCountry', e.target.value)}
                  error={formErrors.headquarterCountry || undefined}
                  options={[
                    { value: 'MA', label: t('Maroc', 'Morocco') },
                    { value: 'FR', label: 'France' },
                    { value: 'US', label: t('États-Unis', 'United States') },
                    { value: 'TN', label: t('Tunisie', 'Tunisia') },
                    { value: 'DZ', label: t('Algérie', 'Algeria') },
                    { value: 'SN', label: t('Sénégal', 'Senegal') },
                    { value: 'CI', label: "Côte d'Ivoire" },
                    { value: 'GB', label: t('Royaume-Uni', 'United Kingdom') },
                    { value: 'DE', label: t('Allemagne', 'Germany') },
                  ]}
                />
                <FormSelect
                  label={t('Pays de la Société Mère', 'Parent Company Country')}
                  value={formData.parentCompanyCountry || ''}
                  onChange={(e) => updateForm('parentCompanyCountry', e.target.value)}
                  options={[
                    { value: '', label: t('Aucun', 'None') },
                    { value: 'MA', label: t('Maroc', 'Morocco') },
                    { value: 'FR', label: 'France' },
                    { value: 'US', label: t('États-Unis', 'United States') },
                    { value: 'TN', label: t('Tunisie', 'Tunisia') },
                    { value: 'GB', label: t('Royaume-Uni', 'United Kingdom') },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label={t('Classification', 'Classification')}
                  required
                  value={formData.classification || ''}
                  onChange={(e) => updateForm('classification', e.target.value)}
                  error={formErrors.classification || undefined}
                  options={[
                    { value: 'Internationnal', label: 'International' },
                    { value: 'Local', label: 'Local' },
                    { value: 'Large', label: t('Grand', 'Large') },
                    { value: 'Medium', label: t('Moyen', 'Medium') },
                    { value: 'Small', label: t('Petit', 'Small') },
                  ]}
                />
                <FormInput
                  label={t('Canal', 'Canal')}
                  value={formData.canal || ''}
                  onChange={(e) => updateForm('canal', e.target.value)}
                  placeholder="ex: WESTERN_UNION"
                />
              </div>
            </FormBlock>
          </FormSection>

          {/* ── SECTION 2: PARAMÈTRES FINANCIERS ── */}
          <FormSection title={t('Paramètres Financiers', 'Financial Settings')} subtitle={t('Configuration de paiement et devise', 'Payment and currency configuration')}>
            <FormBlock title={t('Banque & Devise', 'Banking & Currency')} bgColor="gray">
              <FormInput
                label={t('Numéro de Compte (RIB)', 'Account Number (RIB)')}
                required
                placeholder={t('Numéro de compte à 16 chiffres', '16-digit account number')}
                value={formData.accountNumber || ''}
                onChange={(e) => updateForm('accountNumber', e.target.value)}
                error={formErrors.accountNumber || undefined}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormSelect
                  label={t('Devise Principale', 'Main Currency')}
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
                  label={t('Devise de Commission', 'Commission Currency')}
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
                  label={t('Nature de Paiement', 'Payment Nature')}
                  required
                  value={formData.paymentNature || 'Post-paiement'}
                  onChange={(e) => updateForm('paymentNature', e.target.value)}
                  options={[
                    { value: 'Post-paiement', label: 'Post-paiement' },
                    { value: 'Prépaiement', label: t('Prépaiement', 'Prepayment') },
                  ]}
                />
              </div>
            </FormBlock>
          </FormSection>

          {/* ── SECTION 3: TRANSFERTS ── */}
          <FormSection title={t('Permissions & Limites de Transfert', 'Transfer Permissions & Limits')} subtitle={t('Types de transfert autorisés et limites journalières', 'Allowed transfer types and daily limits')}>
            <div className="col-span-full card-base overflow-hidden border border-gray-100 dark:border-dark-border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-dark-border">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-400">{t('Type de Transfert', 'Transfer Type')}</th>
                    <th className="px-6 py-4 text-center font-bold text-xs uppercase tracking-widest text-gray-400">{t('Activé', 'Enabled')}</th>
                    <th className="px-6 py-4 text-right font-bold text-xs uppercase tracking-widest text-gray-400">{t('Limite Journalière (MAD)', 'Daily Limit (MAD)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                  {TRANSFER_TYPES.map((tt) => {
                    const enabled = !!(formData as any)[tt.allowedKey];
                    return (
                      <tr key={tt.allowedKey} className={`transition-colors ${!enabled ? 'bg-gray-50/50 opacity-50' : 'hover:bg-orange-50/20'}`}>
                        <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">{tt.label}</td>
                        <td className="px-6 py-4 text-center">
                          <Toggle checked={enabled} onChange={(checked: boolean) => updateForm(tt.allowedKey, checked)} />
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

            <FormBlock title={t('Détails Mise à Disposition de Masse', 'Mass Cash Pickup Details')} bgColor="gray">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label={t('Nature', 'Nature')}
                  type="number"
                  value={String(formData.natureMassCashPickupTransfer || 0)}
                  onChange={(e) => updateForm('natureMassCashPickupTransfer', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
                <FormInput
                  label={t('Jours de Validité', 'Valid Days')}
                  type="number"
                  value={String(formData.validDaysMassCashPickupTransfer || 0)}
                  onChange={(e) => updateForm('validDaysMassCashPickupTransfer', parseInt(e.target.value) || 0)}
                />
              </div>
            </FormBlock>
          </FormSection>

          {/* ── SECTION 4: COMMISSIONS ── */}
          <FormSection title={t('Paramètres de Commission', 'Commission Settings')} subtitle={t('Configuration des commissions par type de transfert', 'Per-transfer-type commission configuration')}>
            <div className="col-span-full card-base overflow-hidden border border-gray-100 dark:border-dark-border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-dark-border">
                  <tr>
                    <th className="px-5 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-400">{t('Type', 'Type')}</th>
                    <th className="px-5 py-4 text-center font-bold text-xs uppercase tracking-widest text-gray-400">{t('Type Commission', 'Commission Type')}</th>
                    <th className="px-5 py-4 text-right font-bold text-xs uppercase tracking-widest text-gray-400">{t('Montant', 'Amount')}</th>
                    <th className="px-5 py-4 text-right font-bold text-xs uppercase tracking-widest text-gray-400">{t('Taux (%)', 'Rate (%)')}</th>
                    <th className="px-5 py-4 text-right font-bold text-xs uppercase tracking-widest text-gray-400">Min</th>
                    <th className="px-5 py-4 text-right font-bold text-xs uppercase tracking-widest text-gray-400">Max</th>
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
                          <option value="Flat">{t('Forfaitaire', 'Flat')}</option>
                          <option value="Percentage">{t('Pourcentage', 'Percentage')}</option>
                          <option value="Mixed">{t('Mixte', 'Mixed')}</option>
                          <option value="0">{t('Aucune (0)', 'None (0)')}</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <input type="number" step="0.01" value={(formData as any)[tt.commAmountKey] || 0}
                          onChange={(e) => updateForm(tt.commAmountKey, parseFloat(e.target.value) || 0)}
                          className="w-28 text-right bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 font-bold focus:ring-bcp-orange/20 focus:border-bcp-orange transition-all" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <input type="number" step="0.01" value={(formData as any)[tt.commRateKey] || 0}
                          onChange={(e) => updateForm(tt.commRateKey, parseFloat(e.target.value) || 0)}
                          className="w-28 text-right bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 font-bold focus:ring-bcp-orange/20 focus:border-bcp-orange transition-all" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <input type="number" step="0.01" value={(formData as any)[tt.commMinKey] || ''}
                          onChange={(e) => updateForm(tt.commMinKey, e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="—"
                          className="w-24 text-right bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 font-bold focus:ring-bcp-orange/20 focus:border-bcp-orange transition-all" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <input type="number" step="0.01" value={(formData as any)[tt.commMaxKey] || ''}
                          onChange={(e) => updateForm(tt.commMaxKey, e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="—"
                          className="w-24 text-right bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 font-bold focus:ring-bcp-orange/20 focus:border-bcp-orange transition-all" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormSection>

          {/* ── SECTION 5: CHANGE & TARIFS ── */}
          <FormSection title={t('Change & Tarification', 'Exchange & Tariff')} subtitle={t('Taux de change et conditions tarifaires', 'Exchange rates and fee conditions')}>
            <FormBlock title={t('Paramètres de Change', 'Exchange Settings')} bgColor="gray">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label={t('Nature Taux de Change', 'Exchange Rate Nature')}
                  value={formData.exchangeRateNature || '0'}
                  onChange={(e) => updateForm('exchangeRateNature', e.target.value)}
                  placeholder="0"
                />
                <FormInput
                  label={t('Gain de Change %', 'Exchange Gain %')}
                  type="number"
                  step="0.01"
                  value={String(formData.exchangeGainPercentage || 0)}
                  onChange={(e) => updateForm('exchangeGainPercentage', parseFloat(e.target.value) || 0)}
                />
              </div>
            </FormBlock>

            <FormBlock title={t('Conditions Tarifaires', 'Tariff Conditions')} bgColor="orange">
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label={t('Mode de Frais', 'Fee Mode')}
                  value={formData.feeMode || ''}
                  onChange={(e) => updateForm('feeMode', e.target.value)}
                  options={[
                    { value: '', label: t('Aucun', 'None') },
                    { value: 'OUR', label: t('OUR (Émetteur paie)', 'OUR (Sender pays)') },
                    { value: 'BEN', label: t('BEN (Bénéficiaire paie)', 'BEN (Receiver pays)') },
                    { value: 'SHA', label: t('SHA (Partagé)', 'SHA (Shared)') },
                  ]}
                />
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-bg-soft/50 border border-gray-100 dark:border-dark-border">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('Remboursement', 'Reimbursement')}</span>
                  <Toggle checked={formData.reimbursement || false} onChange={(checked: boolean) => updateForm('reimbursement', checked)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-bg-soft/50 border border-gray-100 dark:border-dark-border">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('Facturation Mensuelle', 'Monthly Billing')}</span>
                  <Toggle checked={formData.monthlyBilling || false} onChange={(checked: boolean) => updateForm('monthlyBilling', checked)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-bg-soft/50 border border-gray-100 dark:border-dark-border">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('Débit Immédiat', 'Immediate Debit')}</span>
                  <Toggle checked={formData.immediateDebit || false} onChange={(checked: boolean) => updateForm('immediateDebit', checked)} />
                </div>
              </div>
            </FormBlock>
          </FormSection>

          {/* ── SECTION 6: ABONNEMENT ── */}
          <FormSection title={t('Abonnement', 'Subscription')} subtitle={t('Configuration des frais d\'abonnement', 'Subscription fee configuration')}>
            <FormBlock title={t('Détails d\'Abonnement', 'Subscription Details')} bgColor="gray">
              <div className="grid grid-cols-3 gap-4">
                <FormInput
                  label={t('Frais d\'Abonnement', 'Subscription Fee')}
                  type="number"
                  step="0.01"
                  value={String(formData.subscriptionFee || 0)}
                  onChange={(e) => updateForm('subscriptionFee', parseFloat(e.target.value) || 0)}
                />
                <FormInput
                  label={t('Périodicité', 'Periodicity')}
                  value={formData.subscriptionPeriodicity || ''}
                  onChange={(e) => updateForm('subscriptionPeriodicity', e.target.value)}
                  placeholder={t('ex: Mensuel', 'e.g. Monthly')}
                />
                <FormInput
                  label={t('Compte de Facturation', 'Billing Account')}
                  type="number"
                  value={String(formData.subscriptionBillingAccount || 0)}
                  onChange={(e) => updateForm('subscriptionBillingAccount', parseFloat(e.target.value) || 0)}
                  placeholder={t('Numéro de compte', 'Billing account number')}
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
              {t('Annuler', 'Cancel')}
            </button>
            <div className="flex items-center space-x-4">
              {viewMode === 'create' && (
                <button
                  onClick={handleSaveDraft}
                  className="px-8 py-4 bg-white border-2 border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-bcp-orange hover:text-bcp-orange transition-all flex items-center space-x-3"
                >
                  <Save className="w-5 h-5" />
                  <span>{t('Brouillon', 'Draft')}</span>
                </button>
              )}
              <button
                onClick={handleSubmit}
                className="px-12 py-4 bg-gradient-to-r from-bcp-orange to-bcp-orange-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] hover:shadow-orange-500/30 transition-all flex items-center space-x-3"
              >
                <Send className="w-5 h-5" />
                <span>{viewMode === 'create' ? t('Soumettre pour Validation', 'Submit for Validation') : t('Soumettre la Modification', 'Submit Modification')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  //  VALIDATE VIEW (read-only + approve/reject)
  // ═══════════════════════════════════════════════════
  if (viewMode === 'validate' && selectedPartner && selectedValidation) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto animate-slideUp">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {t('Certification de la Demande', 'Request Certification')}
          </h1>
          <button onClick={() => { setViewMode('list'); setSelectedPartner(null); setSelectedValidation(null); }} className="p-3 text-gray-400 hover:text-bcp-orange transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Validation info banner */}
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-center space-x-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-amber-700 dark:text-amber-400">{t('Demande en attente de validation', 'Request pending validation')}</p>
            <p className="text-sm text-amber-600 dark:text-amber-300">
              {t('Soumise par', 'Submitted by')} <span className="font-bold">{selectedValidation.createdBy}</span> {t('le', 'on')} {new Date(selectedValidation.createdAt).toLocaleDateString('fr-FR')}
              {' — '}{selectedValidation.actionType === 'CREATE' ? t('Création', 'Creation') : t('Modification', 'Modification')}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-bg-card rounded-[2.5rem] border border-gray-100 dark:border-dark-border p-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Shield size={200} className="text-bcp-orange" />
          </div>

          <div className="relative z-10 space-y-10">
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  selectedPartner.partnerStatus === 'ACTIVE'
                    ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400'
                    : 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-500/10 dark:text-gray-400'
                }`}>
                  {selectedPartner.partnerStatus === 'ACTIVE' ? t('Actif', 'Active') : t('Inactif', 'Inactive')}
                </span>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-4">{selectedPartner.name}</h2>
                <p className="text-gray-500 font-bold font-mono mt-1 tracking-tighter">REF: {selectedPartner.partnerReferenceNumber}</p>
              </div>
              <div className="w-20 h-20 bg-gray-50 dark:bg-dark-bg-soft rounded-3xl flex items-center justify-center border border-gray-100 dark:border-dark-border">
                <FileText size={32} className="text-bcp-orange" />
              </div>
            </div>

            {/* Partner details grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: t('Type', 'Type'), value: selectedPartner.partnerType },
                { label: t('Pays du Siège', 'Country'), value: selectedPartner.headquarterCountry },
                { label: t('Classification', 'Classification'), value: selectedPartner.classification },
                { label: t('Devise Principale', 'Main Currency'), value: selectedPartner.mainCurrency },
                { label: t('Devise Commission', 'Commission Currency'), value: selectedPartner.commissionCurrency },
                { label: t('Nature de Paiement', 'Payment Nature'), value: selectedPartner.paymentNature },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-gray-50/50 dark:bg-dark-bg-soft/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{item.value || '—'}</p>
                </div>
              ))}
              <div className="md:col-span-3 p-5 bg-orange-50/30 dark:bg-bcp-orange/5 rounded-2xl border border-bcp-orange/10">
                <p className="text-[10px] font-black text-bcp-orange uppercase tracking-widest mb-1">{t('Numéro de Compte', 'Account Number')}</p>
                <p className="text-xl font-black text-bcp-brown dark:text-white font-mono">{selectedPartner.accountNumber}</p>
              </div>
            </div>

            {/* Transfer permissions summary */}
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">{t('Transferts Autorisés', 'Allowed Transfers')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TRANSFER_TYPES.map((tt) => {
                  const enabled = !!(selectedPartner as any)[tt.allowedKey];
                  const limit = (selectedPartner as any)[tt.limitKey] || 0;
                  return (
                    <div key={tt.allowedKey} className={`p-4 rounded-xl border ${enabled ? 'bg-green-50/50 border-green-200 dark:bg-green-500/5 dark:border-green-500/20' : 'bg-gray-50/50 border-gray-100 dark:bg-dark-bg-soft/30 dark:border-dark-border opacity-50'}`}>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{tt.label}</p>
                      <p className={`text-sm font-black mt-1 ${enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        {enabled ? `${t('Activé', 'Enabled')} — ${limit.toLocaleString()} MAD` : t('Désactivé', 'Disabled')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 justify-end pt-10 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => { setViewMode('list'); setSelectedPartner(null); setSelectedValidation(null); }}
                className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                {t('Retour', 'Back')}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-8 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center space-x-2"
              >
                <X size={20} /> <span>{t('Rejeter', 'Reject')}</span>
              </button>
              <button
                onClick={() => handleValidate(selectedValidation.id)}
                className="px-8 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all flex items-center space-x-2"
              >
                <Check size={20} /> <span>{t('Valider', 'Validate')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowRejectModal(false)}>
            <div className="bg-white dark:bg-dark-bg-card rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-dark-border" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">{t('Motif de Rejet', 'Rejection Reason')}</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('Veuillez indiquer le motif du rejet...', 'Please provide the rejection reason...')}
                className="w-full h-32 p-4 border border-gray-200 dark:border-dark-border rounded-2xl bg-gray-50 dark:bg-dark-bg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                  {t('Annuler', 'Cancel')}
                </button>
                <button
                  onClick={() => handleReject(selectedValidation.id)}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all"
                >
                  {t('Confirmer le Rejet', 'Confirm Rejection')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  //  CONSULT VIEW (read-only)
  // ═══════════════════════════════════════════════════
  if (viewMode === 'consult' && selectedPartner) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto animate-slideUp">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {t('Fiche Partenaire', 'Partner Intelligence')}
          </h1>
          <button onClick={() => { setViewMode('list'); setSelectedPartner(null); }} className="p-3 text-gray-400 hover:text-bcp-orange transition-colors">
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
                  selectedPartner.partnerStatus === 'ACTIVE'
                    ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400'
                    : 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-500/10 dark:text-gray-400'
                }`}>
                  {selectedPartner.partnerStatus === 'ACTIVE' ? t('Actif', 'Active') : t('Inactif', 'Inactive')}
                </span>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-4">{selectedPartner.name}</h2>
                <p className="text-gray-500 font-bold font-mono mt-1 tracking-tighter">REF: {selectedPartner.partnerReferenceNumber}</p>
              </div>
              <div className="w-20 h-20 bg-gray-50 dark:bg-dark-bg-soft rounded-3xl flex items-center justify-center border border-gray-100 dark:border-dark-border">
                <FileText size={32} className="text-bcp-orange" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: t('Type de Partenaire', 'Partner Type'), value: selectedPartner.partnerType },
                { label: t('Pays du Siège', 'Country'), value: selectedPartner.headquarterCountry },
                { label: t('Classification', 'Classification'), value: selectedPartner.classification },
                { label: t('Devise Principale', 'Main Currency'), value: selectedPartner.mainCurrency },
                { label: t('Devise de Commission', 'Commission Currency'), value: selectedPartner.commissionCurrency },
                { label: t('Nature de Paiement', 'Payment Nature'), value: selectedPartner.paymentNature },
                { label: t('Canal', 'Canal'), value: selectedPartner.canal },
                { label: t('Mode de Frais', 'Fee Mode'), value: selectedPartner.feeMode },
                { label: t('Facturation Mensuelle', 'Monthly Billing'), value: selectedPartner.monthlyBilling ? t('Oui', 'Yes') : t('Non', 'No') },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-gray-50/50 dark:bg-dark-bg-soft/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{item.value || '—'}</p>
                </div>
              ))}
              <div className="md:col-span-3 p-5 bg-orange-50/30 dark:bg-bcp-orange/5 rounded-2xl border border-bcp-orange/10">
                <p className="text-[10px] font-black text-bcp-orange uppercase tracking-widest mb-1">{t('Numéro de Compte', 'Account Number')}</p>
                <p className="text-xl font-black text-bcp-brown dark:text-white font-mono">{selectedPartner.accountNumber}</p>
              </div>
            </div>

            {/* Transfer permissions summary */}
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">{t('Transferts Autorisés', 'Allowed Transfers')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TRANSFER_TYPES.map((tt) => {
                  const enabled = !!(selectedPartner as any)[tt.allowedKey];
                  const limit = (selectedPartner as any)[tt.limitKey] || 0;
                  return (
                    <div key={tt.allowedKey} className={`p-4 rounded-xl border ${enabled ? 'bg-green-50/50 border-green-200 dark:bg-green-500/5 dark:border-green-500/20' : 'bg-gray-50/50 border-gray-100 dark:bg-dark-bg-soft/30 dark:border-dark-border opacity-50'}`}>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{tt.label}</p>
                      <p className={`text-sm font-black mt-1 ${enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        {enabled ? `${t('Activé', 'Enabled')} — ${limit.toLocaleString()} MAD` : t('Désactivé', 'Disabled')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-10 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => { setViewMode('list'); setSelectedPartner(null); }}
                className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                {t('Retour', 'Back')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PartnersPage;
