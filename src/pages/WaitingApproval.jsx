import React, { useEffect, useState } from "react";
import "./WaitingApproval.css";
import logo from "../assets/Logo-BCP3D.webp";
import keycloak from "../keycloak";

export default function WaitingApproval() {
  const [dots, setDots] = useState("");

  // Animation des points
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Vérifie toutes les 10 secondes si un rôle a été affecté
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await keycloak.updateToken(-1); // Force refresh du token
        const roles = keycloak.tokenParsed?.realm_access?.roles || [];
        const hasRole = roles.some((r) =>
          !["default-roles-partner-management", "offline_access", "uma_authorization"].includes(r)
        );
        if (hasRole) {
          window.location.href = "/dashboard";
        }
      } catch (e) {
        console.error("Erreur refresh token:", e);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="wa-root">

      {/* Formes décoratives fond */}
      <div className="wa-bg-shape wa-shape-1" />
      <div className="wa-bg-shape wa-shape-2" />
      <div className="wa-bg-shape wa-shape-3" />

      <div className="wa-card">

        {/* Logo */}
        <div className="wa-logo-wrapper">
          <img src={logo} alt="Banque Populaire" className="wa-logo" />
        </div>

        {/* Icône animée */}
        <div className="wa-icon-wrapper">
          <div className="wa-icon-ring wa-ring-1" />
          <div className="wa-icon-ring wa-ring-2" />
          <div className="wa-icon-ring wa-ring-3" />
          <div className="wa-icon-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        </div>

        {/* Texte principal */}
        <h1 className="wa-title">Compte en attente d'activation</h1>
        <p className="wa-subtitle">
          Votre compte a été créé avec succès. Un administrateur doit vous
          affecter un rôle avant que vous puissiez accéder à la plateforme.
        </p>

        {/* Étapes */}
        <div className="wa-steps">
          <div className="wa-step wa-step-done">
            <div className="wa-step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="wa-step-text">
              <span className="wa-step-title">Compte créé</span>
              <span className="wa-step-desc">Votre compte a été enregistré</span>
            </div>
          </div>

          <div className="wa-step-connector wa-step-connector-done" />

          <div className="wa-step wa-step-active">
            <div className="wa-step-icon wa-step-icon-pulse">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="wa-step-text">
              <span className="wa-step-title">En attente d'affectation{dots}</span>
              <span className="wa-step-desc">Un administrateur va vous affecter un rôle</span>
            </div>
          </div>

          <div className="wa-step-connector" />

          <div className="wa-step wa-step-pending">
            <div className="wa-step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="wa-step-text">
              <span className="wa-step-title">Accès accordé</span>
              <span className="wa-step-desc">Redirection automatique vers le dashboard</span>
            </div>
          </div>
        </div>

        {/* Info utilisateur */}
        <div className="wa-user-info">
          <div className="wa-user-avatar">
            {keycloak.tokenParsed?.preferred_username?.substring(0, 2).toUpperCase() || "U"}
          </div>
          <div className="wa-user-details">
            <span className="wa-user-name">
              {keycloak.tokenParsed?.preferred_username || "Utilisateur"}
            </span>
            <span className="wa-user-email">
              {keycloak.tokenParsed?.email || ""}
            </span>
          </div>
          <span className="wa-user-badge">En attente</span>
        </div>

        {/* Message vérification auto */}
        <div className="wa-auto-check">
          <span className="wa-spinner-small" />
          Vérification automatique toutes les 10 secondes
        </div>

        {/* Bouton déconnexion */}
        <button
          className="wa-logout-btn"
          onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Se déconnecter
        </button>

        {/* Footer */}
        <p className="wa-footer">
          🔐 Connexion sécurisée — Banque Populaire &copy; {new Date().getFullYear()}
        </p>

      </div>
    </div>
  );
}