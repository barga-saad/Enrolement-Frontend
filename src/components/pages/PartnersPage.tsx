import { useState, useEffect } from 'react';
import { Plus, Eye, Check, X, Edit2, Search, Filter, Download, Shield, FileText, Send, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormInput, FormSelect, SearchableSelect } from '../common/FormComponents';
import { COUNTRIES } from '../../utils/countries';
import { CURRENCIES } from '../../utils/currencies';
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
  workflowStatus?: string;       // DRAFT | PENDING | VALIDATED | REJECTED
  enrollmentType?: string;
  createdBy?: string;
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
  allowedSrbmRtgsTransfer?: boolean;
  limitInternalInstantTransfer: number;
  limitExternalInstantTransfer: number;
  limitStandardTransfer: number;
  limitCashPickupTransfer: number;
  limitMassCashPickupTransfer: number;
  limitWalletTransfer: number;
  limitSrbmRtgsTransfer?: number;
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
  // Forex - Réception
  autoriserReception?: boolean;
  devisesReception?: string;
  plafondReception?: number;
  // Forex - Émission
  autoriserEmission?: boolean;
  typeTransactionEmission?: string;
  autorisationOC?: boolean;
  refAutorisationOC?: string;
  devisesEmission?: string;
  natureCoursChangeEmission?: string;
  plafondMontantDevise?: number;
  // Conformité - Donneur d'ordre
  conformiteDOTypePiece?: boolean;
  conformiteDONumPiece?: boolean;
  conformiteDODateNaissance?: boolean;
  conformiteDOPaysNaissance?: boolean;
  conformiteDOAdresse?: boolean;
  conformiteDOVilleResidence?: boolean;
  // Conformité - Bénéficiaire
  conformiteBenefTypePiece?: boolean;
  conformiteBenefNumPiece?: boolean;
  conformiteBenefAdresse?: boolean;
  conformiteBenefVilleResidence?: boolean;
  conformiteBenefPaysResidence?: boolean;
  // Fichier synthèse
  fichierSynthese?: boolean;
  // Facturation
  setupFee?: number;
  setupFeeBilled?: boolean;
  billingMode?: string;
  derogation?: boolean;
  derogationDetails?: string;
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
  partnerType: '',
  partnerStatus: 'ACTIVE',
  headquarterCountry: '',
  parentCompanyCountry: '',
  classification: '',
  accountNumber: '',
  canal: '',
  allowedInternalInstantTransfer: false,
  allowedExternalInstantTransfer: false,
  allowedStandardTransfer: false,
  allowedCashPickupTransfer: false,
  allowedMassCashPickupTransfer: false,
  allowedWalletTransfer: false,
  allowedSrbmRtgsTransfer: false,
  limitInternalInstantTransfer: 0,
  limitExternalInstantTransfer: 0,
  limitStandardTransfer: 0,
  limitCashPickupTransfer: 0,
  limitMassCashPickupTransfer: 0,
  limitWalletTransfer: 0,
  limitSrbmRtgsTransfer: 0,
  natureMassCashPickupTransfer: 0,
  validDaysMassCashPickupTransfer: 0,
  mainCurrency: '',
  exchangeRateNature: '',
  exchangeGainPercentage: 0,
  subscriptionFee: undefined,
  subscriptionPeriodicity: '',
  subscriptionBillingAccount: undefined,
  paymentNature: '',
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
  fichierSynthese: true,
};

type ViewMode = 'list' | 'create' | 'edit' | 'validate' | 'consult' | 'drafts' | 'resume-draft';

