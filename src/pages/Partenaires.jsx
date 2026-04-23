import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Partenaires.css";
import logo from "../assets/Logo-BCP3D.webp";

const navItems = [
  { label: "Dashboard",   path: "/dashboard",
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>) },
  { label: "Partenaires", path: "/partenaires",
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>) },
  { label: "Rapports",    path: "/rapports",
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>) },
];

const emptyForm = {
  codePartenaire: "", nomPartenaire: "", typePartenaire: "", 
  statutPartenaire: "", paysSiegeSocial: "", classificationPartenaire: "",
  numeroCompteBanque: "", typeTransaction: "", devisePrincipale: "",
  natureTauxChange: "", controlProvision: "", naturePaiement: "",
};

export default function Partenaires() {
  const navigate = useNavigate();
  const location = useLocation();

  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [viewMode, setViewMode]       = useState("table");
  const [search, setSearch]           = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");

  const [showForm, setShowForm]       = useState(false);
  const [showDetail, setShowDetail]   = useState(false);
  const [showDelete, setShowDelete]   = useState(false);
  const [selectedP, setSelectedP]     = useState(null);
  const [isEditing, setIsEditing]     = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  const fetchPartenaires = () => {
    setLoading(true);
    fetch("http://localhost:8080/api/partenaires", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => { setPartenaires(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPartenaires(); }, []);

  const filtered = partenaires.filter((p) => {
    const matchSearch =
      p.nomPartenaire?.toLowerCase().includes(search.toLowerCase()) ||
      p.codePartenaire?.toLowerCase().includes(search.toLowerCase()) ||
      p.typePartenaire?.toLowerCase().includes(search.toLowerCase()) ||
      p.paysSiegeSocial?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "Tous" || p.statutPartenaire === filterStatut;
    return matchSearch && matchStatut;
  });

  const openAdd    = () => { setIsEditing(false); setForm(emptyForm); setShowForm(true); };
  const openEdit   = (p) => { setIsEditing(true); setForm({ ...p }); setSelectedP(p); setShowForm(true); };
  const openDetail = (p) => { setSelectedP(p); setShowDetail(true); };
  const openDelete = (p) => { setSelectedP(p); setShowDelete(true); };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    const url    = isEditing ? `http://localhost:8080/api/partenaires/${selectedP.id}` : "http://localhost:8080/api/partenaires";
    const method = isEditing ? "PUT" : "POST";
    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(form),
    })
      .then(() => { setShowForm(false); fetchPartenaires(); })
      .catch(console.error)
      .finally(() => setFormLoading(false));
  };

  const handleDelete = () => {
    fetch(`http://localhost:8080/api/partenaires/${selectedP.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    })
      .then(() => { setShowDelete(false); fetchPartenaires(); })
      .catch(console.error);
  };

  return (
    <div className="pt-root">

      {/* SIDEBAR */}
      <aside className="pt-sidebar">
        <div className="pt-sidebar-logo">
          <img src={logo} alt="BCP" className="pt-logo-img" />
        </div>
        <nav className="pt-nav">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path} className={`pt-nav-item ${active ? "active" : ""}`} onClick={() => navigate(item.path)}>
                <span className="pt-nav-icon">{item.icon}</span>
                <span className="pt-nav-label">{item.label}</span>
                {active && <span className="pt-nav-indicator" />}
              </button>
            );
          })}
        </nav>
        <div className="pt-sidebar-footer">
          <div className="pt-user-info">
            <div className="pt-user-avatar">AD</div>
            <div className="pt-user-text">
              <span className="pt-user-name">Admin BCP</span>
              <span className="pt-user-role">Administrateur</span>
            </div>
          </div>
          <button className="pt-logout-btn" onClick={() => navigate("/")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="pt-main">

        {/* TOPBAR */}
        <header className="pt-topbar">
          <div className="pt-topbar-left">
            <h1 className="pt-page-title">Partenaires</h1>
            <span className="pt-breadcrumb">Accueil / Partenaires</span>
          </div>
          <div className="pt-topbar-right">
            <div className="pt-search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pt-search-input" />
            </div>
            <select className="pt-filter-select" value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
              <option value="Tous">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
            </select>
            <div className="pt-view-toggle">
              <button className={`pt-view-btn ${viewMode === "table" ? "active" : ""}`} onClick={() => setViewMode("table")} title="Tableau">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
              <button className={`pt-view-btn ${viewMode === "cards" ? "active" : ""}`} onClick={() => setViewMode("cards")} title="Cartes">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </button>
            </div>
            <button className="pt-add-btn" onClick={openAdd}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nouveau partenaire
            </button>
          </div>
        </header>

        {/* COMPTEUR */}
        <div className="pt-count-bar">
          <span className="pt-count-text">
            {loading ? "Chargement..." : `${filtered.length} partenaire(s) trouvé(s)`}
          </span>
          <div className="pt-statut-pills">
            {["Tous", "ACTIF", "INACTIF"].map((s) => (
              <button key={s} className={`pt-pill ${filterStatut === s ? "active" : ""}`} onClick={() => setFilterStatut(s)}>
                {s === "Tous" ? "Tous" : s === "ACTIF" ? "Actif" : "Inactif"}
              </button>
            ))}
          </div>
        </div>

        {/* VUE TABLEAU */}
        {viewMode === "table" && (
          <div className="pt-table-wrapper">
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Code</th><th>Nom</th><th>Type</th><th>Statut</th>
                  <th>Pays</th><th>Classification</th><th>Devise</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="pt-empty"><span className="pt-spinner"/>Chargement...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="pt-empty">Aucun partenaire trouvé</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="pt-row">
                    <td><span className="pt-code-badge">{p.codePartenaire}</span></td>
                    <td><span className="pt-nom">{p.nomPartenaire}</span></td>
                    <td><span className="pt-tag">{p.typePartenaire}</span></td>
                    <td>
                      <span className={`pt-statut ${p.statutPartenaire === "ACTIF" ? "actif" : "inactif"}`}>
                        <span className="pt-dot"/>
                        {p.statutPartenaire === "ACTIF" ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="pt-gray">{p.paysSiegeSocial}</td>
                    <td><span className="pt-tag">{p.classificationPartenaire}</span></td>
                    <td className="pt-gray">{p.devisePrincipale}</td>
                    <td>
                      <div className="pt-actions">
                        <button className="pt-action-btn view"   onClick={() => openDetail(p)} title="Voir">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button className="pt-action-btn edit"   onClick={() => openEdit(p)} title="Modifier">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="pt-action-btn delete" onClick={() => openDelete(p)} title="Supprimer">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VUE CARTES */}
        {viewMode === "cards" && (
          <div className="pt-cards-grid">
            {loading ? (
              <div className="pt-empty-full"><span className="pt-spinner"/>Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="pt-empty-full">Aucun partenaire trouvé</div>
            ) : filtered.map((p) => (
              <div key={p.id} className="pt-card">
                <div className="pt-card-header">
                  <div className="pt-card-avatar">{p.nomPartenaire?.charAt(0).toUpperCase()}</div>
                  <div className="pt-card-title">
                    <span className="pt-card-nom">{p.nomPartenaire}</span>
                    <span className="pt-code-badge">{p.codePartenaire}</span>
                  </div>
                  <span className={`pt-statut ${p.statutPartenaire === "ACTIF" ? "actif" : "inactif"}`}>
                    <span className="pt-dot"/>
                    {p.statutPartenaire === "ACTIF" ? "Actif" : "Inactif"}
                  </span>
                </div>
                <div className="pt-card-body">
                  <div className="pt-card-row"><span className="pt-card-key">Type</span><span className="pt-card-val">{p.typePartenaire}</span></div>
                  <div className="pt-card-row"><span className="pt-card-key">Pays</span><span className="pt-card-val">{p.paysSiegeSocial}</span></div>
                  <div className="pt-card-row"><span className="pt-card-key">Classification</span><span className="pt-card-val">{p.classificationPartenaire}</span></div>
                  <div className="pt-card-row"><span className="pt-card-key">Devise</span><span className="pt-card-val">{p.devisePrincipale}</span></div>
                  <div className="pt-card-row"><span className="pt-card-key">Taux change</span><span className="pt-card-val">{p.natureTauxChange}</span></div>
                  <div className="pt-card-row"><span className="pt-card-key">Paiement</span><span className="pt-card-val">{p.naturePaiement}</span></div>
                </div>
                <div className="pt-card-footer">
                  <button className="pt-action-btn view"   onClick={() => openDetail(p)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button className="pt-action-btn edit"   onClick={() => openEdit(p)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="pt-action-btn delete" onClick={() => openDelete(p)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL — AJOUTER / MODIFIER */}
      {showForm && (
        <div className="pt-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pt-modal-header">
              <h2>{isEditing ? "Modifier le partenaire" : "Nouveau partenaire"}</h2>
              <button className="pt-modal-close" onClick={() => setShowForm(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="pt-form">
              <div className="pt-form-grid">

                {/* Champs texte libres */}
                {[
                  { name: "codePartenaire",     label: "Code Partenaire"       },
                  { name: "nomPartenaire",       label: "Nom Partenaire"        },
                  { name: "paysSiegeSocial",     label: "Pays Siège Social"     },
                  { name: "numeroCompteBanque",  label: "N° Compte Banque"      },
                  { name: "natureTauxChange",    label: "Nature Taux de Change" },
                  { name: "controlProvision",    label: "Control Provision"     },
                  { name: "naturePaiement",      label: "Nature de Paiement"    },
                ].map((field) => (
                  <div key={field.name} className="pt-field">
                    <label className="pt-field-label">{field.label}</label>
                    <input
                      type="text"
                      name={field.name}
                      value={form[field.name] || ""}
                      onChange={handleFormChange}
                      className="pt-field-input"
                      placeholder={field.label}
                      required
                    />
                  </div>
                ))}

                {/* Statut Partenaire */}
                <div className="pt-field">
                  <label className="pt-field-label">Statut Partenaire</label>
                  <select name="statutPartenaire" value={form.statutPartenaire} onChange={handleFormChange} className="pt-field-input" required>
                    <option value="">-- Sélectionner --</option>
                    <option value="ACTIF">Actif</option>
                    <option value="INACTIF">Inactif</option>
                  </select>
                </div>

                {/* Type Partenaire */}
                <div className="pt-field">
                  <label className="pt-field-label">Type Partenaire</label>
                  <select name="typePartenaire" value={form.typePartenaire} onChange={handleFormChange} className="pt-field-input" required>
                    <option value="">-- Sélectionner --</option>
                    <option value="CLIENT">Client</option>
                    <option value="PARTENAIRE">Partenaire</option>
                  </select>
                </div>

                {/* Classification */}
                <div className="pt-field">
                  <label className="pt-field-label">Classification</label>
                  <select name="classificationPartenaire" value={form.classificationPartenaire} onChange={handleFormChange} className="pt-field-input" required>
                    <option value="">-- Sélectionner --</option>
                    <option value="LOCAL">Local</option>
                    <option value="INTERNATIONAL">International</option>
                  </select>
                </div>

                {/* Devise Principale */}
                <div className="pt-field">
                  <label className="pt-field-label">Devise Principale</label>
                  <select name="devisePrincipale" value={form.devisePrincipale} onChange={handleFormChange} className="pt-field-input" required>
                    <option value="">-- Sélectionner --</option>
                    <option value="MAD">MAD — Dirham Marocain</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="USD">USD — Dollar Américain</option>
                    <option value="MAC">MAC</option>
                  </select>
                </div>

                {/* Type Transaction — pleine largeur */}
                <div className="pt-field pt-field-full">
                  <label className="pt-field-label">Type de Transaction</label>
                  <select name="typeTransaction" value={form.typeTransaction} onChange={handleFormChange} className="pt-field-input" required>
                    <option value="">-- Sélectionner --</option>
                    <option value="INSTANTANE_INTRA_BP">Instantané Intra BP</option>
                    <option value="INSTANTANE_CONFRERE">Instantané Confrère</option>
                    <option value="SRBM_CONFRERE">SRBM Confrère</option>
                    <option value="ORDINAIRE_CONFRERE">Ordinaire Confrère</option>
                    <option value="MISE_A_DISPOSITION">Mise à Disposition</option>
                    <option value="TRANSFERT_WALLET">Transfert Wallet</option>
                    <option value="TRANSFERT_DEVISE_RECEPTION">Transfert en Devise (Réception)</option>
                    <option value="TRANSFERT_DEVISE_EMISSION">Transfert en Devise (Émission)</option>
                  </select>
                </div>

              </div>
              <div className="pt-form-actions">
                <button type="button" className="pt-btn-cancel" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="pt-btn-submit" disabled={formLoading}>
                  {formLoading ? <span className="pt-spinner"/> : isEditing ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL — DÉTAIL */}
      {showDetail && selectedP && (
        <div className="pt-modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="pt-modal pt-modal-detail" onClick={(e) => e.stopPropagation()}>
            <div className="pt-modal-header">
              <h2>Détail du partenaire</h2>
              <button className="pt-modal-close" onClick={() => setShowDetail(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="pt-detail-hero">
              <div className="pt-detail-avatar">{selectedP.nomPartenaire?.charAt(0).toUpperCase()}</div>
              <div>
                <h3 className="pt-detail-nom">{selectedP.nomPartenaire}</h3>
                <span className="pt-code-badge">{selectedP.codePartenaire}</span>
                <span className={`pt-statut ${selectedP.statutPartenaire === "ACTIF" ? "actif" : "inactif"}`} style={{ marginLeft: "0.5rem" }}>
                  <span className="pt-dot"/>
                  {selectedP.statutPartenaire === "ACTIF" ? "Actif" : "Inactif"}
                </span>
              </div>
            </div> 
            <div className="pt-detail-grid">
              {[
                ["Type Partenaire",       selectedP.typePartenaire],
                ["Pays Siège Social",     selectedP.paysSiegeSocial],
                ["Classification",        selectedP.classificationPartenaire],
                ["N° Compte Banque",      selectedP.numeroCompteBanque],
                ["Type de Transaction",   selectedP.typeTransaction],
                ["Devise Principale",     selectedP.devisePrincipale],
                ["Nature Taux de Change", selectedP.natureTauxChange],
                ["Control Provision",     selectedP.controlProvision],
                ["Nature de Paiement",    selectedP.naturePaiement],
              ].map(([key, val]) => (
                <div key={key} className="pt-detail-item">
                  <span className="pt-detail-key">{key}</span>
                  <span className="pt-detail-val">{val || "—"}</span>
                </div>
              ))}
            </div>
            <div className="pt-form-actions">
              <button className="pt-btn-cancel" onClick={() => setShowDetail(false)}>Fermer</button>
              <button className="pt-btn-submit" onClick={() => { setShowDetail(false); openEdit(selectedP); }}>Modifier</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — SUPPRESSION */}
      {showDelete && selectedP && (
        <div className="pt-modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="pt-modal pt-modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="pt-delete-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h2 className="pt-delete-title">Confirmer la suppression</h2>
            <p className="pt-delete-msg">
              Êtes-vous sûr de vouloir supprimer le partenaire <strong>{selectedP.nomPartenaire}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="pt-form-actions">
              <button className="pt-btn-cancel" onClick={() => setShowDelete(false)}>Annuler</button>
              <button className="pt-btn-danger" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}