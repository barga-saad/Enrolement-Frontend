import { useState, useEffect, useRef } from 'react';
import { Plus, Eye, Check, X, Edit2, Power, Search, Filter, Download, Shield, FileText, Send, AlertTriangle, ChevronLeft, ChevronRight, Loader2, Building2, ClipboardCheck } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import { FormInput, FormSelect, SearchableSelect } from '../common/FormComponents';
import { countryLabel } from '../common/CountrySelect';
import { COUNTRIES } from '../../utils/countries';
import { CURRENCIES } from '../../utils/currencies';
import { Table, TableColumn } from '../common/Table';
import { Toggle } from '../common/Toggle';
import { useToast } from '../../utils/toastStore';
import { useAuth } from '../../hooks';
import { apiService } from '../../services/api';
import { useLangStore, t } from '../../utils/langStore';
import { ENROLEMENT_ROLES, hasAnyRole } from '../../utils/roles';

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
  rib?: string; // full 24-character RIB (accountNumber holds positions 7 to 22)
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
  natureMassCashPickupTransfer: string;
  validDaysMassCashPickupTransfer: number;
  mainCurrency: string;
  exchangeRateNature?: string;
  exchangeGainPercentage?: number;
  subscriptionFee?: number;
  subscriptionPeriodicity?: string;
  subscriptionBillingAccount?: string;
  paymentNature: string;
  accountingType?: 'AGGREGATED' | 'UNITARY';
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
  commissionTypeSrbmRtgs: string;
  commissionAmountSrbmRtgs: number;
  commissionRateSrbmRtgs: number;
  commissionMinSrbmRtgs?: number;
  commissionMaxSrbmRtgs?: number;
  commissionTypeForexReception: string;
  commissionAmountForexReception: number;
  commissionRateForexReception: number;
  commissionMinForexReception?: number;
  commissionMaxForexReception?: number;
  commissionTypeForexEmission: string;
  commissionAmountForexEmission: number;
  commissionRateForexEmission: number;
  commissionMinForexEmission?: number;
  commissionMaxForexEmission?: number;
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
  { labelFr: 'Virement instantané intra BP', labelEn: 'Internal instant transfer', allowedKey: 'allowedInternalInstantTransfer', limitKey: 'limitInternalInstantTransfer', commTypeKey: 'commissionTypeInstantInternal', commAmountKey: 'commissionAmountInstantInternal', commRateKey: 'commissionRateInstantInternal', commMinKey: 'commissionMinInstantInternal', commMaxKey: 'commissionMaxInstantInternal' },
  { labelFr: 'Virement instantané confrère', labelEn: 'Interbank instant transfer', allowedKey: 'allowedExternalInstantTransfer', limitKey: 'limitExternalInstantTransfer', commTypeKey: 'commissionTypeInstantExternal', commAmountKey: 'commissionAmountInstantExternal', commRateKey: 'commissionRateInstantExternal', commMinKey: 'commissionMinInstantExternal', commMaxKey: 'commissionMaxInstantExternal' },
  { labelFr: 'Virement standard confrère', labelEn: 'Standard interbank transfer', allowedKey: 'allowedStandardTransfer', limitKey: 'limitStandardTransfer', commTypeKey: 'commissionTypeStandardExternal', commAmountKey: 'commissionAmountStandardExternal', commRateKey: 'commissionRateStandardExternal', commMinKey: 'commissionMinStandardExternal', commMaxKey: 'commissionMaxStandardExternal' },
  { labelFr: 'Mise à disposition individuelle', labelEn: 'Individual cash pickup', allowedKey: 'allowedCashPickupTransfer', limitKey: 'limitCashPickupTransfer', commTypeKey: 'commissionTypeCashPickup', commAmountKey: 'commissionAmountCashPickup', commRateKey: 'commissionRateCashPickup', commMinKey: 'commissionMinCashPickup', commMaxKey: 'commissionMaxCashPickup' },
  { labelFr: 'Mise à disposition de masse', labelEn: 'Mass cash pickup', allowedKey: 'allowedMassCashPickupTransfer', limitKey: 'limitMassCashPickupTransfer', commTypeKey: 'commissionTypeMassCashPickup', commAmountKey: 'commissionAmountMassCashPickup', commRateKey: 'commissionRateMassCashPickup', commMinKey: 'commissionMinMassCashPickup', commMaxKey: 'commissionMaxMassCashPickup' },
  { labelFr: 'Transfert Wallet', labelEn: 'Wallet transfer', allowedKey: 'allowedWalletTransfer', limitKey: 'limitWalletTransfer', commTypeKey: 'commissionTypeWallet', commAmountKey: 'commissionAmountWallet', commRateKey: 'commissionRateWallet', commMinKey: 'commissionMinWallet', commMaxKey: 'commissionMaxWallet' },
] as const;

const COMMISSION_TYPES = [
  ...TRANSFER_TYPES,
  { labelFr: 'Virement SRBM confrère (RTGS)', labelEn: 'Interbank SRBM transfer (RTGS)', allowedKey: 'allowedSrbmRtgsTransfer', limitKey: 'limitSrbmRtgsTransfer', commTypeKey: 'commissionTypeSrbmRtgs', commAmountKey: 'commissionAmountSrbmRtgs', commRateKey: 'commissionRateSrbmRtgs', commMinKey: 'commissionMinSrbmRtgs', commMaxKey: 'commissionMaxSrbmRtgs' },
  { labelFr: 'Transfert en devise (réception)', labelEn: 'Foreign-currency transfer (reception)', allowedKey: 'autoriserReception', limitKey: 'plafondReception', commTypeKey: 'commissionTypeForexReception', commAmountKey: 'commissionAmountForexReception', commRateKey: 'commissionRateForexReception', commMinKey: 'commissionMinForexReception', commMaxKey: 'commissionMaxForexReception' },
  { labelFr: 'Transfert en devise (émission)', labelEn: 'Foreign-currency transfer (emission)', allowedKey: 'autoriserEmission', limitKey: 'plafondMontantDevise', commTypeKey: 'commissionTypeForexEmission', commAmountKey: 'commissionAmountForexEmission', commRateKey: 'commissionRateForexEmission', commMinKey: 'commissionMinForexEmission', commMaxKey: 'commissionMaxForexEmission' },
] as const;

const DEFAULT_FORM: Partial<Partner> = {
  name: '',
  partnerReferenceNumber: '',
  partnerType: '',
  partnerStatus: 'INACTIVE',
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
  natureMassCashPickupTransfer: '',
  validDaysMassCashPickupTransfer: 0,
  mainCurrency: '',
  exchangeRateNature: '',
  exchangeGainPercentage: 0,
  subscriptionFee: undefined,
  accountingType: 'UNITARY',
  subscriptionPeriodicity: '',
  subscriptionBillingAccount: undefined,
  paymentNature: '',
  feeMode: '',
  monthlyBilling: false,
  immediateDebit: false,
  reimbursement: false,
  setupFee: undefined,
  setupFeeBilled: false,
  billingMode: 'PER_TRANSACTION',
  derogation: false,
  derogationDetails: '',
  commissionCurrency: 'MAD',
  commissionTypeInstantInternal: 'FLAT',
  commissionAmountInstantInternal: 0,
  commissionRateInstantInternal: 0,
  commissionTypeInstantExternal: 'FLAT',
  commissionAmountInstantExternal: 0,
  commissionRateInstantExternal: 0,
  commissionTypeStandardExternal: 'FLAT',
  commissionAmountStandardExternal: 0,
  commissionRateStandardExternal: 0,
  commissionTypeCashPickup: 'FLAT',
  commissionAmountCashPickup: 0,
  commissionRateCashPickup: 0,
  commissionTypeMassCashPickup: 'FLAT',
  commissionAmountMassCashPickup: 0,
  commissionRateMassCashPickup: 0,
  commissionTypeWallet: 'FLAT',
  commissionAmountWallet: 0,
  commissionRateWallet: 0,
  commissionTypeSrbmRtgs: 'FLAT',
  commissionAmountSrbmRtgs: 0,
  commissionRateSrbmRtgs: 0,
  commissionTypeForexReception: 'PERCENTAGE',
  commissionAmountForexReception: 0,
  commissionRateForexReception: 0,
  commissionTypeForexEmission: 'PERCENTAGE',
  commissionAmountForexEmission: 0,
  commissionRateForexEmission: 0,
  fichierSynthese: true,
};

const normalizeChoice = (value: unknown, aliases: Record<string, string> = {}) => {
  if (typeof value !== 'string' || !value.trim()) return value;
  const normalized = value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[\s-]+/g, '_');
  return aliases[normalized] || normalized;
};

// RIB check against the account validation service: disabled for now (validation rules not decided yet).
// Only the 24-character format is checked (validateTab). Set to true to call the service again.
const RIB_SERVICE_CHECK_ENABLED = false;

// Legacy rows may store the status in French ("Actif" / "Inactif")
const PARTNER_STATUS_ALIASES: Record<string, string> = { ACTIF: 'ACTIVE', INACTIF: 'INACTIVE' };
const isPartnerActive = (status?: string) => normalizeChoice(status, PARTNER_STATUS_ALIASES) === 'ACTIVE';
// Legacy rows may store a country name instead of its ISO code
const COUNTRY_ALIASES: Record<string, string> = { FRANCE: 'FR', ETATS_UNIS: 'US', USA: 'US', MAROC: 'MA' };