interface PartnersPageProps {
  initialMode?: 'create' | 'edit' | 'validate' | 'consult' | 'drafts';
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
  const { lang } = useLangStore();
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialMode === 'create' ? 'create' :
    initialMode === 'drafts' ? 'drafts' :
    'list'
  );
  const [partners, setPartners] = useState<Partner[]>([]);
  const [pendingValidations, setPendingValidations] = useState<ValidationRecord[]>([]);
  const [draftValidations, setDraftValidations] = useState<ValidationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedValidation, setSelectedValidation] = useState<ValidationRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Partner>>({ ...DEFAULT_FORM });
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState(0);
  const [validationHistory, setValidationHistory] = useState<ValidationRecord[]>([]);

  const isAdmin = user?.roleNames?.some((role) => role === 'PROFIL_ADMIN_CENTRAL') || false;
  const isValidator = user?.roleNames?.some((role) => role === 'PROFIL_VALIDATEUR') || false;
  const isSaisie = user?.roleNames?.some((role) => role === 'PROFIL_SAISIE') || false;
  const canCreate = isAdmin || isSaisie;

  useEffect(() => {
    if (initialMode === 'validate') {
      fetchPendingValidations();
    } else if (initialMode === 'drafts') {
      fetchDraftValidations();
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

  const fetchDraftValidations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDraftValidations();
      const data = response.data.data || response.data;
      setDraftValidations(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading draft validations:', error);
      setDraftValidations([]);
    } finally {
      setLoading(false);
    }
  };

  const validationRules = {
    name: [validators.required(t('Nom du partenaire', 'Partner name')), validators.minLength(3)],
    accountNumber: [validators.required(t('Numéro de compte', 'Account number')), validators.bankAccount()],
    headquarterCountry: [validators.required(t('Pays', 'Country'))],
    classification: [validators.required(t('Classification', 'Classification'))],
    partnerType: [validators.required(t('Type de partenaire', 'Partner type'))],
    mainCurrency: [validators.required(t('Devise principale', 'Main currency'))],
    paymentNature: [validators.required(t('Contrôle provision', 'Provision control'))],
  };

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      (p.partnerReferenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    // Modification page: only show VALIDATED partners (drafts have their own page)
    const matchesWorkflow = initialMode === 'edit'
      ? (p.workflowStatus === 'VALIDATED' || !p.workflowStatus)
      : true;
    return matchesSearch && matchesWorkflow;
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
      } else if (viewMode === 'resume-draft' && selectedPartner?.id) {
        await apiService.submitForValidation(selectedPartner.id);
        toast.success(t('Brouillon soumis pour validation', 'Draft submitted for validation'));
        setViewMode('drafts');
        setSelectedPartner(null);
        setFormData({ ...DEFAULT_FORM });
        setFormErrors({});
        await fetchDraftValidations();
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
    if (!formData.name || String(formData.name).trim().length < 3) {
      toast.error(t('Le nom du partenaire est requis (min. 3 caractères)', 'Partner name is required (min. 3 chars)'));
      return;
    }
    try {
      if (viewMode === 'create') {
        await apiService.createPartner(formData);
        // Backend auto-creates a DRAFT validation record â€” no separate call needed
        toast.success(t('Brouillon sauvegardé avec succès', 'Draft saved successfully'));
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Échec de la sauvegarde', 'Save failed'));
    }
  };

  const handleValidate = async (validationId: number) => {
    try {
      await apiService.validatePartner(validationId);
      toast.success(t('Partenaire validé avec succès', 'Partner validated successfully'));
      setViewMode('list');
      setSelectedPartner(null);
      setSelectedValidation(null);
      await fetchPendingValidations();
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorCode = apiError?.error?.errorCode || '';
      const msg = apiError?.error?.errorMessage || apiError?.message || '';
      if (errorCode === 'FOUR_EYES_VIOLATION' || msg.includes('FOUR_EYES')) {
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
      const apiError = error.response?.data;
      const errorCode = apiError?.error?.errorCode || '';
      const msg = apiError?.error?.errorMessage || apiError?.message || '';
      if (errorCode === 'FOUR_EYES_VIOLATION' || msg.includes('FOUR_EYES')) {
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
    setActiveFormTab(0);
    setViewMode('list');
  };

  const updateForm = (key: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'partnerType') {
        updated.enrollmentType = value === 'Client' ? 'CLIENT' : 'PARTNER';
      }
      return updated;
    });
    if (key === 'partnerType' && value !== 'Partenaire') {
      setActiveFormTab((prev) => (prev === 3 ? 0 : prev));
    }
  };

  const openEditPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData({ ...partner });
    setViewMode('edit');
  };

  const openConsultPartner = async (partner: Partner) => {
    setSelectedPartner(partner);
    setViewMode('consult');
    setValidationHistory([]);
    if (partner.id) {
      try {
        const res = await apiService.getValidationHistory(partner.id);
        setValidationHistory(Array.isArray(res.data) ? res.data : []);
      } catch { /* ignore */ }
    }
  };

  const openValidatePartner = async (validation: ValidationRecord) => {
    try {
      const response = await apiService.getPartner(validation.partnerReferenceNumber);
      const partner = response.data?.data || response.data;
      setSelectedPartner(partner);
      setSelectedValidation(validation);
      setViewMode('validate');
    } catch {
      toast.error(t('Impossible de charger le partenaire', 'Failed to load partner'));
    }
  };

  const openDraftPartner = async (draft: ValidationRecord) => {
    try {
      const response = await apiService.getPartner(draft.partnerReferenceNumber);
      const partner = response.data?.data || response.data;
      setSelectedPartner(partner);
      setFormData({ ...partner });
      setFormErrors({});
      setViewMode('resume-draft');
    } catch {
      toast.error(t('Impossible de charger le brouillon', 'Failed to load draft'));
    }
  };

  const submitDraftDirectly = async (draft: ValidationRecord) => {
    try {
      await apiService.submitForValidation(draft.partnerId);
      toast.success(t('Brouillon soumis pour validation', 'Draft submitted for validation'));
      await fetchDraftValidations();
    } catch (error: any) {
      const apiError = error.response?.data;
      const msg = apiError?.error?.errorMessage || apiError?.message || '';
      toast.error(msg || t('Échec de la soumission', 'Submission failed'));
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
  //  DRAFTS LIST VIEW
  // ═══════════════════════════════════════════════════
  if (initialMode === 'drafts' && viewMode === 'drafts') {
    const filteredDrafts = draftValidations.filter((d) =>
      (d.partnerReferenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.partnerName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const draftColumns: TableColumn<ValidationRecord>[] = [
      { key: 'partnerReferenceNumber' as any, header: t('Référence', 'Reference'), sortable: true },
      {
        key: 'partnerName' as any,
        header: t('Désignation', 'Designation'),
        sortable: true,
        render: (name: string) => <span className="font-bold text-gray-900 dark:text-white">{name}</span>,
      },
      { key: 'createdBy' as any, header: t('Saisi par', 'Created by'), sortable: true },
      {
        key: 'createdAt' as any,
        header: t('Date', 'Date'),
        sortable: true,
        render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
      },
      {
        key: 'workflowStatus' as any,
        header: t('Statut', 'Status'),
        render: (_: any, row: ValidationRecord) => (
          row.workflowStatus === 'REJECTED' ? (
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400">
                {t('Rejeté', 'Rejected')}
              </span>
              {row.rejectionReason && (
                <p className="text-xs text-red-500 dark:text-red-400 max-w-[180px] truncate" title={row.rejectionReason}>
                  {row.rejectionReason}
                </p>
              )}
            </div>
          ) : (
            <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400">
              {t('Brouillon', 'Draft')}
            </span>
          )
        ),
      },
    ];

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('Mes Brouillons', 'My Drafts')}
            </h1>
            <p className="text-gray-500 dark:text-dark-text-dim text-sm font-medium mt-1">
              {t('Demandes enregistrées en brouillon â€” à soumettre pour validation', 'Requests saved as draft â€” submit for validation when ready')}
            </p>
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
          </div>

          <Table
            columns={draftColumns}
            data={filteredDrafts}
            keyField="id"
            loading={loading}
            emptyMessage={loading ? t('Chargement...', 'Loading...') : t('Aucun brouillon trouvé', 'No drafts found')}
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openDraftPartner(row)}
                  className="p-2 bg-orange-50 dark:bg-bcp-orange/10 rounded-xl text-bcp-orange hover:bg-orange-100 transition-all"
                  title={t('Reprendre', 'Resume')}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => submitDraftDirectly(row)}
                  className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-500 hover:text-green-600 hover:bg-green-100 transition-all"
                  title={t('Soumettre pour validation', 'Submit for validation')}
                >
                  <Send size={18} />
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
  //  CREATE / EDIT FORM VIEW  (reference-style 4 tabs)
  // ═══════════════════════════════════════════════════
  if (viewMode === 'create' || viewMode === 'edit' || viewMode === 'resume-draft') {
    const isPartnerForm  = formData.partnerType === 'Partenaire';
    const isClientForm   = formData.partnerType === 'Client';
    const showConformite = isPartnerForm;
    const FORM_TRANSFER_TYPES = [
      { key: 'InstantInternal',  label: t('Virement instantané intra BP', 'Internal Instant Transfer'),   allowedKey: 'allowedInternalInstantTransfer',  limitKey: 'limitInternalInstantTransfer',  noLimit: false },
      { key: 'InstantExternal',  label: t('Virement instantané confrère', 'External Instant Transfer'),   allowedKey: 'allowedExternalInstantTransfer',  limitKey: null,                            noLimit: true  },
      { key: 'SrbmRtgs',         label: t('Virement SRBM confrère (RTGS)', 'SRBM Transfer (RTGS)'),       allowedKey: 'allowedSrbmRtgsTransfer',         limitKey: 'limitSrbmRtgsTransfer',         noLimit: false },
      { key: 'Standard',         label: t('Virement ordinaire confrère', 'Standard External Transfer'),   allowedKey: 'allowedStandardTransfer',         limitKey: 'limitStandardTransfer',         noLimit: false },
      { key: 'MassCashPickup',   label: t('Mise à disposition', 'Cash Pickup'),                           allowedKey: 'allowedMassCashPickupTransfer',   limitKey: 'limitMassCashPickupTransfer',   noLimit: false },
      { key: 'Wallet',           label: t('Transfert Wallet', 'Wallet Transfer'),                         allowedKey: 'allowedWalletTransfer',           limitKey: 'limitWalletTransfer',           noLimit: false },
    ];
    const FORM_TABS_LIST = showConformite
      ? [t('1. Informations générales', '1. General Info'), t('2. Transferts & Plafonds', '2. Transfers'), t('3. Abonnement & Contrôles', '3. Subscription'), t('4. Conformités', '4. Compliance')]
      : [t('1. Informations générales', '1. General Info'), t('2. Transferts & Plafonds', '2. Transfers'), t('3. Abonnement & Contrôles', '3. Subscription')];
    const lastTabIdx = FORM_TABS_LIST.length - 1;
    return (
      <div className="space-y-8 max-w-5xl mx-auto animate-slideUp">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'create'
                ? (isClientForm ? t('Enrôlement Client', 'Client Enrollment') : isPartnerForm ? t('Enrôlement Partenaire', 'Partner Enrollment') : t('Nouvel Enrôlement', 'New Enrollment'))
                : viewMode === 'resume-draft'
                  ? t('Reprendre le Brouillon', 'Resume Draft')
                  : t('Modification Partenaire', 'Update Partner')}
            </h1>
            <p className="text-gray-500 dark:text-dark-text-dim text-sm font-medium">
              {t('Remplissez le formulaire puis soumettez pour validation', 'Fill the form then submit for validation')}
            </p>
          </div>
          <button
            onClick={viewMode === 'resume-draft'
              ? () => { setViewMode('drafts'); setSelectedPartner(null); setFormData({...DEFAULT_FORM}); setFormErrors({}); }
              : viewMode === 'create'
              ? () => { setFormData({...DEFAULT_FORM}); setFormErrors({}); setSelectedPartner(null); setActiveFormTab(0); setViewMode('choose-type'); }
              : resetForm}
            className="p-3 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* ── FORM CONTAINER ── */}
        <div className="bg-white dark:bg-dark-bg-card rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-dark-border overflow-hidden">

          {/* TAB HEADERS */}
          <div className="flex border-b border-gray-100 dark:border-dark-border">
            {FORM_TABS_LIST.map((label, i) => (
              <button
                key={i}
                onClick={() => setActiveFormTab(i)}
                className={`flex-1 px-6 py-5 text-sm font-bold transition-all border-b-2 ${
                  activeFormTab === i
                    ? 'text-bcp-orange border-bcp-orange bg-orange-50/30 dark:bg-bcp-orange/5'
                    : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-200 dark:hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="p-8 space-y-8">

            {/* TAB 0 — INFORMATIONS GÉNÉRALES */}
            {activeFormTab === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label={t('Nom du partenaire', 'Partner name')}
                    required
                    value={formData.name || ''}
                    onChange={(e) => updateForm('name', e.target.value)}
                    error={formErrors.name || undefined}
                    placeholder={t('Nom du partenaire', 'Partner name')}
                  />
                  <FormInput
                    label={t('Code partenaire', 'Partner code')}
                    value={formData.partnerReferenceNumber || ''}
                    onChange={() => {}}
                    disabled
                    placeholder={t('Auto-généré', 'Auto-generated')}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    label={t('Type', 'Type')}
                    required
                    value={formData.partnerType || ''}
                    onChange={(e) => updateForm('partnerType', e.target.value)}
                    options={[
                      { value: '', label: '-- Choisir --' },
                      { value: 'Partenaire', label: 'Partenaire' },
                      { value: 'Client', label: 'Client' },
                    ]}
                  />
                  <FormSelect
                    label={t('Classification du partenaire', 'Partner classification')}
                    required
                    value={formData.classification || ''}
                    onChange={(e) => updateForm('classification', e.target.value)}
                    error={formErrors.classification || undefined}
                    options={[
                      { value: '', label: '-- Choisir --' },
                      { value: 'Local', label: 'Local' },
                      { value: 'Internationnal', label: 'International' },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SearchableSelect
                    label={t('Pays du siège social', 'Headquarters Country')}
                    required
                    value={formData.headquarterCountry || ''}
                    onChange={(v) => updateForm('headquarterCountry', v)}
                    options={COUNTRIES.map((c) => ({ value: c.code, label: `${c.nameFr} (${c.code})` }))}
                    placeholder="-- Rechercher un pays --"
                    error={formErrors.headquarterCountry || undefined}
                  />
                  <FormInput
                    label={t('Numéro de compte principal', 'Main account number')}
                    required
                    value={formData.accountNumber || ''}
                    onChange={(e) => updateForm('accountNumber', e.target.value)}
                    error={formErrors.accountNumber || undefined}
                    placeholder="000000000000000000000000"
                    maxLength={24}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SearchableSelect
                    label={t('Devise principale', 'Main currency')}
                    required
                    value={formData.mainCurrency || ''}
                    onChange={(v) => updateForm('mainCurrency', v)}
                    options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} - ${c.nameFr}` }))}
                    placeholder="-- Rechercher une devise --"
                    error={formErrors.mainCurrency || undefined}
                  />
                  <FormSelect
                    label={t('Nature taux de change', 'Exchange rate nature')}
                    value={formData.exchangeRateNature || ''}
                    onChange={(e) => updateForm('exchangeRateNature', e.target.value)}
                    options={[
                      { value: '', label: '-- Choisir --' },
                      { value: 'Fixing', label: 'Fixing' },
                      { value: 'Negocié', label: 'Négocié' },
                      { value: 'Spot', label: 'Spot' },
                    ]}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-bg-soft/50 border border-gray-100 dark:border-dark-border">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {formData.partnerStatus === 'ACTIVE' ? t('Statut : Actif', 'Status: Active') : t('Statut : Inactif', 'Status: Inactive')}
                  </span>
                  <Toggle
                    checked={formData.partnerStatus === 'ACTIVE'}
                    onChange={(v: boolean) => updateForm('partnerStatus', v ? 'ACTIVE' : 'INACTIVE')}
                  />
                </div>
              </div>
            )}

            {/* TAB 1 — TRANSFERTS & PLAFONDS */}
            {activeFormTab === 1 && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-1 h-6 bg-bcp-orange rounded-full" />
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t('Types de transaction & plafond autorisés', 'Authorized Transaction Types & Limits')}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FORM_TRANSFER_TYPES.map((tt) => {
                      const enabled = !!(formData as any)[tt.allowedKey];
                      return (
                        <div key={tt.key} className={`p-5 rounded-2xl border-2 transition-all ${enabled ? 'border-bcp-orange bg-orange-50/20 dark:bg-bcp-orange/5' : 'border-gray-100 dark:border-dark-border bg-gray-50/30 dark:bg-dark-bg-soft/30'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{tt.label}</span>
                            <Toggle checked={enabled} onChange={(v: boolean) => updateForm(tt.allowedKey, v)} />
                          </div>
                          {enabled && !tt.noLimit && tt.limitKey && (
                            <div className="mt-3">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Plafond', 'Limit')}</label>
                              <input
                                type="number"
                                min={0}
                                value={(formData as any)[tt.limitKey] || ''}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateForm(tt.limitKey!, isNaN(v) ? 0 : Math.max(0, v));
                                }}
                                className="w-full px-4 py-2.5 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm font-bold focus:ring-bcp-orange/20 focus:border-bcp-orange outline-none transition-all"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {formData.allowedMassCashPickupTransfer && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl border border-gray-100 dark:border-dark-border bg-orange-50/10 dark:bg-bcp-orange/5">
                    <FormInput
                      label={t("Nature d'opération", 'Operation Nature')}
                      type="number"
                      min={0}
                      value={formData.natureMassCashPickupTransfer || ''}
                      onChange={(e) => { const v = parseFloat(e.target.value); updateForm('natureMassCashPickupTransfer', isNaN(v) ? 0 : Math.max(0, v)); }}
                    />
                    <FormInput
                      label={t('Durée validité', 'Validity duration')}
                      type="number"
                      min={0}
                      value={formData.validDaysMassCashPickupTransfer || ''}
                      onChange={(e) => { const v = parseInt(e.target.value); updateForm('validDaysMassCashPickupTransfer', isNaN(v) ? 0 : Math.max(0, v)); }}
                    />
                  </div>
                )}

                <div className={`p-5 rounded-2xl border-2 transition-all ${formData.autoriserReception ? 'border-bcp-orange bg-orange-50/20 dark:bg-bcp-orange/5' : 'border-gray-100 dark:border-dark-border'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-1 h-6 bg-bcp-orange rounded-full" />
                      <span className="font-bold text-gray-900 dark:text-white">{t('Transfert en devise (Reception)', 'Currency Transfer (Incoming)')}</span>
                    </div>
                    <Toggle checked={formData.autoriserReception || false} onChange={(v: boolean) => updateForm('autoriserReception', v)} />
                  </div>
                  {formData.autoriserReception && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-orange-100 dark:border-bcp-orange/20">
                      <SearchableSelect
                        label={t('Devise', 'Currency')}
                        value={formData.devisesReception || ''}
                        onChange={(v) => updateForm('devisesReception', v)}
                        options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} - ${c.nameFr}` }))}
                        placeholder="-- Rechercher une devise --"
                      />
                      <FormInput
                        label={t('Plafond', 'Limit')}
                        type="number"
                        min={0}
                        value={formData.plafondReception || ''}
                        onChange={(e) => { const v = parseFloat(e.target.value); updateForm('plafondReception', isNaN(v) ? 0 : Math.max(0, v)); }}
                      />
                    </div>
                  )}
                </div>

                <div className={`p-5 rounded-2xl border-2 transition-all ${formData.autoriserEmission ? 'border-bcp-orange bg-orange-50/20 dark:bg-bcp-orange/5' : 'border-gray-100 dark:border-dark-border'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-1 h-6 bg-bcp-orange rounded-full" />
                      <span className="font-bold text-gray-900 dark:text-white">{t('Transfert en devise (Emission)', 'Currency Transfer (Outgoing)')}</span>
                    </div>
                    <Toggle checked={formData.autoriserEmission || false} onChange={(v: boolean) => updateForm('autoriserEmission', v)} />
                  </div>
                  {formData.autoriserEmission && (
                    <div className="space-y-4 pt-2 border-t border-orange-100 dark:border-bcp-orange/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                          label={t('Type de transfert', 'Transfer type')}
                          required
                          value={formData.typeTransactionEmission || ''}
                          onChange={(e) => updateForm('typeTransactionEmission', e.target.value)}
                          options={[
                            { value: '', label: '-- Choisir --' },
                            { value: 'SWIFT', label: 'SWIFT' },
                            { value: 'SEPA', label: 'SEPA' },
                            { value: 'Virement ordinaire', label: 'Virement ordinaire' },
                            { value: 'Autre', label: t('Autre', 'Other') },
                          ]}
                        />
                        <FormSelect
                          label={t('Autorisation OC', 'OC Authorization')}
                          required
                          value={formData.autorisationOC ? 'Exceptionnel' : 'Standard'}
                          onChange={(e) => updateForm('autorisationOC', e.target.value === 'Exceptionnel')}
                          options={[
                            { value: 'Standard', label: 'Standard' },
                            { value: 'Exceptionnel', label: 'Exceptionnel' },
                          ]}
                        />
                      </div>
                      {formData.autorisationOC && (
                        <FormInput
                          label={t('Ref Autorisation', 'Authorization ref.')}
                          value={formData.refAutorisationOC || ''}
                          onChange={(e) => updateForm('refAutorisationOC', e.target.value)}
                        />
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SearchableSelect
                          label={t('Devise', 'Currency')}
                          value={formData.devisesEmission || ''}
                          onChange={(v) => updateForm('devisesEmission', v)}
                          options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} - ${c.nameFr}` }))}
                          placeholder="-- Rechercher une devise --"
                        />
                        <FormSelect
                          label={t('Nature cours de change', 'Exchange rate nature')}
                          required
                          value={formData.natureCoursChangeEmission || ''}
                          onChange={(e) => updateForm('natureCoursChangeEmission', e.target.value)}
                          options={[
                            { value: '', label: '-- Choisir --' },
                            { value: 'Fixing', label: 'Fixing' },
                            { value: 'Negocié', label: 'Négocié' },
                            { value: 'Spot', label: 'Spot' },
                          ]}
                        />
                      </div>
                      <FormInput
                        label={t('Plafond', 'Limit')}
                        type="number"
                        min={0}
                        value={formData.plafondMontantDevise || ''}
                        onChange={(e) => { const v = parseFloat(e.target.value); updateForm('plafondMontantDevise', isNaN(v) ? 0 : Math.max(0, v)); }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2 — ABONNEMENT & CONTRÔLES */}
            {activeFormTab === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-1 h-6 bg-bcp-orange rounded-full" />
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t('Abonnement', 'Subscription')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label={t("Frais d'abonnement (défaut: 200)", 'Subscription Fee (default: 200)')}
                    type="number"
                    min={0}
                    value={formData.subscriptionFee ?? ''}
                    onChange={(e) => { const v = parseFloat(e.target.value); updateForm('subscriptionFee', isNaN(v) ? undefined : Math.max(0, v)); }}
                    placeholder="200"
                  />
                  <FormSelect
                    label={t('Périodicité', 'Periodicity')}
                    required
                    value={formData.subscriptionPeriodicity || ''}
                    onChange={(e) => updateForm('subscriptionPeriodicity', e.target.value)}
                    error={formErrors.subscriptionPeriodicity || undefined}
                    options={[
                      { value: '', label: '-- Choisir --' },
                      { value: 'Mensuel', label: 'Mensuel' },
                      { value: 'Trimestriel', label: 'Trimestriel' },
                      { value: 'Semestriel', label: 'Semestriel' },
                      { value: 'Annuel', label: 'Annuel' },
                    ]}
                  />
                </div>
                <FormInput
                  label={t('Compte de règlement des frais', 'Subscription Billing Account')}
                  type="number"
                  min={0}
                  value={formData.subscriptionBillingAccount ?? ''}
                  onChange={(e) => { const v = parseFloat(e.target.value); updateForm('subscriptionBillingAccount', isNaN(v) ? undefined : Math.max(0, v)); }}
                  placeholder={t('Numéro de compte', 'Account number')}
                />
                <div className="flex items-center space-x-3 mt-8 mb-2">
                  <div className="w-1 h-6 bg-bcp-orange rounded-full" />
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t('Contrôles opérationnels', 'Operational Controls')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    label={t('Contrôle provision', 'Provision Control')}
                    required
                    value={formData.paymentNature || ''}
                    onChange={(e) => updateForm('paymentNature', e.target.value)}
                    error={formErrors.paymentNature || undefined}
                    options={[
                      { value: '', label: '-- Choisir --' },
                      { value: 'Oui', label: 'Oui' },
                      { value: 'Non', label: 'Non' },
                    ]}
                  />
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-bg-soft/50 border border-gray-100 dark:border-dark-border">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('Reception du Fichier de synthèse (sort)', 'Receive synthesis file (sort)')}</span>
                    <Toggle checked={formData.fichierSynthese ?? true} onChange={(v: boolean) => updateForm('fichierSynthese', v)} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3 — CONFORMITÉS (Partenaire uniquement) */}
            {activeFormTab === 3 && showConformite && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-1 h-6 bg-bcp-orange rounded-full" />
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t("Donneur d'ordre — champs autorisés", 'Payer — allowed fields')}</h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-dim mb-4 ml-4">{t('Activez les champs facultatifs autorisés pour ce partenaire', 'Enable optional allowed fields for this partner')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: 'conformiteDOTypePiece', label: t("Type de pièce d'identité du donneur d'ordre", 'Payer ID type') },
                      { key: 'conformiteDONumPiece', label: t("N° de pièce d'identité du donneur d'ordre", 'Payer ID number') },
                      { key: 'conformiteDODateNaissance', label: t('Date de naissance du donneur d\'ordre', 'Payer birth date') },
                      { key: 'conformiteDOPaysNaissance', label: t('Pays de naissance du donneur d\'ordre', 'Payer birth country') },
                      { key: 'conformiteDOAdresse', label: t('Adresse complète de résidence du donneur d\'ordre', 'Payer full address') },
                      { key: 'conformiteDOVilleResidence', label: t('Ville de résidence du donneur d\'ordre', 'Payer city') },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-dark-bg-soft/50 border border-gray-100 dark:border-dark-border">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                        <Toggle checked={(formData as any)[key] || false} onChange={(v: boolean) => updateForm(key as any, v)} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-1 h-6 bg-bcp-orange rounded-full" />
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t('Bénéficiaire — champs autorisés', 'Beneficiary — allowed fields')}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: 'conformiteBenefTypePiece', label: t("Type de pièce d'identité du bénéficiaire", 'Beneficiary ID type') },
                      { key: 'conformiteBenefNumPiece', label: t("N° de pièce d'identité du bénéficiaire", 'Beneficiary ID number') },
                      { key: 'conformiteBenefAdresse', label: t('Adresse complète de résidence du bénéficiaire', 'Beneficiary full address') },
                      { key: 'conformiteBenefVilleResidence', label: t('Ville de résidence du bénéficiaire', 'Beneficiary city') },
                      { key: 'conformiteBenefPaysResidence', label: t('Pays de résidence du bénéficiaire', 'Beneficiary country') },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-dark-bg-soft/50 border border-gray-100 dark:border-dark-border">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                        <Toggle checked={(formData as any)[key] || false} onChange={(v: boolean) => updateForm(key as any, v)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* NAVIGATION FOOTER */}
          <div className="px-8 py-6 border-t border-gray-100 dark:border-dark-border bg-gray-50/30 dark:bg-dark-bg-soft/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {activeFormTab > 0 && (
                <button
                  onClick={() => setActiveFormTab(activeFormTab - 1)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-dark-bg-soft hover:bg-gray-200 dark:hover:bg-dark-border transition-all text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('Précédent', 'Previous')}</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {activeFormTab < lastTabIdx ? (
                <button
                  onClick={() => setActiveFormTab(activeFormTab + 1)}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-bcp-orange to-bcp-orange-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
                >
                  <span>{t('Suivant', 'Next')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center space-x-3 px-10 py-3 bg-gradient-to-r from-bcp-orange to-bcp-orange-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {viewMode === 'create' || viewMode === 'resume-draft'
                      ? t('Soumettre pour Validation', 'Submit for Validation')
                      : t('Soumettre la Modification', 'Submit Modification')}
                  </span>
                </button>
              )}
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
              {' â€” '}{selectedValidation.actionType === 'CREATE' ? t('Création', 'Creation') : t('Modification', 'Modification')}
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
                { label: t('Pays du Siège', 'Country'), value: countryLabel(selectedPartner.headquarterCountry, lang) },
                { label: t('Classification', 'Classification'), value: selectedPartner.classification },
                { label: t('Devise Principale', 'Main Currency'), value: selectedPartner.mainCurrency },
                { label: t('Devise Commission', 'Commission Currency'), value: selectedPartner.commissionCurrency },
                { label: t('Nature de Paiement', 'Payment Nature'), value: selectedPartner.paymentNature },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-gray-50/50 dark:bg-dark-bg-soft/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{item.value || 'â€”'}</p>
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
                        {enabled ? `${t('Activé', 'Enabled')} â€” ${limit.toLocaleString()} MAD` : t('Désactivé', 'Disabled')}
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
                { label: t('Pays du Siège', 'Country'), value: countryLabel(selectedPartner.headquarterCountry, lang) },
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
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{item.value || 'â€”'}</p>
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


            {/* VALIDATION HISTORY TIMELINE */}
            {validationHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">{t('Historique Workflow', 'Workflow History')}</h3>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-dark-border" />
                  <div className="space-y-5">
                    {validationHistory.map((record, i) => {
                      const isLatest = i === 0;
                      const dot = record.workflowStatus === 'VALIDATED' ? 'bg-green-500'
                        : record.workflowStatus === 'REJECTED' ? 'bg-red-500'
                        : record.workflowStatus === 'PENDING' ? 'bg-amber-400'
                        : 'bg-gray-300';
                      const badge = record.workflowStatus === 'VALIDATED' ? 'bg-green-100 text-green-700'
                        : record.workflowStatus === 'REJECTED' ? 'bg-red-100 text-red-700'
                        : record.workflowStatus === 'PENDING' ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-500';
                      const statusLabel = record.workflowStatus === 'VALIDATED' ? t('Validé', 'Validated')
                        : record.workflowStatus === 'REJECTED' ? t('Rejeté', 'Rejected')
                        : record.workflowStatus === 'PENDING' ? t('En attente', 'Pending')
                        : t('Brouillon', 'Draft');
                      const actionLabel = record.actionType === 'CREATE' ? t('Création', 'Creation') : t('Modification', 'Modification');
                      return (
                        <div key={record.id} className="flex gap-5 pl-2">
                          <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${dot}`}>
                            {record.workflowStatus === 'VALIDATED' && <Check className="w-3 h-3 text-white" />}
                            {record.workflowStatus === 'REJECTED' && <X className="w-3 h-3 text-white" />}
                            {record.workflowStatus === 'PENDING' && <AlertTriangle className="w-3 h-3 text-white" />}
                            {(record.workflowStatus === 'DRAFT' || !record.workflowStatus) && <FileText className="w-3 h-3 text-white" />}
                          </div>
                          <div className={`flex-1 p-4 rounded-2xl border ${isLatest ? 'border-bcp-orange/20 bg-orange-50/30 dark:bg-bcp-orange/5' : 'border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg-soft/30'}`}>
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${badge}`}>{statusLabel}</span>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{actionLabel}</span>
                              </div>
                              <span className="text-xs text-gray-400">{new Date(record.createdAt).toLocaleString('fr-FR')}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-semibold">{t('Soumis par', 'By')}: </span>
                              <span className="font-mono">{record.createdBy || '—'}</span>
                            </p>
                            {record.validatedBy && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                                <span className="font-semibold">{t('Traité par', 'Processed by')}: </span>
                                <span className="font-mono">{record.validatedBy}</span>
                                {record.validatedAt && <span className="text-gray-400 ml-2 text-xs">({new Date(record.validatedAt).toLocaleDateString('fr-FR')})</span>}
                              </p>
                            )}
                            {record.rejectionReason && (
                              <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                                <p className="text-xs font-bold text-red-600 dark:text-red-400">{t('Motif', 'Reason')}: {record.rejectionReason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

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
