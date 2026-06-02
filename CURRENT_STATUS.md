# BCP Enrollment Platform — Etat Actuel (2 Juin 2026)

## STATUT GLOBAL
- **Backend** : 100% complete (tous les endpoints implémentes et compiles)
- **Frontend** : 100% complete (tous les blocs 1-9 implementes, zero erreur TypeScript)
- **Tests E2E** : A réaliser (Bloc 10 — conditions réelles avec vrais comptes Keycloak)

---

## PAGES ET FONCTIONNALITES

### LoginPage (/)
- ✅ Formulaire username/password avec design BCP
- ✅ Keycloak OAuth2 Resource Owner Password flow
- ✅ Stockage JWT + refreshToken dans localStorage
- ✅ Detection requiresPasswordChange -> redirect /change-password
- ✅ LanguageToggle (FR/EN)
- ✅ Toast d'erreur si credentials invalides

### ChangePasswordPage (/change-password)
- ✅ Formulaire nouveau mot de passe + confirmation
- ✅ Minimum 8 caracteres
- ✅ Auto-login apres changement + redirect dashboard

### DashboardPage (/)
- ✅ 4 stats cards : Partenaires Valides, En Attente, Utilisateurs, Roles actifs
- ✅ Activites recentes branchées sur vrais audit logs (5 derniers)
- ✅ Couleurs par type : CREATE=bleu, VALIDATE=vert, REJECT=orange, etc.
- ✅ Acces conditionnel selon role (ADMIN voit tout)

### PartnersPage (/partners/*)
- ✅ Vue liste avec colonnes : Reference, Designation, Type, Pays, Statut, Workflow
- ✅ Mode Saisie (/partners/new) : formulaire complet avec onglets
- ✅ Mode Brouillons (/partners/drafts) : liste, motif rejet, re-submit
- ✅ Mode Modification (/partners/edit)
- ✅ Mode Validation (/partners/validate) : liste + formulaire lecture seule
- ✅ Mode Consultation (/partners/consult) : lecture seule + timeline workflow
- ✅ Export CSV (Blob download)
- ✅ Principe 4 yeux (message toast specifique)
- ✅ Retour liste apres validation/rejet

**Sections du formulaire partenaire :**
1. Informations Generales (onglet 1)
   - Identite : nom, reference, type, statut, pays, classification (Local/International)
   - Coordonnees bancaires : compte
2. Types Transactions & Plafonds (onglet 1)
   - 6 types : Money Transfer, Cash Pickup, Mass Cash Pickup,
     Mass Cash Pay-in, Reserve, Wallet
   - Plafonds et commissions (Flat/Percentage) par type
3. Forex (onglet 2)
   - Reception et Emission de devises
   - Type transaction emission, autorisation OC, nature cours change
4. Controle Provision (onglet 2)
   - Nature paiement
5. Conformite (PARTNER only, onglet 3)
   - Donneur d'Ordre : 6 toggles (typePiece, numPiece, dateNaissance,
     paysNaissance, adresse, villeResidence)
   - Beneficiaire : 5 toggles (typePiece, numPiece, adresse,
     villeResidence, paysResidence)
6. Fichier de Synthese (PARTNER only, onglet 3)
   - Toggle fichierSynthese (defaut: Oui)
7. Facturation (onglet 3)
   - setupFee, billingMode, derogation, commissions

### UsersPage (/users) — ADMIN only
- ✅ Liste utilisateurs : nom, username, email, roles, statut
- ✅ Creer utilisateur : prenom, nom, email, username, password, isActive
- ✅ Modifier : pre-rempli, modification roles/statut
- ✅ Supprimer : confirmation modale
- ✅ Gestion roles : assignation/revocation

### RolesPage (/roles) — ADMIN only
- ✅ Liste roles avec permissions associees
- ✅ Creer / modifier / supprimer un role
- ✅ Permissions groupees par categorie + select-all
- ✅ isActive toggle

### AuditLogPage (/audit) — ADMIN only
- ✅ Table avec colonnes : Date, Utilisateur ("—" si null), Action, Entite, ID, Details
- ✅ Filtre par texte (username, action, entite)
- ✅ Filtre par type d'entite (select)
- ✅ Filtre par date (dateFrom / dateTo + boutton reset)
- ✅ Pagination

### Sidebar
- ✅ Navigation role-based (menus caches selon profil)
- ✅ Badge orange avec count sur "Validation" (refresh a chaque mount)
- ✅ Dark mode

---

## SECURITE

### Authentification
- ✅ Keycloak OAuth2 / JWT (Resource Owner Password Credentials)
- ✅ Token stocke en localStorage
- ✅ Refresh token stocke en localStorage
- ✅ Intercepteur Axios async sur 401 :
    1. Tente refresh via POST /auth/refresh
    2. Si succes : retente la requete originale avec nouveau token
    3. Si echec : clear localStorage + redirect /login

### RBAC
- ✅ 4 profils : PROFIL_ADMIN_CENTRAL, PROFIL_SAISIE, PROFIL_VALIDATEUR, PROFIL_CONSULTATION
- ✅ Menus caches selon role
- ✅ Routes protegees

### 4 Yeux
- ✅ Backend refuse que saisisseur == validateur
- ✅ Frontend affiche toast explicite (FOUR_EYES_VIOLATION)

---

## BACKEND (reference)

### Endpoints principaux
- POST /auth/login
- POST /auth/refresh    ← NOUVEAU (Juin 2026)
- POST /auth/logout
- GET  /auth/me
- GET  /v1/read/partners (paginated)
- POST /v1/create/partners
- PUT  /v1/update/partners
- GET  /v1/read/partners/{ref}
- POST /v1/submit/{partnerId}
- POST /v1/save-draft/{partnerId}
- POST /v1/validations/validate/{id}
- POST /v1/validations/reject/{id}
- GET  /v1/validations/pending
- GET  /v1/validations/drafts
- GET  /v1/validations/history/{partnerId}
- GET  /v1/export/partners?format=csv
- CRUD /admin/users
- CRUD /admin/roles
- CRUD /admin/permissions
- GET  /admin/audit-logs (paginated)
- GET  /admin/audit-logs/by-date-range

### Entite Partner — champs conformite (Juin 2026)
- conformiteDOTypePiece, conformiteDONumPiece
- conformiteDODateNaissance (nouveau)
- conformiteDOPaysNaissance (nouveau)
- conformiteDOAdresse (nouveau)
- conformiteDOVilleResidence
- conformiteBenefTypePiece, conformiteBenefNumPiece, conformiteBenefAdresse
- conformiteBenefVilleResidence (nouveau)
- conformiteBenefPaysResidence (nouveau)
- fichierSynthese (nouveau, defaut: true)

---

## RESTE A FAIRE (Bloc 10 — Tests E2E)
- [ ] Tester flux complet : saisie -> brouillon -> soumission -> validation
- [ ] Tester flux rejet -> correction -> re-soumission
- [ ] Tester principe 4 yeux (deux comptes differents)
- [ ] Tester modification partenaire VALIDATED (repassage PENDING)
- [ ] Tester export CSV
- [ ] Tester token refresh silencieux (expiration JWT en cours de session)
- [ ] Executer fix_created_by_uuids.sql sur la base de production