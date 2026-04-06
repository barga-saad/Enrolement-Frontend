/**
 * Partners Management Page
 * Complete partner enrollment system with CRUD operations
 */

import { useState, useEffect } from 'react';
import { Plus, Eye, Check, X, Edit2, Search } from 'lucide-react';
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

  // Check if user is admin
  const isAdmin = user?.roleNames?.some(
    (role) => role === 'PROFIL_ADMIN_CENTRAL'
  ) || false;

  // Check if user is validator
  const isValidator = user?.roleNames?.some(
    (role) => role === 'PROFIL_VALIDATEUR'
  ) || false;

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

  // Fetch partners on mount
  useEffect(() => {
    fetchPartners();
  }, []);

  // Load partners from API
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPartners();
      // API returns wrapped response
      const data = response.data.data || response.data;
      setPartners(Array.isArray(data) ? data : []);
      toast.success('Partners loaded successfully');
    } catch (error: any) {
      console.error('Error loading partners:', error);
      toast.error('Failed to load partners');
      // Use mock data as fallback
      setPartners([
        {
          id: 1,
          code: 'JESAINTL',
          name: 'JESAINTL',
          type: 'Enterprise',
          country: 'Morocco',
          classification: 'Large',
          accountNumber: 'MA00000000000000000000001',
          status: 'pending',
          createdAt: '2024-03-11',
        },
        {
          id: 2,
          code: 'JESANURG',
          name: 'JESANURG',
          type: 'Enterprise',
          country: 'Morocco',
          classification: 'Medium',
          accountNumber: 'MA00000000000000000000002',
          status: 'validation',
          createdAt: '2024-03-10',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Validation rules
  const validationRules = {
    name: [
      validators.required('Partner name'),
      validators.minLength(3),
    ],
    accountNumber: [
      validators.required('Account number'),
      validators.bankAccount(),
    ],
    country: [validators.required('Country')],
    classification: [validators.required('Classification')],
  };

  // Filter partners by search term and role
  const filteredPartners = partners.filter((p) => {
    // Search filter
    const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Role-based visibility
    // Admins see all partners
    if (isAdmin) return true;

    // Validators see partners awaiting validation
    if (isValidator) {
      return p.status === 'pending' || p.status === 'validation';
    }

    // Others see all partners but can't create/edit their own
    return true;
  });

  // Validate form
  const validateFormData = () => {
    const errors = validateForm(formData, validationRules as any);
    setFormErrors(errors);
    return !hasErrors(errors);
  };

  // Handle form submission
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
      const errorMsg = error.response?.data?.message || 'Failed to create partner';
      toast.error(errorMsg);
      console.error('Error saving partner:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ type: 'Enterprise', country: 'Morocco', status: 'active' });
    setFormErrors({});
    setViewMode('list');
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    validation: 'bg-orange-100 text-orange-800',
  };

  const columns: TableColumn<Partner>[] = [
    { key: 'code', header: 'ID Client', sortable: true },
    { key: 'name', header: 'Nom / Partenaire', sortable: true },
    { key: 'createdAt', header: 'Date Saisie', sortable: true },
    {
      key: 'status',
      header: 'Statut',
      render: (status: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status as keyof typeof statusColors]}`}>
          {status === 'validation' ? 'En attente' : status === 'pending' ? 'En attente' : status}
        </span>
      ),
    },
  ];

  // --- LIST VIEW ---
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Partenaires</h1>
            {!isAdmin && (
              <p className="text-sm text-gray-600 mt-1">
                {isValidator ? 'Vous pouvez valider les partenaires en attente' : 'Vous pouvez consulter les partenaires'}
              </p>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setViewMode('create');
                setSelectedPartner(null);
              }}
              className="flex items-center gap-2 bg-cyan-700 text-white px-6 py-2 rounded-full font-semibold hover:bg-cyan-800"
            >
              <Plus size={20} /> Nouveau Partenaire
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par ID Client ou nom..."
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
            data={filteredPartners}
            keyField="id"
            loading={loading}
            emptyMessage={loading ? 'Loading partners...' : 'No partners found'}
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedPartner(row);
                    setViewMode('validate');
                  }}
                  className="flex items-center gap-1 bg-cyan-600 text-white px-4 py-1 rounded text-sm hover:bg-cyan-700"
                >
                  <Check size={16} /> À valider
                </button>
                <button
                  onClick={() => {
                    setSelectedPartner(row);
                    setViewMode('consult');
                  }}
                  className="flex items-center gap-1 bg-purple-600 text-white px-4 py-1 rounded text-sm hover:bg-purple-700"
                >
                  <Eye size={16} /> À consulter
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
      <div className="space-y-6 max-w-6xl">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {viewMode === 'create' ? 'Saisie Nouveau Partenaire/Client' : 'Modification Partenaire/Client'}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* BLOC A: IDENTITY */}
          <FormSection title="Informations générales">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormBlock title="Bloc A — Identité partenaire">
                <FormInput
                  label="Code partenaire"
                  value={formData.code || 'Auto-généré'}
                  disabled
                  readOnly
                />
                <FormInput
                  label="Nom du partenaire"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={formErrors.name || undefined}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    label="Type"
                    required
                    value={formData.type || 'Enterprise'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    options={[
                      { value: 'Enterprise', label: 'Enterprise' },
                      { value: 'Individual', label: 'Individual' },
                      { value: 'SME', label: 'SME' },
                    ]}
                  />
                  <FormSelect
                    label="Statut"
                    required
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                    ]}
                  />
                </div>
              </FormBlock>

              <FormBlock title="Bloc B — Informations légales">
                <FormSelect
                  label="Pays du siège social"
                  required
                  value={formData.country || 'Morocco'}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  error={formErrors.country || undefined}
                  options={[
                    { value: 'Morocco', label: 'Morocco' },
                    { value: 'France', label: 'France' },
                    { value: 'Tunisia', label: 'Tunisia' },
                  ]}
                />
                <FormSelect
                  label="Classification du partenaire"
                  required
                  value={formData.classification || ''}
                  onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                  error={formErrors.classification || undefined}
                  options={[
                    { value: 'Large', label: 'Large' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Small', label: 'Small' },
                  ]}
                />
              </FormBlock>
            </div>
          </FormSection>

          {/* BANK COORDINATES */}
          <FormSection title="Coordonnées bancaires & Transactions">
            <FormInput
              label="Numéro de compte principal"
              required
              placeholder="XX XXX XXXXXXXXXXXX XXXXX X XX"
              value={formData.accountNumber || ''}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              error={formErrors.accountNumber || undefined}
            />

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-3 text-left font-semibold">Type de transaction</th>
                    <th className="p-3 text-center font-semibold">Autorisé</th>
                    <th className="p-3 text-right font-semibold">Plafond (MAD)</th>
                    <th className="p-3 text-left font-semibold">Détails optionnel</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className={`border-b ${!tx.enabled ? 'opacity-50' : ''}`}>
                      <td className="p-3">{tx.type}</td>
                      <td className="p-3 text-center">
                        <Toggle
                          checked={tx.enabled}
                          onChange={(checked) => {
                            const updated = [...transactions];
                            updated[idx].enabled = checked;
                            setTransactions(updated);
                          }}
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={tx.limit}
                          onChange={(e) => {
                            const updated = [...transactions];
                            updated[idx].limit = parseFloat(e.target.value);
                            setTransactions(updated);
                          }}
                          disabled={!tx.enabled}
                          className={`w-24 text-right border rounded px-2 py-1 ${!tx.enabled ? 'bg-gray-100 text-gray-500' : ''}`}
                        />
                      </td>
                      <td className="p-3">---</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormSection>

          {/* CURRENCY TRANSFERS */}
          <FormSection title="Transferts en devise">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-700">1. Réception</h3>
                <FormToggleRow label="Autoriser la réception" checked={true} onChange={() => {}} />
                <FormInput label="Devise(s)" placeholder="EUR, USD..." />
                <FormInput label="Plafond" placeholder="10,000.00 USD" />
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-700">2. Émission</h3>
                <FormToggleRow label="Autoriser l'émission" checked={false} onChange={() => {}} />
                <FormSelect
                  label="Type de transfert"
                  options={[
                    { value: 'international', label: 'International' },
                    { value: 'local', label: 'Local' },
                  ]}
                />
              </div>
            </div>
          </FormSection>

          {/* COMPLIANCE */}
          <FormSection title="Conformité">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormBlock title="Bloc A - Donneur d'ordre" bgColor="gray">
                <FormToggleRow label="Type pièce d'identité" checked={compliance.donnerOrdre.type} onChange={() => {}} />
                <FormToggleRow label="N° de pièce d'identité" checked={compliance.donnerOrdre.number} onChange={() => {}} />
                <FormToggleRow label="Ville de résidence" checked={compliance.donnerOrdre.city} onChange={() => {}} />
              </FormBlock>

              <FormBlock title="Bloc B - Bénéficiaire" bgColor="gray">
                <FormToggleRow label="Type pièce d'identité" checked={compliance.beneficiaire.type} onChange={() => {}} />
                <FormToggleRow label="N° de pièce d'identité" checked={compliance.beneficiaire.number} onChange={() => {}} />
                <FormToggleRow label="Adresse complète" checked={compliance.beneficiaire.address} onChange={() => {}} />
              </FormBlock>
            </div>
          </FormSection>

          {/* ACTIONS */}
          <div className="flex justify-between items-end pt-6 border-t">
            <button
              onClick={resetForm}
              className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 font-semibold"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-2 bg-cyan-700 text-white rounded-full font-bold hover:bg-cyan-800"
            >
              💾 Sauvegarder
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VALIDATION VIEW ---
  if (viewMode === 'validate' && selectedPartner) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Validation des Demandes</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Partenaire: {selectedPartner.name} ({selectedPartner.code})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-semibold">{selectedPartner.type}</p>
              </div>
              <div>
                <p className="text-gray-600">Pays</p>
                <p className="font-semibold">{selectedPartner.country}</p>
              </div>
              <div>
                <p className="text-gray-600">Compte</p>
                <p className="font-semibold font-mono text-xs">{selectedPartner.accountNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Créé le</p>
                <p className="font-semibold">{selectedPartner.createdAt}</p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            Les champs en lecture seule (grisés) ne peuvent pas être modifiés lors de la validation.
          </p>

          <div className="flex gap-4 justify-end">
            <button
              onClick={() => setViewMode('list')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
            >
              Retour
            </button>
            <button className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
              <Check size={20} /> Valider
            </button>
            <button className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
              <X size={20} /> Rejeter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CONSULTATION VIEW ---
  if (viewMode === 'consult' && selectedPartner) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Consultation Partenaire/Client</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b">
            <div>
              <p className="text-gray-600 text-sm">Nom</p>
              <p className="font-semibold text-lg">{selectedPartner.name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Code</p>
              <p className="font-semibold text-lg">{selectedPartner.code}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Type</p>
              <p className="font-semibold text-lg">{selectedPartner.type}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Statut</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[selectedPartner.status as keyof typeof statusColors]}`}>
                {selectedPartner.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2">Compte Bancaire</p>
              <p className="font-mono text-sm font-semibold break-all">{selectedPartner.accountNumber}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2">Date de création</p>
              <p className="font-semibold">{selectedPartner.createdAt}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t">
            <button
              onClick={() => setViewMode('list')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
            >
              Retour
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-cyan-700 text-white rounded-lg font-semibold hover:bg-cyan-800">
              <Edit2 size={18} /> Modifier
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PartnersPage;
