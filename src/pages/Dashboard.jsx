import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Dashboard.css";
import logo from "../assets/Logo-BCP3D.webp";
import keycloak from "../keycloak";

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const chartData = [
  { mois: "Jan", actifs: 0, nouveaux: 0 },
  { mois: "Fév", actifs: 0, nouveaux: 0 },
  { mois: "Mar", actifs: 0, nouveaux: 0 },
  { mois: "Avr", actifs: 0, nouveaux: 0 },
  { mois: "Mai", actifs: 0, nouveaux: 0 },
  { mois: "Jun", actifs: 0, nouveaux: 0 },
  { mois: "Jul", actifs: 0, nouveaux: 0 },
  { mois: "Aoû", actifs: 0, nouveaux: 0 },
  { mois: "Sep", actifs: 0, nouveaux: 0 },
  { mois: "Oct", actifs: 0, nouveaux: 0 },
  { mois: "Nov", actifs: 0, nouveaux: 0 },
  { mois: "Déc", actifs: 0, nouveaux: 0 },
];

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Partenaires", path: "/partenaires" },
  { label: "Rapports", path: "/rapports" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [chartType, setChartType] = useState("area");
  const [loading, setLoading] = useState(true);
  const [partenaires, setPartenaires] = useState([]);

  const [statsData, setStatsData] = useState([
    { id: 1, label: "Total Partenaires", value: "0", delta: "0", positive: true },
    { id: 2, label: "Partenaires Actifs", value: "0", delta: "0", positive: true },
    { id: 3, label: "Partenaires Inactifs", value: "0", delta: "0", positive: false },
    { id: 4, label: "Nouveaux ce mois", value: "0", delta: "0", positive: true },
  ]);

  // 🔐 PROTECTION KEYCLOAK
  useEffect(() => {
    if (!keycloak.authenticated) {
      keycloak.login();
    }
  }, []);

  // 🔥 FETCH AVEC TOKEN KEYCLOAK
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8087/api/partenaires", {
          headers: {
            Authorization: "Bearer " + keycloak.token,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Erreur serveur");

        const data = await response.json();
        setPartenaires(data);

        // --- Calcul des stats de base depuis l'API ---
        let total = data.length;
        let actifs = data.filter(p => p.statut === "Actif").length;
        let inactifs = data.filter(p => p.statut === "Inactif").length;

        // --- DYNAMIQUE : ajouter l'utilisateur connecté s'il n'est pas déjà dans la liste ---
        const currentUser = keycloak.tokenParsed?.preferred_username;
        if (currentUser) {
          // Vérifier si l'utilisateur existe déjà (comparaison insensible à la casse)
          const userExists = data.some(p => p.nom?.toLowerCase() === currentUser.toLowerCase());
          if (!userExists) {
            total += 1;          // +1 au total des partenaires
            actifs += 1;         // l'utilisateur est considéré comme actif
            // inactifs ne change pas
          }
        }

        // Calcul des nouveaux partenaires du mois (inchangé)
        const now = new Date();
        const nouveaux = data.filter(p => {
          const d = new Date(p.dateAjout);
          return d.getMonth() === now.getMonth() &&
                 d.getFullYear() === now.getFullYear();
        }).length;

        // Mise à jour des 4 cartes
        setStatsData([
          { id: 1, label: "Total Partenaires", value: total, delta: `${total}`, positive: true },
          { id: 2, label: "Partenaires Actifs", value: actifs, delta: `${actifs}`, positive: true },
          { id: 3, label: "Partenaires Inactifs", value: inactifs, delta: `${inactifs}`, positive: false },
          { id: 4, label: "Nouveaux ce mois", value: nouveaux, delta: "ce mois", positive: true },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Erreur API:", error);
        setLoading(false);
      }
    };

    if (keycloak.authenticated) {
      fetchData();
    }
  }, []);

  const filtered = partenaires.filter(p =>
    p.nom?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="db-root">

      {/* SIDEBAR */}
      <aside className="db-sidebar">
        <div className="db-sidebar-logo">
          <img src={logo} alt="BCP" className="db-logo-img" />
        </div>

        <nav className="db-nav">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`db-nav-item ${active ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="db-nav-label">{item.label}</span>
                {active && <span className="db-nav-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-user-info">
            <div className="db-user-avatar">
              {keycloak.tokenParsed?.preferred_username?.substring(0,2).toUpperCase()}
            </div>
            <div className="db-user-text">
              <span className="db-user-name">
                {keycloak.tokenParsed?.preferred_username}
              </span>
              <span className="db-user-role">Utilisateur</span>
            </div>
          </div>

          <button
            className="db-logout-btn"
            onClick={() => keycloak.logout()}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="db-main">

        {/* TOPBAR */}
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h1 className="db-page-title">Dashboard</h1>
            <span className="db-breadcrumb">Accueil / Vue générale</span>
          </div>

          <div className="db-topbar-right">
            <div className="db-search-box">
              <input
                className="db-search-input"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* STATS - maintenant dynamiques */}
        <section className="db-stats-grid">
          {statsData.map(stat => (
            <div key={stat.id} className="db-stat-card">
              <div className="db-stat-value">{stat.value}</div>
              <div className="db-stat-label">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* CHART */}
        <section className="db-chart-section">
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "area" ? (
              <AreaChart data={chartData}>
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="actifs" stroke="#E8630A" />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="actifs" fill="#E8630A" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </section>

        {/* TABLE */}
        <section className="db-table-section">
          <table className="db-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="2">Chargement...</td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nom}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
}