const normalizePartnerForm = (partner: Partner): Partner => ({
  ...partner,
  // The form field "Numéro de compte principal" edits the full RIB (24 characters)
  accountNumber: partner.rib || partner.accountNumber,
  partnerType: normalizeChoice(partner.partnerType, { PARTENAIRE: 'PARTNER' }) as string,
  partnerStatus: normalizeChoice(partner.partnerStatus, PARTNER_STATUS_ALIASES) as string,
  classification: normalizeChoice(partner.classification, { INTERNATIONNAL: 'INTERNATIONAL' }) as string,
  headquarterCountry: normalizeChoice(partner.headquarterCountry, COUNTRY_ALIASES) as string,
  parentCompanyCountry: normalizeChoice(partner.parentCompanyCountry, COUNTRY_ALIASES) as string,
  mainCurrency: normalizeChoice(partner.mainCurrency) as string,
  commissionCurrency: normalizeChoice(partner.commissionCurrency) as string,
  exchangeRateNature: normalizeChoice(partner.exchangeRateNature, { NEGOCIE: 'NEGOTIATED' }) as string,
  subscriptionPeriodicity: normalizeChoice(partner.subscriptionPeriodicity, {
    MENSUEL: 'MONTHLY', TRIMESTRIEL: 'QUARTERLY', SEMESTRIEL: 'SEMIANNUAL', ANNUEL: 'ANNUAL',
  }) as string,
  paymentNature: normalizeChoice(partner.paymentNature, { OUI: 'YES', NON: 'NO', 'POST_PAIEMENT': 'POST_PAYMENT', POSTPAIEMENT: 'POST_PAYMENT', 'PRE_PAIEMENT': 'PREPAYMENT', PREPAIEMENT: 'PREPAYMENT' }) as string,
  feeMode: normalizeChoice(partner.feeMode) as string,
  billingMode: normalizeChoice(partner.billingMode, { PAR_TRANSACTION: 'PER_TRANSACTION', MENSUELLE: 'MONTHLY', LES_DEUX: 'BOTH' }) as string,
  typeTransactionEmission: normalizeChoice(partner.typeTransactionEmission, { VIREMENT_ORDINAIRE: 'ORDINARY_TRANSFER', AUTRE: 'OTHER' }) as string,
  natureCoursChangeEmission: normalizeChoice(partner.natureCoursChangeEmission, { NEGOCIE: 'NEGOTIATED' }) as string,
  commissionTypeInstantInternal: normalizeChoice(partner.commissionTypeInstantInternal, { POURCENTAGE: 'PERCENTAGE' }) as string,
  commissionTypeInstantExternal: normalizeChoice(partner.commissionTypeInstantExternal, { POURCENTAGE: 'PERCENTAGE' }) as string,
  commissionTypeStandardExternal: normalizeChoice(partner.commissionTypeStandardExternal, { POURCENTAGE: 'PERCENTAGE' }) as string,
  commissionTypeCashPickup: normalizeChoice(partner.commissionTypeCashPickup, { POURCENTAGE: 'PERCENTAGE' }) as string,
  commissionTypeMassCashPickup: normalizeChoice(partner.commissionTypeMassCashPickup, { POURCENTAGE: 'PERCENTAGE' }) as string,
  commissionTypeWallet: normalizeChoice(partner.commissionTypeWallet, { POURCENTAGE: 'PERCENTAGE' }) as string,
  commissionTypeSrbmRtgs: normalizeChoice(partner.commissionTypeSrbmRtgs, { POURCENTAGE: 'PERCENTAGE' }) as string,
  commissionTypeForexReception: normalizeChoice(partner.commissionTypeForexReception, { POURCENTAGE: 'PERCENTAGE' }) as string,
  commissionTypeForexEmission: normalizeChoice(partner.commissionTypeForexEmission, { POURCENTAGE: 'PERCENTAGE' }) as string,
});

const displayStoredChoice = (value?: string) => {
  if (!value) return '-';
  const code = normalizeChoice(value, {
    PARTENAIRE: 'PARTNER', INTERNATIONNAL: 'INTERNATIONAL', NEGOCIE: 'NEGOTIATED',
    MENSUEL: 'MONTHLY', TRIMESTRIEL: 'QUARTERLY', SEMESTRIEL: 'SEMIANNUAL', ANNUEL: 'ANNUAL',
    PAR_TRANSACTION: 'PER_TRANSACTION', MENSUELLE: 'MONTHLY', LES_DEUX: 'BOTH',
    FLAT: 'FLAT', POURCENTAGE: 'PERCENTAGE', OUI: 'YES', NON: 'NO',
    POST_PAIEMENT: 'POST_PAYMENT', POSTPAIEMENT: 'POST_PAYMENT', PRE_PAIEMENT: 'PREPAYMENT', PREPAIEMENT: 'PREPAYMENT',
  }) as string;
  const labels: Record<string, [string, string]> = {
    PARTNER: ['Partenaire', 'Partner'], CLIENT: ['Client', 'Client'],
    LOCAL: ['Local', 'Local'], INTERNATIONAL: ['International', 'International'],
    MONTHLY: ['Mensuel', 'Monthly'], QUARTERLY: ['Trimestriel', 'Quarterly'],
    SEMIANNUAL: ['Semestriel', 'Semiannual'], ANNUAL: ['Annuel', 'Annual'],
    PER_TRANSACTION: ['Par transaction', 'Per transaction'], BOTH: ['Les deux', 'Both'],
    FLAT: ['Forfaitaire', 'Flat'], PERCENTAGE: ['Pourcentage', 'Percentage'],
    YES: ['Oui', 'Yes'], NO: ['Non', 'No'],
    POST_PAYMENT: ['Post-paiement', 'Post-payment'], PREPAYMENT: ['Pré-paiement', 'Prepayment'],
    NEGOTIATED: ['Négocié', 'Negotiated'], FIXING: ['Fixing', 'Fixing'], SPOT: ['Spot', 'Spot'],
    ORDINARY_TRANSFER: ['Virement ordinaire', 'Ordinary transfer'], OTHER: ['Autre', 'Other'],
  };
  return labels[code] ? t(...labels[code]) : value;
};

type ViewMode = 'list' | 'create' | 'edit' | 'validate' | 'consult' | 'drafts' | 'resume-draft';

interface PartnersPageProps {
  initialMode?: 'create' | 'edit' | 'validate' | 'consult' | 'drafts';
}

