import React, { useState } from "react";
import "./Login.css";
import logo from "../assets/Logo-BCP3D.webp";

export default function Login() {
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 état pour forcer changement mot de passe
  const [forceChangePassword, setForceChangePassword] = useState(false);

  // ================= LOGIN VIA BACKEND =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: matricule,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.token) {

        // 🔥 CAS IMPORTANT → mot de passe temporaire
        if (data.mustChangePassword) {
          setForceChangePassword(true);
          setLoading(false);
          return;
        }

        // ✅ login normal
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";

      } else {
        alert("Identifiants incorrects");
      }

    } catch (error) {
      console.error("Erreur login :", error);
      alert("Erreur serveur");
    }

    setLoading(false);
  };

  // ================= CHANGE PASSWORD =================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: matricule,
          newPassword: newPassword,
        }),
      });

      if (res.ok) {
        alert("Mot de passe changé avec succès");

        // 🔥 reconnect automatique
        setPassword(newPassword);
        setForceChangePassword(false);
        setNewPassword("");

        // 🔥 relancer login automatiquement
        handleSubmit(e);

      } else {
        alert("Erreur changement mot de passe");
      }

    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }

    setLoading(false);
  };

  return (
    <div className="login-wrapper">

      {/* LEFT */}
      <div className="login-left">
        <div className="left-overlay" />
        <div className="left-content">
          <div className="logo-container">
            <div className="logo-container-img">
              <img src={logo} alt="Banque Populaire" className="logo-img" />
            </div>
          </div>
          <h1 className="bank-name">Banque Populaire</h1>
          <p className="bank-tagline">Portail Des Partenaires</p>
          <div className="decorative-line" />
          <p className="bank-desc">
            Accédez à votre espace sécurisé pour gérer et surveiller l'ensemble
            de vos données et actions
          </p>
          <div className="floating-shapes">
            <div className="shape shape-1" />
            <div className="shape shape-2" />
            <div className="shape shape-3" />
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="form-con-tainer">
          <div className="form-header">
            <div className="form-icon">
              <img src={logo} alt="logo" style={{ width: "42px" }} />
            </div>

            <h2 className="form-title">
              {forceChangePassword ? "Nouveau mot de passe" : "Connexion"}
            </h2>

            <p className="form-subtitle">
              {forceChangePassword
                ? "Veuillez définir un nouveau mot de passe"
                : "Bienvenue, veuillez vous identifier"}
            </p>
          </div>

          <form
            onSubmit={forceChangePassword ? handleChangePassword : handleSubmit}
            className="login-form"
          >

            {/* MATRICULE */}
            {!forceChangePassword && (
              <div className="input-group">
                <label className="input-label">Matricule</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Entrez votre matricule"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    required
                  />
                  <span className="input-focus-bar" />
                </div>
              </div>
            )}

            {/* PASSWORD */}
            {!forceChangePassword && (
              <div className="input-group">
                <label className="input-label">Mot de passe</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                  <span className="input-focus-bar" />
                </div>
              </div>
            )}

            {/* 🔥 NEW PASSWORD */}
            {forceChangePassword && (
              <div className="input-group">
                <label className="input-label">Nouveau mot de passe</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <span className="input-focus-bar" />
                </div>
              </div>
            )}

            {/* OPTIONS */}
            {!forceChangePassword && (
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" className="checkbox" />
                  <span className="checkmark" />
                  <span>Se souvenir de moi</span>
                </label>
                <a href="#" className="forgot-link">
                  Mot de passe oublié ?
                </a>
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              className={`submit-btn ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <span>
                  {forceChangePassword
                    ? "Changer le mot de passe"
                    : "Se connecter"}
                </span>
              )}
            </button>
          </form>

          <div className="form-footer">
            <span className="security-badge">
              🔐 Connexion sécurisée RHSSO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}