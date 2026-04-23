import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Rapports.css";
import logo from "../assets/Logo-BCP3D.webp";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
 
const navItems = [
  { label: "Dashboard",   path: "/dashboard",
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>) },
  { label: "Partenaires", path: "/partenaires",
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>) },
  { label: "Rapports",    path: "/rapports",
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>) },
];

const COLORS = ["#E8630A", "#FF7A20", "#C4520A", "#FFB347", "#FF6B35", "#E84A0A", "#FFD700", "#FF4500"];

const MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

export default function Rapports() {
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();

  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterMois, setFilterMois]   = useState("tous");
  const [filterAnnee, setFilterAnnee] = useState(new Date().getFullYear().toString());

  // ── FETCH ────────────────────────────────────────────────────
  useEffect(() => {
    fetch("http://localhost:8080/api/partenaires", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => { setPartenaires(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── CALCULS STATS ────────────────────────────────────────────
  const total    = partenaires.length;
  const actifs   = partenaires.filter((p) => p.statutPartenaire === "ACTIF").length;
  const inactifs = partenaires.filter((p) => p.statutPartenaire === "INACTIF").length;

  // Répartition par type
  const byType = Object.entries(
    partenaires.reduce((acc, p) => {
      const k = p.typePartenaire || "Inconnu";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Répartition par classification
  const byClassification = Object.entries(
    partenaires.reduce((acc, p) => {
      const k = p.classificationPartenaire || "Inconnu";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Répartition par devise
  const byDevise = Object.entries(
    partenaires.reduce((acc, p) => {
      const k = p.devisePrincipale || "Inconnu";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Répartition par type de transaction
  const byTransaction = Object.entries(
    partenaires.reduce((acc, p) => {
      const k = p.typeTransaction || "Inconnu";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Actifs vs Inactifs
  const byStatut = [
    { name: "Actifs",   value: actifs   },
    { name: "Inactifs", value: inactifs },
  ];

  // Évolution mensuelle
  const byMois = MOIS.map((mois, idx) => {
    const count = partenaires.filter((p) => {
      if (!p.dateAjout) return false;
      const d = new Date(p.dateAjout);
      const anneeMatch = filterAnnee === "tous" || d.getFullYear().toString() === filterAnnee;
      return d.getMonth() === idx && anneeMatch;
    }).length;
    return { mois, partenaires: count };
  });

  // ── TABLEAU RÉCAPITULATIF ────────────────────────────────────
  const tableStats = [
    { label: "Total Partenaires",           value: total,    color: "orange" },
    { label: "Partenaires Actifs",          value: actifs,   color: "green"  },
    { label: "Partenaires Inactifs",        value: inactifs, color: "red"    },
    { label: "Clients",                     value: partenaires.filter(p => p.typePartenaire === "CLIENT").length,      color: "blue"   },
    { label: "Partenaires (type)",          value: partenaires.filter(p => p.typePartenaire === "PARTENAIRE").length,  color: "orange" },
    { label: "Classification Locale",       value: partenaires.filter(p => p.classificationPartenaire === "LOCAL").length,         color: "orange" },
    { label: "Classification Internationale", value: partenaires.filter(p => p.classificationPartenaire === "INTERNATIONAL").length, color: "blue" },
    { label: "Devise MAD",  value: partenaires.filter(p => p.devisePrincipale === "MAD").length,  color: "orange" },
    { label: "Devise EUR",  value: partenaires.filter(p => p.devisePrincipale === "EUR").length,  color: "blue"   },
    { label: "Devise USD",  value: partenaires.filter(p => p.devisePrincipale === "USD").length,  color: "green"  },
  ];

  // ── EXPORT PDF ───────────────────────────────────────────────
  const handleExportPDF = () => {
    window.print();
  };

  // ── EXPORT EXCEL ────────────────────────────────────────────
  const handleExportExcel = () => {
    const headers = [
      "Code","Nom","Type","Statut","Pays","Classification",
      "N° Compte","Type Transaction","Devise","Nature Taux","Control Provision","Nature Paiement"
    ];
    const rows = partenaires.map((p) => [
      p.codePartenaire, p.nomPartenaire, p.typePartenaire, p.statutPartenaire,
      p.paysSiegeSocial, p.classificationPartenaire, p.numeroCompteBanque,
      p.typeTransaction, p.devisePrincipale, p.natureTauxChange,
      p.controlProvision, p.naturePaiement,
    ]);
    const csvContent = [headers, ...rows]
      .map((r) => r.map((c) => `"${c ?? ""}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `rapports_partenaires_${new Date().toLocaleDateString("fr-FR").replace(/\//g,"-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const annees = ["tous", "2023", "2024", "2025", "2026"];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rp-tooltip">
          {label && <p className="rp-tooltip-label">{label}</p>}
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color || p.fill }}>
              {p.name} : <strong>{p.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rp-root">

      {/* SIDEBAR */}
      <aside className="rp-sidebar">
        <div className="rp-sidebar-logo">
          <img src={logo} alt="BCP" className="rp-logo-img" />
        </div>
        <nav className="rp-nav">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path} className={`rp-nav-item ${active ? "active" : ""}`} onClick={() => navigate(item.path)}>
                <span className="rp-nav-icon">{item.icon}</span>
                <span className="rp-nav-label">{item.label}</span>
                {active && <span className="rp-nav-indicator" />}
              </button>
            );
          })}
        </nav>
        <div className="rp-sidebar-footer">
          <div className="rp-user-info">
            <div className="rp-user-avatar">AD</div>
            <div className="rp-user-text">
              <span className="rp-user-name">Admin BCP</span>
              <span className="rp-user-role">Administrateur</span>
            </div>
          </div>
          <button className="rp-logout-btn" onClick={() => navigate("/")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="rp-main" ref={printRef}>

        {/* TOPBAR */}
        <header className="rp-topbar">
          <div className="rp-topbar-left">
            <h1 className="rp-page-title">Rapports</h1>
            <span className="rp-breadcrumb">Accueil / Rapports & Statistiques</span>
          </div>
          <div className="rp-topbar-right">
            {/* Filtre Année */}
            <div className="rp-filter-group">
              <label className="rp-filter-label">Année</label>
              <select className="rp-filter-select" value={filterAnnee} onChange={(e) => setFilterAnnee(e.target.value)}>
                {annees.map((a) => (
                  <option key={a} value={a}>{a === "tous" ? "Toutes" : a}</option>
                ))}
              </select>
            </div>
            {/* Export Excel */}
            <button className="rp-export-btn excel" onClick={handleExportExcel}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Export Excel
            </button>
            {/* Export PDF */}
            <button className="rp-export-btn pdf" onClick={handleExportPDF}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <polyline points="9 15 12 18 15 15"/>
              </svg>
              Export PDF
            </button>
          </div>
        </header>

        {loading ? (
          <div className="rp-loading">
            <span className="rp-spinner"/>
            Chargement des données...
          </div>
        ) : (

          <div className="rp-content">

            {/* ── TABLEAU RÉCAPITULATIF ── */}
            <section className="rp-section">
              <div className="rp-section-header">
                <h2 className="rp-section-title">Tableau Récapitulatif</h2>
                <p className="rp-section-sub">Vue globale de tous les indicateurs</p>
              </div>
              <div className="rp-recap-grid">
                {tableStats.map((s, i) => (
                  <div key={i} className={`rp-recap-card rp-color-${s.color}`}>
                    <span className="rp-recap-value">{s.value}</span>
                    <span className="rp-recap-label">{s.label}</span>
                    <div className="rp-recap-bar">
                      <div className="rp-recap-bar-fill" style={{ width: total > 0 ? `${(s.value / total) * 100}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── GRAPHIQUES ROW 1 ── */}
            <div className="rp-charts-row">

              {/* Actifs vs Inactifs — Pie */}
              <section className="rp-chart-card">
                <div className="rp-section-header">
                  <h2 className="rp-section-title">Actifs vs Inactifs</h2>
                  <p className="rp-section-sub">Répartition par statut</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={byStatut} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {byStatut.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "#22c55e" : "#ef4444"} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </section>

              {/* Répartition par Type — Pie */}
              <section className="rp-chart-card">
                <div className="rp-section-header">
                  <h2 className="rp-section-title">Par Type de Partenaire</h2>
                  <p className="rp-section-sub">Client vs Partenaire</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={byType} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {byType.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </section>

              {/* Classification — Pie */}
              <section className="rp-chart-card">
                <div className="rp-section-header">
                  <h2 className="rp-section-title">Par Classification</h2>
                  <p className="rp-section-sub">Local vs International</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={byClassification} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {byClassification.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </section>

            </div>

            {/* ── GRAPHIQUES ROW 2 ── */}
            <div className="rp-charts-row">

              {/* Devise — Bar */}
              <section className="rp-chart-card rp-chart-wide">
                <div className="rp-section-header">
                  <h2 className="rp-section-title">Répartition par Devise</h2>
                  <p className="rp-section-sub">Nombre de partenaires par devise principale</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byDevise} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "#9E9E9E", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9E9E9E", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Partenaires" radius={[6,6,0,0]}>
                      {byDevise.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </section>

              {/* Type Transaction — Bar */}
              <section className="rp-chart-card rp-chart-wide">
                <div className="rp-section-header">
                  <h2 className="rp-section-title">Par Type de Transaction</h2>
                  <p className="rp-section-sub">Nombre de partenaires par type</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byTransaction} margin={{ top: 10, right: 20, left: 0, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#9E9E9E", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#9E9E9E", fontSize: 10 }} axisLine={false} tickLine={false} width={160} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Partenaires" radius={[0,6,6,0]}>
                      {byTransaction.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </section>

            </div>

            {/* ── ÉVOLUTION MENSUELLE ── */}
            <section className="rp-section">
              <div className="rp-section-header">
                <div>
                  <h2 className="rp-section-title">Évolution Mensuelle</h2>
                  <p className="rp-section-sub">Nouveaux partenaires par mois — {filterAnnee === "tous" ? "Toutes années" : filterAnnee}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={byMois} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#E8630A" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#E8630A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="mois" tick={{ fill: "#9E9E9E", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9E9E9E", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="partenaires" name="Partenaires" stroke="#E8630A" strokeWidth={2.5} fill="url(#rpGrad)" dot={{ fill: "#E8630A", strokeWidth: 0, r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}