const WORKFLOW_BADGES: Record<string, { bg: string; text: string; labelFr: string; labelEn: string }> = {
  PENDING: { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200/70 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', labelFr: 'En attente', labelEn: 'Pending' },
  VALIDATED: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/70 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', labelFr: 'Validé', labelEn: 'Validated' },
  REJECTED: { bg: 'bg-red-50 dark:bg-red-500/10 border-red-200/70 dark:border-red-500/20', text: 'text-red-700 dark:text-red-400', labelFr: 'Rejeté', labelEn: 'Rejected' },
  DRAFT: { bg: 'bg-brown-50 dark:bg-bcp-brown/20 border-brown-200 dark:border-bcp-brown/30', text: 'text-bcp-brown dark:text-brown-200', labelFr: 'Brouillon', labelEn: 'Draft' },
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
  const [workflowFilter, setWorkflowFilter] = useState<'ALL' | 'DRAFT' | 'PENDING' | 'VALIDATED' | 'REJECTED'>('ALL');
  const [formData, setFormData] = useState<Partial<Partner>>({ ...DEFAULT_FORM });
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
  const [validatedAccountNumber, setValidatedAccountNumber] = useState<string | null>(null);
  const [accountValidationError, setAccountValidationError] = useState<string | null>(null);
  const [accountValidationLoading, setAccountValidationLoading] = useState(false);
  const accountValidationInFlight = useRef(false);
  const accountValidationAttempt = useRef(0);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [validating, setValidating] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState(0);
  const [validationHistory, setValidationHistory] = useState<ValidationRecord[]>([]);
  const [partnerStatusTarget, setPartnerStatusTarget] = useState<Partner | null>(null);
  const [updatingPartnerStatus, setUpdatingPartnerStatus] = useState(false);

  // Agent d'enrôlement = data entry + validation (the backend refuses validating one's own entry)
  const isValidator = hasAnyRole(user?.roleNames, ENROLEMENT_ROLES);
  const isSaisie = hasAnyRole(user?.roleNames, ENROLEMENT_ROLES);
  const canCreate = isSaisie;

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

  const handleTogglePartnerStatus = async () => {
    if (!partnerStatusTarget) return;
    const nextStatus = isPartnerActive(partnerStatusTarget.partnerStatus) ? 'INACTIVE' : 'ACTIVE';
    setUpdatingPartnerStatus(true);
    try {
      await apiService.updatePartnerStatus(partnerStatusTarget.partnerReferenceNumber, nextStatus);
      toast.success(nextStatus === 'INACTIVE'
        ? t('Partenaire désactivé. Son historique est conservé.', 'Partner deactivated. Its history is preserved.')
        : t('Partenaire activé', 'Partner activated'));
      setPartnerStatusTarget(null);
      await fetchPartners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Impossible de modifier le statut du partenaire', 'Could not update partner status'));
    } finally {
      setUpdatingPartnerStatus(false);
    }
  };

  const fetchPendingValidations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPendingValidations();
      const data = response.data.data || response.data;
      setPendingValidations(Array.isArray(data) ? data : []);
      window.dispatchEvent(new Event('pending-validations-updated'));
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

  const validateTab = (tabIdx: number): boolean => {
    const errors: Record<string, string | null> = {};

    if (tabIdx === 0) {
      if (!formData.name || formData.name.trim().length < 3) {
        errors.name = t('Le nom du partenaire est requis (min. 3 caractères)', 'Partner name is required (min. 3 chars)');
      }
      if (!formData.partnerType) {
        errors.partnerType = t('Le type de partenaire est requis', 'Partner type is required');
      }
      if (!formData.classification) {
        errors.classification = t('La classification est requise', 'Classification is required');
      }
      if (!formData.headquarterCountry) {
        errors.headquarterCountry = t('Le pays du siège social est requis', 'Headquarters country is required');
      }
      if (!formData.accountNumber) {
        errors.accountNumber = t('Le RIB est requis (24 caractères)', 'RIB is required (24 characters)');
      } else if (!/^[A-Za-z0-9]{24}$/.test(formData.accountNumber)) {
        errors.accountNumber = t('Le RIB doit contenir exactement 24 caractères (chiffres ou lettres)', 'The RIB must contain exactly 24 characters (digits or letters)');
      } else if (!/^1\d{2}/.test(formData.accountNumber)) {
        // Bank code = first 3 characters of the RIB; it must be 1XX
        errors.accountNumber = t('Problème avec le code banque du RIB', 'Problem with the RIB bank code');
      }
      if (!formData.mainCurrency) {
        errors.mainCurrency = t('La devise principale est requise', 'Main currency is required');
      }
    }

    if (tabIdx === 1) {
      if (formData.autoriserEmission) {
        if (!formData.typeTransactionEmission) {
          errors.typeTransactionEmission = t('Le type de transfert est requis', 'Transfer type is required');
        }
        if (!formData.natureCoursChangeEmission) {
          errors.natureCoursChangeEmission = t('La nature du cours de change est requise', 'Exchange rate nature is required');
        }
      }
    }

    if (tabIdx === 2) {
      if (!formData.subscriptionPeriodicity) {
        errors.subscriptionPeriodicity = t('La périodicité est requise', 'Subscription periodicity is required');
      }
      if (!formData.paymentNature) {
        errors.paymentNature = t('Le contrôle de provision est requis', 'Provision control is required');
      }
      if (formData.subscriptionBillingAccount && !/^[A-Za-z0-9]{24}$/.test(formData.subscriptionBillingAccount)) {
        errors.subscriptionBillingAccount = t('Le compte de règlement doit contenir exactement 24 caractères (chiffres ou lettres)', 'Settlement account must contain exactly 24 characters (digits or letters)');
      }
    }

    setFormErrors((prev) => {
      const next = { ...prev };
      if (tabIdx === 0) {
        delete next.name;
        delete next.partnerType;
        delete next.classification;
        delete next.headquarterCountry;
        delete next.accountNumber;
        delete next.mainCurrency;
      } else if (tabIdx === 1) {
        delete next.typeTransactionEmission;
        delete next.natureCoursChangeEmission;
      } else if (tabIdx === 2) {
        delete next.subscriptionPeriodicity;
        delete next.billingMode;
        delete next.paymentNature;
        delete next.subscriptionBillingAccount;
      }
      return { ...next, ...errors };
    });

    return Object.keys(errors).length === 0;
  };

  const validateAllTabs = (): boolean => {
    let isValid = true;
    let firstFailingTab = -1;
    const hasConformiteTab = formData.partnerType === 'PARTNER' || formData.partnerType === 'CLIENT';
    const totalTabs = hasConformiteTab ? 4 : 3;

    for (let i = 0; i < totalTabs; i++) {
      if (!validateTab(i)) {
        isValid = false;
        if (firstFailingTab === -1) {
          firstFailingTab = i;
        }
      }
    }

    if (!isValid && firstFailingTab !== -1) {
      setActiveFormTab(firstFailingTab);
    }
    return isValid;
  };

  const tabHasError = (tabIdx: number): boolean => {
    if (tabIdx === 0) {
      return !!(formErrors.name || formErrors.partnerType || formErrors.classification || formErrors.headquarterCountry || formErrors.accountNumber || formErrors.mainCurrency);
    }
    if (tabIdx === 1) {
      return !!(formErrors.typeTransactionEmission || formErrors.natureCoursChangeEmission);
    }
    if (tabIdx === 2) {
      return !!(formErrors.subscriptionPeriodicity || formErrors.billingMode || formErrors.paymentNature);
    }
    return false;
  };

  const validateAccountNumber = async (accountNumber: string): Promise<boolean> => {
    if (validatedAccountNumber === accountNumber) return true;
    if (accountValidationInFlight.current) return false;

    const attempt = ++accountValidationAttempt.current;
    accountValidationInFlight.current = true;
    setAccountValidationLoading(true);
    setAccountValidationError(null);

    try {
      const response = await apiService.validatePartnerAccount(accountNumber);
      if (accountValidationAttempt.current !== attempt) return false;

      if (response.data?.status?.code === 'PASS') {
        setValidatedAccountNumber(accountNumber);
        return true;
      }

      setAccountValidationError(t(
        "Le compte renseigné n'a pas pu être validé. Veuillez vérifier le RIB.",
        'The account could not be validated. Please check the RIB.'
      ));
      return false;
    } catch {
      if (accountValidationAttempt.current === attempt) {
        setAccountValidationError(t(
          'Le service de validation des comptes est indisponible. Veuillez réessayer ultérieurement.',
          'The account validation service is unavailable. Please try again later.'
        ));
      }
      return false;
    } finally {
      accountValidationInFlight.current = false;
      setAccountValidationLoading(false);
    }
  };

  const handleTabClick = async (targetTab: number) => {
    if (targetTab > activeFormTab) {
      for (let i = 0; i < targetTab; i++) {
        if (!validateTab(i)) {
          setActiveFormTab(i);
          toast.error(t('Veuillez remplir correctement tous les champs obligatoires de cette étape', 'Please correctly fill all required fields in this step'));
          return;
        }
        if (RIB_SERVICE_CHECK_ENABLED && i === 0 && !await validateAccountNumber(formData.accountNumber || '')) return;
      }
    }
    setActiveFormTab(targetTab);
  };

  const handleNextTab = async () => {
    if (!validateTab(activeFormTab)) {
      toast.error(t('Veuillez corriger les erreurs avant de passer à l’étape suivante', 'Please fix errors before proceeding to the next step'));
      return;
    }
    if (RIB_SERVICE_CHECK_ENABLED && activeFormTab === 0 && !await validateAccountNumber(formData.accountNumber || '')) return;
    setActiveFormTab((prev) => prev + 1);
  };

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      (p.partnerReferenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    // Modification page: only show VALIDATED partners (drafts have their own page)
    const matchesWorkflow = initialMode === 'edit'
      ? (p.workflowStatus === 'VALIDATED' || !p.workflowStatus)
      : workflowFilter === 'ALL' || (p.workflowStatus || 'DRAFT') === workflowFilter;
    return matchesSearch && matchesWorkflow;
  });

  const filteredValidations = pendingValidations.filter((v) => {
    const matchesSearch =
      (v.partnerReferenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.partnerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.createdBy || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSubmit = async () => {
    if (!validateAllTabs()) {
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
        // Backend auto-creates a DRAFT validation record; no separate call is needed.
        toast.success(t('Brouillon sauvegardé avec succès', 'Draft saved successfully'));
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Échec de la sauvegarde', 'Save failed'));
    }
  };

  const handleValidate = async (validationId: number) => {
    setValidating(true);
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
    } finally {
      setValidating(false);
      setShowValidateConfirm(false);
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
    if (key === 'accountNumber') {
      accountValidationAttempt.current += 1;
      setValidatedAccountNumber(null);
      setAccountValidationError(null);
    }

    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'partnerType') {
        updated.enrollmentType = value === 'CLIENT' ? 'CLIENT' : 'PARTNER';
      }
      return updated;
    });

    setFormErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

    if (key === 'partnerType' && value !== 'PARTNER') {
      setActiveFormTab((prev) => (prev === 3 ? 0 : prev));
    }
  };

  const formatCommission = (partner: Partner, typeKey: string, amountKey: string, rateKey: string, minKey: string, maxKey: string) => {
    const mode = normalizeChoice((partner as any)[typeKey], { POURCENTAGE: 'PERCENTAGE' }) || 'FLAT';
    const amount = (partner as any)[amountKey];
    const rate = (partner as any)[rateKey];
    const min = (partner as any)[minKey];
    const max = (partner as any)[maxKey];
    const value = mode === 'PERCENTAGE'
      ? `${rate ?? 0}%`
      : `${amount ?? 0} ${partner.commissionCurrency || 'MAD'}`;
    const bounds = [min != null ? `min ${min}` : '', max != null ? `max ${max}` : ''].filter(Boolean).join(' / ');
    return `${value}${bounds ? ` (${bounds})` : ''}`;
  };

  const renderPricingSummary = (partner: Partner) => (
    <div className="space-y-6">
      <section>
        <h3 className="section-label mb-3">{t('Abonnement et frais', 'Subscription and fees')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: t('Frais de mise en place', 'Setup fee'), value: partner.setupFee != null ? `${partner.setupFee} MAD` : '-' },
            { label: t("Frais d'abonnement", 'Subscription fee'), value: partner.subscriptionFee != null ? `${partner.subscriptionFee} MAD` : '-' },
            { label: t('Périodicité', 'Periodicity'), value: displayStoredChoice(partner.subscriptionPeriodicity) },
            { label: t('Compte de règlement', 'Settlement account'), value: partner.subscriptionBillingAccount || '-' },
            { label: t('Mode de règlement des commissions', 'Commission settlement mode'), value: displayStoredChoice(partner.feeMode) },
            { label: t('Mode de facturation', 'Billing mode'), value: displayStoredChoice(partner.billingMode) },
            { label: t('Facturation mensuelle', 'Monthly billing'), value: partner.monthlyBilling ? t('Oui', 'Yes') : t('Non', 'No') },
            { label: t('Débit immédiat', 'Immediate debit'), value: partner.immediateDebit ? t('Oui', 'Yes') : t('Non', 'No') },
            { label: t('Reversement à la banque', 'Reimbursement to bank'), value: partner.reimbursement ? t('Oui', 'Yes') : t('Non', 'No') },
            { label: t('Dérogation', 'Waiver'), value: partner.derogation ? `${t('Oui', 'Yes')}${partner.derogationDetails ? ` - ${partner.derogationDetails}` : ''}` : t('Non', 'No') },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-gray-50/70 dark:bg-dark-bg-soft/60 border border-gray-100 dark:border-dark-border">
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="section-label mb-3">{t('Commissions par transaction', 'Transaction commissions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMMISSION_TYPES.map((item) => (
            <div key={item.commTypeKey} className="p-4 rounded-xl bg-gray-50/70 dark:bg-dark-bg-soft/60 border border-gray-100 dark:border-dark-border">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">{t(item.labelFr, item.labelEn)}</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {formatCommission(partner, item.commTypeKey, item.commAmountKey, item.commRateKey, item.commMinKey, item.commMaxKey)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const openEditPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData(normalizePartnerForm(partner));
    setViewMode('edit');
  };

  const openConsultPartner = async (partner: Partner) => {
    setSelectedPartner(partner);
    setViewMode('consult');
    setValidationHistory([]);
    if (partner.id) {
      try {
        const res = await apiService.getValidationHistory(partner.id);
        const histData = res.data?.data ?? res.data;
        setValidationHistory(Array.isArray(histData) ? histData : []);
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
      setFormData(normalizePartnerForm(partner));
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
        render: (name: string) => <span className="font-semibold text-gray-900 dark:text-white">{name}</span>,
      },
      {
        key: 'actionType' as any, header: t('Action', 'Action'), sortable: true,
        render: (action: string) => (
          <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap ${action === 'CREATE' ? 'bg-orange-50 text-orange-700 border-orange-200/70 dark:bg-bcp-orange/10 dark:text-bcp-orange-light dark:border-bcp-orange/20' :
              'bg-brown-50 text-bcp-brown border-brown-200 dark:bg-bcp-brown/20 dark:text-brown-200 dark:border-bcp-brown/30'
            }`}>{action === 'CREATE' ? t('Création', 'Create') : t('Modification', 'Update')}</span>
        ),
      },
      { key: 'createdBy' as any, header: t('Saisi par', 'Created by'), sortable: true },
      {
        key: 'createdAt' as any, header: t('Date', 'Date'), sortable: true,
        render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
      },
      {
        key: 'workflowStatus' as any,
        header: t('Statut', 'Status'),
        render: (status: string) => {
          const badge = WORKFLOW_BADGES[status] || WORKFLOW_BADGES.PENDING;
          return (
            <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap ${badge.bg} ${badge.text}`}>
              {t(badge.labelFr, badge.labelEn)}
            </span>
          );
        },
      },
    ];

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="page-hero">
          <div className="page-hero-icon"><ClipboardCheck className="w-6 h-6" /></div>
          <div className="flex flex-col items-center">
            <h1 className="page-title">
              {t('Validation des demandes', 'Request Validation')}
            </h1>
            <p className="page-subtitle">
              {t('Gouvernance et validation des demandes partenaires en attente', 'Governance and validation of pending partner requests')}
            </p>
          </div>
        </div>

        <div className="card-base overflow-hidden">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 border-b border-gray-100 dark:border-dark-border">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors" size={18} />
              <input
                type="text"
                placeholder={t('Rechercher par référence, nom ou saisisseur...', 'Search by reference, name or creator...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="premium-input pl-11"
              />
            </div>
          </div>

          <Table
            className="!rounded-none !border-0 !shadow-none"
            columns={validationColumns}
            data={filteredValidations}
            keyField="id"
            loading={loading}
            emptyMessage={loading ? t('Chargement...', 'Loading...') : t('Aucune demande en attente', 'No pending requests')}
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openValidatePartner(row)}
                  aria-label={t('Examiner', 'Review')}
                  className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
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
        render: (name: string) => <span className="font-semibold text-gray-900 dark:text-white">{name}</span>,
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
              <span className="inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400">
                {t('Rejeté', 'Rejected')}
              </span>
              {row.rejectionReason && (
                <p className="text-xs text-red-500 dark:text-red-400 max-w-[180px] truncate" title={row.rejectionReason}>
                  {row.rejectionReason}
                </p>
              )}
            </div>
          ) : (
            <span className="inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap bg-brown-50 text-bcp-brown border-brown-200 dark:bg-bcp-brown/20 dark:text-brown-200 dark:border-bcp-brown/30">
              {t('Brouillon', 'Draft')}
            </span>
          )
        ),
      },
    ];

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="page-hero">
          <div className="page-hero-icon"><FileText className="w-6 h-6" /></div>
          <div className="flex flex-col items-center">
            <h1 className="page-title">
              {t('Mes Brouillons', 'My Drafts')}
            </h1>
            <p className="page-subtitle">
              {t('Demandes enregistrées en brouillon : à soumettre pour validation', 'Requests saved as drafts; submit them for validation when ready')}
            </p>
          </div>
        </div>

        <div className="card-base overflow-hidden">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 border-b border-gray-100 dark:border-dark-border">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors" size={18} />
              <input
                type="text"
                placeholder={t('Rechercher par référence ou désignation...', 'Search by reference or designation...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="premium-input pl-11"
              />
            </div>
          </div>

          <Table
            className="!rounded-none !border-0 !shadow-none"
            columns={draftColumns}
            data={filteredDrafts}
            keyField="id"
            loading={loading}
            emptyMessage={loading ? t('Chargement...', 'Loading...') : t('Aucun brouillon trouvé', 'No drafts found')}
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openDraftPartner(row)}
                  aria-label={t('Reprendre', 'Resume')}
                  className="p-2 bg-orange-50 dark:bg-bcp-orange/10 rounded-lg text-bcp-orange hover:bg-orange-100 dark:hover:bg-bcp-orange/20 transition-colors"
                  title={t('Reprendre', 'Resume')}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => submitDraftDirectly(row)}
                  aria-label={t('Soumettre pour validation', 'Submit for validation')}
                  className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
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
        render: (name: string) => <span className="font-semibold text-gray-900 dark:text-white">{name}</span>,
      },
      { key: 'partnerType' as any, header: t('Type', 'Type'), sortable: true, render: (value: string) => displayStoredChoice(value) },
      { key: 'headquarterCountry' as any, header: t('Pays', 'Country'), sortable: true },
      ...(initialMode === 'edit' ? [] : [{
        key: 'workflowStatus' as any,
        header: t('Workflow', 'Workflow'),
        sortable: true,
        render: (status: string) => {
          const badge = WORKFLOW_BADGES[status || 'DRAFT'] || WORKFLOW_BADGES.DRAFT;
          return (
            <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap ${badge.bg} ${badge.text}`}>
              {t(badge.labelFr, badge.labelEn)}
            </span>
          );
        },
      }]),
      {
        key: 'partnerStatus' as any,
        header: t('Statut', 'Status'),
        render: (status: string) => (
          <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap ${isPartnerActive(status)
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
              : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20'
            }`}>
            {isPartnerActive(status) ? t('Actif', 'Active') : t('Inactif', 'Inactive')}
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

    const statusTargetIsActive = isPartnerActive(partnerStatusTarget?.partnerStatus);
    const statusTargetKindFr = partnerStatusTarget?.partnerType === 'CLIENT' ? 'le client' : 'le partenaire';
    const statusTargetKindEn = partnerStatusTarget?.partnerType === 'CLIENT' ? 'client' : 'partner';

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Activate / deactivate confirmation (opened by the Power button of the modification list) */}
        <ConfirmDialog
          open={partnerStatusTarget !== null}
          title={statusTargetIsActive ? t(`Désactiver ${statusTargetKindFr}`, `Deactivate ${statusTargetKindEn}`) : t(`Activer ${statusTargetKindFr}`, `Activate ${statusTargetKindEn}`)}
          description={statusTargetIsActive
            ? t(`Désactiver ${partnerStatusTarget?.name} ? Ses données et son historique seront conservés, mais aucune nouvelle opération ne sera autorisée.`, `Deactivate ${partnerStatusTarget?.name}? Its data and history will remain, but new operations will be blocked.`)
            : t(`Activer ${partnerStatusTarget?.name} ? Les nouvelles opérations seront de nouveau autorisées.`, `Activate ${partnerStatusTarget?.name}? New operations will be allowed again.`)}
          confirmLabel={statusTargetIsActive ? t('Désactiver', 'Deactivate') : t('Activer', 'Activate')}
          cancelLabel={t('Annuler', 'Cancel')}
          busy={updatingPartnerStatus}
          tone={statusTargetIsActive ? 'danger' : 'accent'}
          onCancel={() => setPartnerStatusTarget(null)}
          onConfirm={handleTogglePartnerStatus}
        />
        <div className="page-hero">
          <div className="page-hero-icon"><Building2 className="w-6 h-6" /></div>
          <div className="flex flex-col items-center">
            <h1 className="page-title">{pageTitle}</h1>
            <p className="page-subtitle">{pageSubtitle}</p>
          </div>
          <div className="page-hero-actions">
            <button
              onClick={handleExportCsv}
              aria-label={t('Exporter CSV', 'Export CSV')}
              className="btn-icon h-11 w-11 rounded-xl"
              title={t('Exporter CSV', 'Export CSV')}
            >
              <Download size={20} />
            </button>
            {canCreate && !initialMode && (
              <button
                onClick={() => { setViewMode('create'); setSelectedPartner(null); setFormData({ ...DEFAULT_FORM }); setFormErrors({}); }}
                className="btn-primary h-11"
              >
                <Plus size={18} />
                <span>{t('Nouveau partenaire', 'New partner')}</span>
              </button>
            )}
          </div>
        </div>

        <div className="card-base overflow-hidden">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 border-b border-gray-100 dark:border-dark-border">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors" size={18} />
              <input
                type="text"
                placeholder={t('Rechercher par référence ou désignation...', 'Search by reference or designation...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="premium-input pl-11"
              />
            </div>
            <button className="btn-outline min-h-[44px]">
              <Filter size={16} />
              <span>{t('Filtre avancé', 'Advanced Filter')}</span>
            </button>
          </div>

          {initialMode !== 'edit' && (
            <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-gray-100 dark:border-dark-border" role="group" aria-label={t('Filtrer par statut de workflow', 'Filter by workflow status')}>
              {([
                { value: 'ALL', labelFr: 'Tous', labelEn: 'All' },
                { value: 'DRAFT', labelFr: 'Brouillons', labelEn: 'Drafts' },
                { value: 'PENDING', labelFr: 'En attente', labelEn: 'Pending' },
                { value: 'VALIDATED', labelFr: 'Validés', labelEn: 'Validated' },
                { value: 'REJECTED', labelFr: 'Rejetés', labelEn: 'Rejected' },
              ] as const).map((chip) => {
                const count = chip.value === 'ALL'
                  ? partners.length
                  : partners.filter((p) => (p.workflowStatus || 'DRAFT') === chip.value).length;
                const active = workflowFilter === chip.value;
                return (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setWorkflowFilter(chip.value)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bcp-orange/20 ${active
                      ? 'bg-bcp-orange text-white border-bcp-orange'
                      : 'bg-white dark:bg-dark-bg-soft text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-bcp-orange/40 hover:text-bcp-orange'
                    }`}
                  >
                    <span>{t(chip.labelFr, chip.labelEn)}</span>
                    <span className={`tabular-nums px-1.5 rounded-full text-[10px] ${active ? 'bg-white/25' : 'bg-gray-100 dark:bg-dark-bg'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          <Table
            className="!rounded-none !border-0 !shadow-none"
            columns={columns}
            data={filteredPartners}
            keyField="id"
            loading={loading}
            emptyMessage={loading ? t('Synchronisation du registre...', 'Synchronizing registry...') : t('Aucun partenaire trouvé', 'No partners found')}
            actions={(row) => (
              <div className="flex gap-2">
                {initialMode === 'edit' ? (
                  <>
                    <button
                      onClick={() => openEditPartner(row)}
                      disabled={!isPartnerActive(row.partnerStatus)}
                      aria-label={t('Modifier', 'Edit')}
                      className="p-2 bg-orange-50 dark:bg-bcp-orange/10 rounded-lg text-bcp-orange hover:bg-orange-100 dark:hover:bg-bcp-orange/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-50"
                      title={isPartnerActive(row.partnerStatus) ? t('Modifier', 'Edit') : t('Réactivez le partenaire pour le modifier', 'Activate the partner before editing')}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => setPartnerStatusTarget(row)}
                      aria-label={isPartnerActive(row.partnerStatus) ? t('Désactiver', 'Deactivate') : t('Activer', 'Activate')}
                      className={`p-2 rounded-lg transition-colors ${isPartnerActive(row.partnerStatus)
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}
                      title={isPartnerActive(row.partnerStatus) ? t('Désactiver', 'Deactivate') : t('Activer', 'Activate')}
                    >
                      <Power size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openConsultPartner(row)}
                    aria-label={t('Consulter', 'View')}
                    className="p-2 bg-gray-100/80 dark:bg-dark-bg-soft rounded-lg text-gray-500 hover:text-bcp-orange hover:bg-orange-50 dark:hover:bg-bcp-orange/10 transition-colors"
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
  //  CHOOSE TYPE VIEW
  // ═══════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════
  //  CREATE / EDIT FORM VIEW  (reference-style 4 tabs)
  // ═══════════════════════════════════════════════════
  if (viewMode === 'create' || viewMode === 'edit' || viewMode === 'resume-draft') {
    const isPartnerForm = formData.partnerType === 'PARTNER';
    const isClientForm = formData.partnerType === 'CLIENT';
    const showConformite = isPartnerForm || isClientForm;
    const FORM_TRANSFER_TYPES = [
      // For now only the internal instant transfer is offered in the form
      { key: 'InstantInternal', label: t('Virement instantané intra BP', 'Internal Instant Transfer'), allowedKey: 'allowedInternalInstantTransfer', limitKey: 'limitInternalInstantTransfer', noLimit: false },
    ];
    // Pricing grid: drop the transfer types removed from the form above (forex rows are kept)
    const HIDDEN_FORM_TRANSFER_KEYS: string[] = [
      'allowedExternalInstantTransfer', 'allowedSrbmRtgsTransfer', 'allowedStandardTransfer',
      'allowedCashPickupTransfer', 'allowedMassCashPickupTransfer', 'allowedWalletTransfer',
    ];
    const FORM_COMMISSION_TYPES = COMMISSION_TYPES.filter((item) => !HIDDEN_FORM_TRANSFER_KEYS.includes(item.allowedKey));
    const FORM_TABS_LIST = showConformite
      ? [t('1. Informations générales', '1. General Info'), t('2. Transferts & Plafonds', '2. Transfers'), t('3. Abonnement & Contrôles', '3. Subscription'), t('4. Conformités', '4. Compliance')]
      : [t('1. Informations générales', '1. General Info'), t('2. Transferts & Plafonds', '2. Transfers'), t('3. Abonnement & Contrôles', '3. Subscription')];
    const lastTabIdx = FORM_TABS_LIST.length - 1;
    return (
      <div className="space-y-8 max-w-5xl mx-auto animate-slideUp">
        <div className="page-hero">
          <div className="page-hero-icon">{viewMode === 'create' ? <Plus className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}</div>
          <div className="flex flex-col items-center">
            <h1 className="page-title">
              {viewMode === 'create'
                ? (isClientForm ? t('Enrôlement client', 'Client enrollment') : isPartnerForm ? t('Nouveau partenaire', 'New partner') : t('Nouveau enrôlement', 'New enrollment'))
                : viewMode === 'resume-draft'
                  ? t('Reprendre le brouillon', 'Resume draft')
                  : t('Modification partenaire', 'Partner modification')}
            </h1>
            <p className="page-subtitle">
              {t('Remplissez le formulaire puis soumettez pour validation', 'Fill the form then submit for validation')}
            </p>
          </div>

        </div>

        {/* ── FORM CONTAINER ── */}
        <div className="card-base shadow-bcp-medium overflow-hidden">

          {/* TAB HEADERS */}
          <div className="flex overflow-x-auto custom-scrollbar border-b border-gray-200/70 dark:border-dark-border bg-gray-50/60 dark:bg-dark-bg-soft/40" role="tablist">
            {FORM_TABS_LIST.map((label, i) => (
              <button
                key={i}
                onClick={() => handleTabClick(i)}
                role="tab"
                aria-selected={activeFormTab === i}
                className={`flex-1 min-w-max px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center justify-center space-x-2 ${activeFormTab === i
                    ? 'text-bcp-brown dark:text-bcp-orange border-bcp-orange bg-white dark:bg-dark-bg-card'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 hover:bg-white/60 dark:hover:text-gray-200 dark:hover:bg-dark-bg-card/40'
                  }`}
              >
                <span>{label}</span>
                {tabHasError(i) && (
                  <span className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-500/15" title={t('Champs obligatoires manquants', 'Missing required fields')} aria-label={t('Champs obligatoires manquants', 'Missing required fields')} />
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="p-5 sm:p-8 space-y-8">

            {/* TAB 0 - INFORMATIONS GÉNÉRALES */}
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
                    onChange={() => { }}
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
                    error={formErrors.partnerType || undefined}
                    options={[
                      { value: '', label: '-- Choisir --' },
                      { value: 'PARTNER', label: t('Partenaire', 'Partner') },
                      { value: 'CLIENT', label: t('Client', 'Client') },
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
                      { value: 'LOCAL', label: t('Local', 'Local') },
                      { value: 'INTERNATIONAL', label: t('International', 'International') },
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
                    error={formErrors.accountNumber || accountValidationError || undefined}
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
                      { value: 'FIXING', label: 'Fixing' },
                      { value: 'NEGOTIATED', label: t('Négocié', 'Negotiated') },
                      { value: 'SPOT', label: 'Spot' },
                    ]}
                  />
                </div>
                <FormSelect
                  label={t('Type de comptabilité', 'Accounting type')}
                  value={formData.accountingType || ''}
                  onChange={(e) => updateForm('accountingType', e.target.value || undefined)}
                  options={[
                    { value: '', label: t('-- Choisir --', '-- Select --') },
                    { value: 'AGGREGATED', label: t('Global', 'Global') },
                    { value: 'UNITARY', label: t('Unitaire', 'Unitary') },
                  ]}
                />
                {viewMode === 'create' ? <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-gray-50/60 dark:bg-dark-bg-soft/50 border border-gray-200/70 dark:border-dark-border">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('Statut : Inactif', 'Status: Inactive')}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-right">{t('Le partenaire/client devient actif après sa validation.', 'The partner/client becomes active once validated.')}</span>
                </div> : <p className="text-xs text-gray-500">{t('Le statut se modifie depuis la liste des partenaires.', 'Change the status from the partner list.')}</p>}
              </div>
            )}

            {/* TAB 1 - TRANSFERTS & PLAFONDS */}
            {activeFormTab === 1 && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-1 h-5 bg-gradient-to-b from-bcp-orange to-bcp-brown rounded-full" />
                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{t('Types de transaction & plafond autorisés', 'Authorized Transaction Types & Limits')}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FORM_TRANSFER_TYPES.map((tt) => {
                      const enabled = !!(formData as any)[tt.allowedKey];
                      return (
                        <div key={tt.key} className={`p-4 sm:p-5 rounded-xl border transition-colors ${enabled ? 'border-bcp-orange/50 bg-orange-50/40 shadow-sm shadow-bcp-orange/10 dark:bg-bcp-orange/5' : 'border-gray-200/70 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg-soft/30'}`}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{tt.label}</span>
                            <Toggle checked={enabled} onChange={(v: boolean) => updateForm(tt.allowedKey, v)} />
                          </div>
                          {enabled && !tt.noLimit && tt.limitKey && (
                            <div className="mt-4 pt-4 border-t border-bcp-orange/15">
                              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('Plafond', 'Limit')}</label>
                              <input
                                type="number"
                                min={0}
                                value={(formData as any)[tt.limitKey] || ''}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateForm(tt.limitKey!, isNaN(v) ? 0 : Math.max(0, v));
                                }}
                                className="premium-input font-semibold tabular-nums"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {formData.allowedMassCashPickupTransfer && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl border border-gray-200/70 dark:border-dark-border bg-orange-50/30 dark:bg-bcp-orange/5">
                    <FormInput
                      label={t("Nature d'opération", 'Operation Nature')}
                      type="text"
                      value={formData.natureMassCashPickupTransfer || ''}
                      onChange={(e) => updateForm('natureMassCashPickupTransfer', e.target.value)}
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

                <div className={`p-5 rounded-xl border transition-colors ${formData.autoriserReception ? 'border-bcp-orange/50 bg-orange-50/40 shadow-sm shadow-bcp-orange/10 dark:bg-bcp-orange/5' : 'border-gray-200/70 dark:border-dark-border'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-1 h-5 bg-gradient-to-b from-bcp-orange to-bcp-brown rounded-full" />
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

                <div className={`p-5 rounded-xl border transition-colors ${formData.autoriserEmission ? 'border-bcp-orange/50 bg-orange-50/40 shadow-sm shadow-bcp-orange/10 dark:bg-bcp-orange/5' : 'border-gray-200/70 dark:border-dark-border'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-1 h-5 bg-gradient-to-b from-bcp-orange to-bcp-brown rounded-full" />
                      <span className="font-bold text-gray-900 dark:text-white">{t('Transfert en devise (Emission)', 'Currency Transfer (Outgoing)')}</span>
                    </div>
                    <Toggle checked={formData.autoriserEmission || false} onChange={(v: boolean) => updateForm('autoriserEmission', v)} />
                  </div>
                  {formData.autoriserEmission && (
                    <div className="space-y-4 pt-2 border-t border-orange-100 dark:border-bcp-orange/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                          label={t('Type de transfert (Liste déroulante)', 'Transfer type (Dropdown)')}
                          required={Boolean(formData.autoriserEmission)}
                          value={formData.typeTransactionEmission || ''}
                          onChange={(e) => updateForm('typeTransactionEmission', e.target.value)}
                          error={formErrors.typeTransactionEmission || undefined}
                          options={[
                            { value: '', label: '-- Choisir --' },
                            { value: 'INTERNATIONAL', label: t('International', 'International') },
                            { value: 'SWIFT', label: 'SWIFT' },
                            { value: 'SEPA', label: 'SEPA' },
                            { value: 'ORDINARY_TRANSFER', label: t('Virement ordinaire', 'Ordinary transfer') },
                            { value: 'OTHER', label: t('Autre', 'Other') },
                          ]}
                        />
                        <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-white dark:bg-dark-bg border border-gray-200/70 dark:border-dark-border">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('Autorisation OC', 'OC Authorization')}
                          </span>
                          <Toggle
                            checked={formData.autorisationOC || false}
                            onChange={(v: boolean) => updateForm('autorisationOC', v)}
                          />
                        </div>
                      </div>
                      <FormInput
                        label={t('Réf. autorisation', 'Authorization ref.')}
                        value={formData.refAutorisationOC || ''}
                        onChange={(e) => updateForm('refAutorisationOC', e.target.value)}
                        placeholder={t('Saisir la référence...', 'Enter reference...')}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SearchableSelect
                          label={t('Devise(s)', 'Currency')}
                          value={formData.devisesEmission || ''}
                          onChange={(v) => updateForm('devisesEmission', v)}
                          options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} - ${c.nameFr}` }))}
                          placeholder="-- Rechercher une devise --"
                        />
                        <FormSelect
                          label={t('Nature cours de change', 'Exchange rate nature')}
                          required={Boolean(formData.autoriserEmission)}
                          value={formData.natureCoursChangeEmission || ''}
                          onChange={(e) => updateForm('natureCoursChangeEmission', e.target.value)}
                          error={formErrors.natureCoursChangeEmission || undefined}
                          options={[
                            { value: '', label: '-- Choisir --' },
                            { value: 'FIXING', label: 'Fixing' },
                            { value: 'NEGOTIATED', label: t('Négocié', 'Negotiated') },
                            { value: 'SPOT', label: 'Spot' },
                          ]}
                        />
                      </div>
                      <FormInput
                        label={t('Plafond Montant avec devise', 'Limit amount with currency')}
                        type="number"
                        min={0}
                        value={formData.plafondMontantDevise || ''}
                        onChange={(e) => { const v = parseFloat(e.target.value); updateForm('plafondMontantDevise', isNaN(v) ? 0 : Math.max(0, v)); }}
                        placeholder={t('5000000 USD', '5000000 USD')}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2 - ABONNEMENT & CONTRÔLES */}
            {activeFormTab === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-bcp-orange to-bcp-brown rounded-full" />
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{t('Frais de dossier et récurrence', 'Setup and recurring fees')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label={t('Frais de mise en place (MAD)', 'Setup fee (MAD)')}
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.setupFee ?? ''}
                    onChange={(e) => { const v = parseFloat(e.target.value); updateForm('setupFee', isNaN(v) ? undefined : Math.max(0, v)); }}
                    placeholder={t('Montant en MAD', 'Amount in MAD')}
                  />
                </div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-bcp-orange to-bcp-brown rounded-full" />
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{t('Abonnement', 'Subscription')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label={t("Frais d'abonnement", 'Subscription Fee')}
                    type="number"
                    min={0}
                    value={formData.subscriptionFee ?? ''}
                    onChange={(e) => { const v = parseFloat(e.target.value); updateForm('subscriptionFee', isNaN(v) ? undefined : Math.max(0, v)); }}
                    placeholder="0"
                  />
                  <FormSelect
                    label={t('Périodicité', 'Periodicity')}
                    required
                    value={formData.subscriptionPeriodicity || ''}
                    onChange={(e) => updateForm('subscriptionPeriodicity', e.target.value)}
                    error={formErrors.subscriptionPeriodicity || undefined}
                    options={[
                      { value: '', label: '-- Choisir --' },
                      { value: 'MONTHLY', label: t('Mensuel', 'Monthly') },
                      { value: 'QUARTERLY', label: t('Trimestriel', 'Quarterly') },
                      { value: 'SEMIANNUAL', label: t('Semestriel', 'Semiannual') },
                      { value: 'ANNUAL', label: t('Annuel', 'Annual') },
                    ]}
                  />
                </div>
                <FormInput
                  label={t('Compte de règlement (IBAN/RIB)', 'Settlement account (IBAN/RIB)')}
                  type="text"
                  value={formData.subscriptionBillingAccount ?? ''}
                  onChange={(e) => updateForm('subscriptionBillingAccount', e.target.value)}
                  error={formErrors.subscriptionBillingAccount || undefined}
                  placeholder="000000000000000000000000"
                  maxLength={24}
                />
                <div className="flex items-center space-x-3 mt-8 mb-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-bcp-orange to-bcp-brown rounded-full" />
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{t('Grille tarifaire par type de transaction', 'Pricing by transaction type')}</h2>
                </div>
                <div className="overflow-x-auto custom-scrollbar rounded-xl border border-gray-200/70 dark:border-dark-border bg-white dark:bg-dark-bg">
                  <table className="w-full min-w-[800px] text-sm">
                    <thead className="table-head">
                      <tr>
                        <th className="table-th px-4">{t("Type d'opération & Statut", 'Operation type & status')}</th>
                        <th className="table-th px-4">{t('Mode de calcul', 'Calculation mode')}</th>
                        <th className="table-th px-4">{t('Valeur (fixe ou %)', 'Value (flat or %)')}</th>
                        <th className="table-th px-4">{t('Plafond Min (MAD)', 'Min cap (MAD)')}</th>
                        <th className="table-th px-4">{t('Plafond Max (MAD)', 'Max cap (MAD)')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                      {FORM_COMMISSION_TYPES.map((item) => {
                        const mode = (formData as any)[item.commTypeKey] || 'FLAT';
                        const isAllowed = !!(formData as any)[item.allowedKey];
                        const isPercentage = mode === 'PERCENTAGE';

                        return (
                          <tr key={item.allowedKey} className="data-row">
                            <td className="p-4 font-semibold">
                              <div className="flex flex-col space-y-1">
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">{t(item.labelFr, item.labelEn)}</span>
                                <span className={`inline-flex items-center w-fit px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full border ${isAllowed
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                    : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-dark-bg-soft dark:text-gray-500 dark:border-dark-border'
                                  }`}>
                                  {isAllowed ? t('Activé', 'Active') : t('Inactif', 'Inactive')}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 w-48">
                              <FormSelect
                                value={mode}
                                onChange={(e) => updateForm(item.commTypeKey, e.target.value)}
                                options={[
                                  { value: 'FLAT', label: t('Forfaitaire (Flat)', 'Flat') },
                                  { value: 'PERCENTAGE', label: t('Pourcentage (%)', 'Percentage (%)') },
                                ]}
                              />
                            </td>
                            <td className="p-4 w-44">
                              <FormInput
                                type="number"
                                min={0}
                                step="0.001"
                                value={(formData as any)[isPercentage ? item.commRateKey : item.commAmountKey] ?? ''}
                                onChange={(e) => {
                                  const key = isPercentage ? item.commRateKey : item.commAmountKey;
                                  const value = parseFloat(e.target.value);
                                  updateForm(key, Number.isNaN(value) ? 0 : Math.max(0, value));
                                }}
                                placeholder={isPercentage ? 'ex: 0.5%' : 'ex: 15 MAD'}
                              />
                            </td>
                            <td className="p-4 w-44">
                              <FormInput
                                type="number"
                                min={0}
                                disabled={!isPercentage}
                                value={isPercentage ? ((formData as any)[item.commMinKey] ?? '') : ''}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  updateForm(item.commMinKey, Number.isNaN(value) ? undefined : Math.max(0, value));
                                }}
                                placeholder={isPercentage ? 'ex: 10 MAD' : '-'}
                              />
                            </td>
                            <td className="p-4 w-44">
                              <FormInput
                                type="number"
                                min={0}
                                disabled={!isPercentage}
                                value={isPercentage ? ((formData as any)[item.commMaxKey] ?? '') : ''}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  updateForm(item.commMaxKey, Number.isNaN(value) ? undefined : Math.max(0, value));
                                }}
                                placeholder={isPercentage ? 'ex: 500 MAD' : '-'}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center space-x-3 mt-8 mb-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-bcp-orange to-bcp-brown rounded-full" />
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{t('Contrôles opérationnels', 'Operational Controls')}</h2>
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
                      { value: 'YES', label: t('Oui', 'Yes') },
                      { value: 'NO', label: t('Non', 'No') },
                    ]}
                  />
                  <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-gray-50/60 dark:bg-dark-bg-soft/50 border border-gray-200/70 dark:border-dark-border">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('Reception du Fichier de synthèse (sort)', 'Receive synthesis file (sort)')}</span>
                    <Toggle checked={formData.fichierSynthese ?? true} onChange={(v: boolean) => updateForm('fichierSynthese', v)} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3 - CONFORMITÉS (Partenaire et Client)
                Each toggle drives one or more stored fields: ON sets them all to true, OFF to false. */}
            {activeFormTab === 3 && showConformite && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-bcp-orange to-bcp-brown rounded-full" />
                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{t("Donneur d'ordre - champs autorisés", 'Payer - allowed fields')}</h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-dim mb-4 ml-4">{t('Activez les champs facultatifs autorisés pour ce partenaire', 'Enable optional allowed fields for this partner')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { keys: ['conformiteDOTypePiece', 'conformiteDONumPiece'], label: t("Pièce d'identité du donneur d'ordre", 'Payer ID document') },
                      { keys: ['conformiteDODateNaissance'], label: t('Date de naissance du donneur d\'ordre', 'Payer birth date') },
                      { keys: ['conformiteDOPaysNaissance', 'conformiteDOAdresse', 'conformiteDOVilleResidence'], label: t('Adresse de résidence du donneur d\'ordre', 'Payer residence address') },
                    ].map(({ keys, label }) => (
                      <div key={keys[0]} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-gray-50/60 dark:bg-dark-bg-soft/50 border border-gray-200/70 dark:border-dark-border hover:border-bcp-orange/30 transition-colors">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                        <Toggle checked={keys.some((k) => !!(formData as any)[k])} onChange={(v: boolean) => keys.forEach((k) => updateForm(k, v))} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-bcp-orange to-bcp-brown rounded-full" />
                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{t('Bénéficiaire - champs autorisés', 'Beneficiary - allowed fields')}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { keys: ['conformiteBenefTypePiece', 'conformiteBenefNumPiece'], label: t("Pièce d'identité du bénéficiaire", 'Beneficiary ID document') },
                      { keys: ['conformiteBenefAdresse', 'conformiteBenefVilleResidence', 'conformiteBenefPaysResidence'], label: t('Adresse de résidence du bénéficiaire', 'Beneficiary residence address') },
                    ].map(({ keys, label }) => (
                      <div key={keys[0]} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-gray-50/60 dark:bg-dark-bg-soft/50 border border-gray-200/70 dark:border-dark-border hover:border-bcp-orange/30 transition-colors">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                        <Toggle checked={keys.some((k) => !!(formData as any)[k])} onChange={(v: boolean) => keys.forEach((k) => updateForm(k, v))} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* NAVIGATION FOOTER */}
          <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-gray-200/70 dark:border-dark-border bg-gray-50/70 dark:bg-dark-bg-soft/30 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              {activeFormTab > 0 && (
                <button
                  onClick={() => setActiveFormTab(activeFormTab - 1)}
                  className="btn-outline w-full sm:w-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('Précédent', 'Previous')}</span>
                </button>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3">
              {viewMode === 'create' && activeFormTab === lastTabIdx && (
                <button
                  onClick={handleSaveDraft}
                  className="btn-outline"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('Enregistrer en brouillon', 'Save as Draft')}</span>
                </button>
              )}
              {activeFormTab < lastTabIdx ? (
                <button
                  onClick={handleNextTab}
                  disabled={accountValidationLoading}
                  aria-busy={accountValidationLoading}
                  className="btn-primary px-7 disabled:cursor-wait"
                >
                  {accountValidationLoading && activeFormTab === 0 ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('Validation...', 'Validating...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('Suivant', 'Next')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="btn-primary px-7"
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
        <div className="page-hero">
          <div className="page-hero-icon"><ClipboardCheck className="w-6 h-6" /></div>
          <h1 className="page-title">
            {t('Certification de la Demande', 'Request Certification')}
          </h1>
          <button onClick={() => { setViewMode('list'); setSelectedPartner(null); setSelectedValidation(null); }} aria-label={t('Fermer', 'Close')} className="absolute top-4 right-4 p-2 rounded-xl text-gray-500 hover:text-bcp-orange hover:bg-white/70 dark:hover:bg-bcp-orange/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Validation info banner */}
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 border-l-4 border-l-amber-500 rounded-xl p-4 flex items-start sm:items-center space-x-4" role="status">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">{t('Demande en attente de validation', 'Request pending validation')}</p>
            <p className="text-sm text-amber-600 dark:text-amber-300">
              {t('Soumise par', 'Submitted by')} <span className="font-bold">{selectedValidation.createdBy}</span> {t('le', 'on')} {new Date(selectedValidation.createdAt).toLocaleDateString('fr-FR')}
              {' - '}{selectedValidation.actionType === 'CREATE' ? t('Création', 'Creation') : t('Modification', 'Modification')}
            </p>
          </div>
        </div>

        <div className="card-base shadow-bcp-medium p-6 sm:p-10 overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bcp-orange via-bcp-orange-light to-bcp-brown" />
          <div className="absolute top-0 right-0 p-10 opacity-[0.04] pointer-events-none" aria-hidden="true">
            <Shield size={200} className="text-bcp-brown" />
          </div>

          <div className="relative z-10 space-y-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${isPartnerActive(selectedPartner.partnerStatus)
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20'
                  }`}>
                  {isPartnerActive(selectedPartner.partnerStatus) ? t('Actif', 'Active') : t('Inactif', 'Inactive')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-3 break-words">{selectedPartner.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium font-mono mt-1">REF: {selectedPartner.partnerReferenceNumber}</p>
              </div>
              <div className="hidden sm:flex w-16 h-16 flex-shrink-0 bg-orange-50 dark:bg-bcp-orange/10 rounded-2xl items-center justify-center border border-bcp-orange/20">
                <FileText size={28} className="text-bcp-orange" />
              </div>
            </div>

            {/* Partner details grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: t('Type', 'Type'), value: displayStoredChoice(selectedPartner.partnerType) },
                { label: t('Pays du Siège', 'Country'), value: countryLabel(selectedPartner.headquarterCountry, lang) },
                { label: t('Classification', 'Classification'), value: displayStoredChoice(selectedPartner.classification) },
                { label: t('Devise Principale', 'Main Currency'), value: selectedPartner.mainCurrency },
                { label: t('Devise Commission', 'Commission Currency'), value: selectedPartner.commissionCurrency },
                { label: t('Comptabilité', 'Accounting type'), value: selectedPartner.accountingType ? t(selectedPartner.accountingType === 'AGGREGATED' ? 'Global' : 'Unitaire', selectedPartner.accountingType === 'AGGREGATED' ? 'Global' : 'Unitary') : '-' },
                { label: t('Nature de Paiement', 'Payment Nature'), value: displayStoredChoice(selectedPartner.paymentNature) },
              ].map((item, i) => (
                <div key={i} className="p-4 sm:p-5 bg-gray-50/60 dark:bg-dark-bg-soft/50 rounded-xl border border-gray-200/70 dark:border-dark-border">
                  <p className="section-label mb-1.5">{item.label}</p>
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-200 break-words">{item.value || '-'}</p>
                </div>
              ))}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-gradient-to-r from-orange-50 to-brown-50/60 dark:from-bcp-orange/5 dark:to-bcp-brown/10 rounded-xl border border-bcp-orange/20">
                <div>
                  <p className="text-[11px] font-semibold text-bcp-orange uppercase tracking-[0.12em] mb-1.5">{t('Numéro de Compte', 'Account Number')}</p>
                  <p className="text-lg sm:text-xl font-bold text-bcp-brown dark:text-white font-mono tabular-nums tracking-wide break-all">{selectedPartner.accountNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-bcp-orange uppercase tracking-[0.12em] mb-1.5">{t('RIB', 'RIB')}</p>
                  <p className="text-lg sm:text-xl font-bold text-bcp-brown dark:text-white font-mono tabular-nums tracking-wide break-all">{selectedPartner.rib || '-'}</p>
                </div>
              </div>
            </div>

            {/* Transfer permissions summary */}
            <div>
              <h3 className="section-label mb-4">{t('Transferts Autorisés', 'Allowed Transfers')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TRANSFER_TYPES.map((tt) => {
                  const enabled = !!(selectedPartner as any)[tt.allowedKey];
                  const limit = (selectedPartner as any)[tt.limitKey] || 0;
                  return (
                    <div key={tt.allowedKey} className={`p-4 rounded-xl border ${enabled ? 'bg-emerald-50/60 border-emerald-200/70 dark:bg-emerald-500/5 dark:border-emerald-500/20' : 'bg-gray-50/60 border-gray-200/70 dark:bg-dark-bg-soft/30 dark:border-dark-border'}`}>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t(tt.labelFr, tt.labelEn)}</p>
                      <p className={`text-sm font-semibold tabular-nums mt-1 ${enabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {enabled ? `${t('Activé', 'Enabled')} - ${limit.toLocaleString()} MAD` : t('Désactivé', 'Disabled')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing & Commissions Summary */}
            {renderPricingSummary(selectedPartner)}

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-8 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => { setViewMode('list'); setSelectedPartner(null); setSelectedValidation(null); }}
                className="btn-ghost sm:mr-auto"
              >
                {t('Retour', 'Back')}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="btn-danger px-6"
              >
                <X size={18} /> <span>{t('Rejeter', 'Reject')}</span>
              </button>
              <button
                onClick={() => setShowValidateConfirm(true)}
                className="btn-success px-6"
              >
                <Check size={18} /> <span>{t('Valider', 'Validate')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Validate confirmation (no reason needed) */}
        <ConfirmDialog
          open={showValidateConfirm}
          title={t('Confirmer la validation', 'Confirm validation')}
          description={t(
            `Voulez-vous vraiment valider ${selectedValidation.partnerName || selectedPartner?.name || 'ce dossier'} ?`,
            `Do you really want to validate ${selectedValidation.partnerName || selectedPartner?.name || 'this file'}?`
          )}
          confirmLabel={t('Confirmer la validation', 'Confirm validation')}
          cancelLabel={t('Annuler', 'Cancel')}
          busy={validating}
          tone="accent"
          onCancel={() => setShowValidateConfirm(false)}
          onConfirm={() => handleValidate(selectedValidation.id)}
        />

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="modal-backdrop" onClick={() => setShowRejectModal(false)}>
            <div className="modal-panel max-w-lg animate-slideUp" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <div className="h-1 bg-red-500" />
              <div className="p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('Motif de Rejet', 'Rejection Reason')}</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('Veuillez indiquer le motif du rejet...', 'Please provide the rejection reason...')}
                className="premium-input h-32 resize-none focus:!border-red-500 focus:!ring-red-500/15"
              />
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  className="btn-outline"
                >
                  {t('Annuler', 'Cancel')}
                </button>
                <button
                  onClick={() => handleReject(selectedValidation.id)}
                  className="btn-danger"
                >
                  {t('Confirmer le Rejet', 'Confirm Rejection')}
                </button>
              </div>
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
        <div className="page-hero">
          <div className="page-hero-icon"><Building2 className="w-6 h-6" /></div>
          <h1 className="page-title">
            {t('Fiche Partenaire', 'Partner Intelligence')}
          </h1>
          <button onClick={() => { setViewMode('list'); setSelectedPartner(null); }} aria-label={t('Fermer', 'Close')} className="absolute top-4 right-4 p-2 rounded-xl text-gray-500 hover:text-bcp-orange hover:bg-white/70 dark:hover:bg-bcp-orange/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="card-base shadow-bcp-medium p-6 sm:p-10 overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bcp-orange via-bcp-orange-light to-bcp-brown" />
          <div className="absolute top-0 right-0 p-10 opacity-[0.04] pointer-events-none" aria-hidden="true">
            <Shield size={200} className="text-bcp-brown" />
          </div>

          <div className="relative z-10 space-y-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${isPartnerActive(selectedPartner.partnerStatus)
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20'
                  }`}>
                  {isPartnerActive(selectedPartner.partnerStatus) ? t('Actif', 'Active') : t('Inactif', 'Inactive')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-3 break-words">{selectedPartner.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium font-mono mt-1">REF: {selectedPartner.partnerReferenceNumber}</p>
              </div>
              <div className="hidden sm:flex w-16 h-16 flex-shrink-0 bg-orange-50 dark:bg-bcp-orange/10 rounded-2xl items-center justify-center border border-bcp-orange/20">
                <FileText size={28} className="text-bcp-orange" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: t('Type de Partenaire', 'Partner Type'), value: displayStoredChoice(selectedPartner.partnerType) },
                { label: t('Pays du Siège', 'Country'), value: countryLabel(selectedPartner.headquarterCountry, lang) },
                { label: t('Classification', 'Classification'), value: displayStoredChoice(selectedPartner.classification) },
                { label: t('Devise Principale', 'Main Currency'), value: selectedPartner.mainCurrency },
                { label: t('Devise de Commission', 'Commission Currency'), value: selectedPartner.commissionCurrency },
                { label: t('Comptabilité', 'Accounting type'), value: selectedPartner.accountingType ? t(selectedPartner.accountingType === 'AGGREGATED' ? 'Global' : 'Unitaire', selectedPartner.accountingType === 'AGGREGATED' ? 'Global' : 'Unitary') : '-' },
                { label: t('Nature de Paiement', 'Payment Nature'), value: displayStoredChoice(selectedPartner.paymentNature) },
                { label: t('Canal', 'Canal'), value: selectedPartner.canal },
                { label: t('Mode de Frais', 'Fee Mode'), value: displayStoredChoice(selectedPartner.feeMode) },
                { label: t('Facturation Mensuelle', 'Monthly Billing'), value: selectedPartner.monthlyBilling ? t('Oui', 'Yes') : t('Non', 'No') },
              ].map((item, i) => (
                <div key={i} className="p-4 sm:p-5 bg-gray-50/60 dark:bg-dark-bg-soft/50 rounded-xl border border-gray-200/70 dark:border-dark-border">
                  <p className="section-label mb-1.5">{item.label}</p>
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-200 break-words">{item.value || '-'}</p>
                </div>
              ))}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-gradient-to-r from-orange-50 to-brown-50/60 dark:from-bcp-orange/5 dark:to-bcp-brown/10 rounded-xl border border-bcp-orange/20">
                <div>
                  <p className="text-[11px] font-semibold text-bcp-orange uppercase tracking-[0.12em] mb-1.5">{t('Numéro de Compte', 'Account Number')}</p>
                  <p className="text-lg sm:text-xl font-bold text-bcp-brown dark:text-white font-mono tabular-nums tracking-wide break-all">{selectedPartner.accountNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-bcp-orange uppercase tracking-[0.12em] mb-1.5">{t('RIB', 'RIB')}</p>
                  <p className="text-lg sm:text-xl font-bold text-bcp-brown dark:text-white font-mono tabular-nums tracking-wide break-all">{selectedPartner.rib || '-'}</p>
                </div>
              </div>
            </div>

            {/* Transfer permissions summary */}
            <div>
              <h3 className="section-label mb-4">{t('Transferts Autorisés', 'Allowed Transfers')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TRANSFER_TYPES.map((tt) => {
                  const enabled = !!(selectedPartner as any)[tt.allowedKey];
                  const limit = (selectedPartner as any)[tt.limitKey] || 0;
                  return (
                    <div key={tt.allowedKey} className={`p-4 rounded-xl border ${enabled ? 'bg-emerald-50/60 border-emerald-200/70 dark:bg-emerald-500/5 dark:border-emerald-500/20' : 'bg-gray-50/60 border-gray-200/70 dark:bg-dark-bg-soft/30 dark:border-dark-border'}`}>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t(tt.labelFr, tt.labelEn)}</p>
                      <p className={`text-sm font-semibold tabular-nums mt-1 ${enabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {enabled ? `${t('Activé', 'Enabled')} - ${limit.toLocaleString()} MAD` : t('Désactivé', 'Disabled')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* VALIDATION HISTORY TIMELINE */}
            {validationHistory.length > 0 && (
              <div>
                <h3 className="section-label mb-6">{t('Historique Workflow', 'Workflow History')}</h3>
                <div className="relative">
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-gray-200 to-gray-100 dark:from-dark-border dark:to-dark-border" />
                  <div className="space-y-5">
                    {validationHistory.map((record, i) => {
                      const isLatest = i === 0;
                      const dot = record.workflowStatus === 'VALIDATED' ? 'bg-emerald-500'
                        : record.workflowStatus === 'REJECTED' ? 'bg-red-500'
                          : record.workflowStatus === 'PENDING' ? 'bg-amber-500'
                            : 'bg-bcp-brown-light';
                      const badge = record.workflowStatus === 'VALIDATED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : record.workflowStatus === 'REJECTED' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : record.workflowStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                            : 'bg-brown-50 text-bcp-brown dark:bg-bcp-brown/20 dark:text-brown-200';
                      const statusLabel = record.workflowStatus === 'VALIDATED' ? t('Validé', 'Validated')
                        : record.workflowStatus === 'REJECTED' ? t('Rejeté', 'Rejected')
                          : record.workflowStatus === 'PENDING' ? t('En attente', 'Pending')
                            : t('Brouillon', 'Draft');
                      const actionLabel = record.actionType === 'CREATE' ? t('Création', 'Creation') : t('Modification', 'Modification');
                      return (
                        <div key={record.id} className="flex gap-5 pl-2">
                          <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ring-4 ring-white dark:ring-dark-bg-card ${dot}`}>
                            {record.workflowStatus === 'VALIDATED' && <Check className="w-3 h-3 text-white" />}
                            {record.workflowStatus === 'REJECTED' && <X className="w-3 h-3 text-white" />}
                            {record.workflowStatus === 'PENDING' && <AlertTriangle className="w-3 h-3 text-white" />}
                            {(record.workflowStatus === 'DRAFT' || !record.workflowStatus) && <FileText className="w-3 h-3 text-white" />}
                          </div>
                          <div className={`flex-1 min-w-0 p-4 rounded-xl border ${isLatest ? 'border-bcp-orange/30 bg-orange-50/40 dark:bg-bcp-orange/5' : 'border-gray-200/70 dark:border-dark-border bg-gray-50/60 dark:bg-dark-bg-soft/30'}`}>
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${badge}`}>{statusLabel}</span>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{actionLabel}</span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">{new Date(record.createdAt).toLocaleString('fr-FR')}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-semibold">{t('Soumis par', 'By')}: </span>
                              <span className="font-mono">{record.createdBy || '-'}</span>
                            </p>
                            {record.validatedBy && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                                <span className="font-semibold">{t('Traité par', 'Processed by')}: </span>
                                <span className="font-mono">{record.validatedBy}</span>
                                {record.validatedAt && <span className="text-gray-400 ml-2 text-xs">({new Date(record.validatedAt).toLocaleDateString('fr-FR')})</span>}
                              </p>
                            )}
                            {record.rejectionReason && (
                              <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200/70 dark:border-red-500/20">
                                <p className="text-xs font-medium text-red-700 dark:text-red-400">{t('Motif', 'Reason')}: {record.rejectionReason}</p>
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

            <div className="flex gap-3 justify-end pt-8 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => { setViewMode('list'); setSelectedPartner(null); }}
                className="btn-outline"
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
