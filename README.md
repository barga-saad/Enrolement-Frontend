# Enrollment Frontend

Interface React / TypeScript pour la plateforme d'enrôlement BCP. Permet aux utilisateurs authentifiés via Keycloak de gérer l'enrôlement des partenaires et clients, le workflow de validation, les utilisateurs, rôles, permissions et l'audit.

---

## Stack technique

| Composant | Version |
|---|---|
| React | 18.2 |
| TypeScript | 5.2 |
| Vite | 5.0 |
| Tailwind CSS | 3.3 |
| React Router | 6.20 |
| Zustand | 4.4 |
| Axios | 1.6 |
| Lucide React | 0.294 |

---

## Prérequis

- Node.js 18+
- npm ou yarn
- Backend `dl-ms-enrolment` démarré sur `http://localhost:8080`
- Keycloak démarré sur `http://localhost:8081`

---

## Démarrage rapide

```bash
npm install
npm run dev        # Développement — http://localhost:5173
npm run build      # Build de production → dist/
npm run preview    # Prévisualiser le build
npm run type-check # Vérification TypeScript sans compilation
npm run lint       # ESLint
```

---

## Architecture du projet

```
src/
├── components/
│   ├── common/          # Composants réutilisables
│   ├── layout/          # Structure globale (Sidebar, Navbar)
│   ├── modals/          # Fenêtres modales
│   └── pages/           # Pages principales
├── hooks/               # Hooks personnalisés (useAuth, ...)
├── services/
│   └── api.ts           # Client Axios centralisé
├── styles/              # Design system, globals CSS
├── types/               # Types TypeScript globaux
└── utils/
    ├── authStore.ts     # Store Zustand — authentification
    ├── langStore.ts     # Store Zustand — langue (FR/EN)
    ├── toastStore.ts    # Store Zustand — notifications toast
    ├── countries.ts     # Liste ISO 3166-1 complète (249 pays)
    ├── helpers.ts       # Fonctions utilitaires
    ├── logger.ts        # Logger front
    └── validation.ts    # Validateurs de formulaires
```

---

## Pages & fonctionnalités

### `LoginPage`
- Formulaire de connexion BCP (email + mot de passe)
- Appel POST `/auth/login` → reçoit `access_token` + `refresh_token`
- Stockage du token dans Zustand (`authStore`)
- Redirection automatique après connexion selon le rôle
- Rafraîchissement automatique du token avant expiration

### `DashboardPage`
- Tableau de bord avec statistiques en temps réel :
  - Total partenaires, en attente, validés, rejetés, brouillons
- Graphiques d'activité
- Accès rapide aux actions selon le profil

### `PartnersPage` *(page centrale)*
Gestion complète du cycle de vie partenaire/client avec 8 vues :

| Vue | Description |
|---|---|
| `list` | Tableau paginé de tous les partenaires avec recherche, filtres et tri |
| `choose-type` | Sélection du type à enrôler : Partenaire ou Client |
| `create` | Formulaire multi-onglets de création |
| `edit` | Modification d'un partenaire existant |
| `validate` | Vue de validation avec approbation / rejet |
| `consult` | Vue lecture seule détaillée |
| `drafts` | Liste des brouillons sauvegardés |
| `resume-draft` | Reprendre l'édition d'un brouillon |

**Onglets du formulaire (Partenaire) :**
1. **Informations générales** — Identité, pays (sélecteur ISO 3166-1 avec recherche), classification, compte, canal
2. **Transferts & Plafonds** — 6 types de transfert avec autorisation (toggle) et plafond (montant)
3. **Commissions & Abonnement** — Devise, frais d'abonnement, nature paiement, 6 blocs de commission (type, montant, taux, min, max)
4. **Forex & Conformité** — Réception / Émission devises, plafonds, autorisations OC
5. **Conformité** — 6 champs Donneur d'ordre + 5 champs Bénéficiaire (toggles)
6. **Facturation** — Fichier synthèse, setup fee, mode de facturation, dérogation

**Actions disponibles par profil :**
- `PROFIL_SAISIE` : Créer, modifier, sauvegarder brouillon, soumettre
- `PROFIL_VALIDATEUR` : Valider, rejeter les dossiers soumis
- `PROFIL_ADMIN_CENTRAL` : Tout + export CSV, supprimer
- `PROFIL_CONSULTATION` : Consultation uniquement

**Export CSV :**  
Bouton disponible pour `PROFIL_ADMIN_CENTRAL`. Exporte **tous les partenaires validés** avec l'ensemble des ~90 champs en CSV (`partners_validated_YYYY-MM-DD.csv`).

### `UsersPage`
- Liste des utilisateurs avec leur rôle
- Créer / modifier / supprimer un utilisateur
- Assigner / révoquer des rôles
- Réservé à `PROFIL_ADMIN_CENTRAL`

### `RolesPage`
- CRUD complet des rôles
- Assigner / retirer des permissions à un rôle
- Réservé à `PROFIL_ADMIN_CENTRAL`

### `AuditLogPage`
- Journal de toutes les actions de la plateforme
- Filtrable par utilisateur, action, entité, période
- Exportable
- Réservé à `PROFIL_ADMIN_CENTRAL`

### `ChangePasswordPage`
- Formulaire de changement de mot de passe
- Validations côté client + confirmation

---

## Composants communs

| Composant | Fichier | Description |
|---|---|---|
| `FormInput` | `FormComponents.tsx` | Input stylisé avec label, erreur, placeholder |
| `FormSelect` | `FormComponents.tsx` | Select stylisé avec options |
| `FormSection` / `FormBlock` | `FormComponents.tsx` | Conteneurs de sections de formulaire |
| `CountrySelect` | `CountrySelect.tsx` | Combobox recherchable — 249 pays ISO 3166-1, affiche `XX – Nom`, stocke le code ISO |
| `Table` | `Table.tsx` | Tableau générique avec tri, pagination |
| `Toggle` | *(common)* | Switch booléen stylisé |
| `Loader` | `Loader.tsx` | Spinner de chargement |
| `PrivateRoute` | `PrivateRoute.tsx` | Protection de route par authentification |
| `LanguageToggle` | `LanguageToggle.tsx` | Bascule FR / EN |
| `GeometricDecor` | `GeometricDecor.tsx` | Décorations visuelles BCP |

---

## Layout

| Composant | Description |
|---|---|
| `Layout.tsx` | Conteneur global : Sidebar + Navbar + zone de contenu |
| `Sidebar.tsx` | Navigation latérale avec liens par profil, logo BCP |
| `Navbar.tsx` | Barre supérieure : langue, thème, menu utilisateur avec dropdown (infos + déconnexion) |

---

## Gestion d'état (Zustand)

### `authStore`
```ts
// Contient :
user: { username, firstName, lastName, roleNames, permissions }
token: string          // access_token JWT
refreshToken: string
login(credentials)     // POST /auth/login
logout()               // POST /auth/logout
refreshAccessToken()   // POST /auth/refresh
```

### `langStore`
```ts
lang: 'fr' | 'en'
setLang(lang)
// Fonction globale :
t('Texte FR', 'English text')  // retourne selon la langue active
```

### `toastStore`
```ts
showSuccess(message)
showError(message)
showWarning(message)
// Toasts auto-disparaissants (3s)
```

---

## Client API (`services/api.ts`)

- Instance Axios avec `baseURL: http://localhost:8080`
- Intercepteur requête : injecte `Authorization: Bearer <token>` automatiquement
- Intercepteur réponse : sur `401` → tente un refresh du token puis re-joue la requête originale → si le refresh échoue, redirige vers `/login`

---

## Internationalisation

Bilingue FR / EN via `langStore` et la fonction `t()` :
```ts
import { t } from '../../utils/langStore';

t('Valider', 'Validate')  // → 'Valider' si lang=fr, 'Validate' si lang=en
```

La langue préférée est persistée dans `localStorage`.

---

## Design system

- **Couleur principale** : BCP Orange `#FF9900`
- **Couleur secondaire** : BCP Brown `#6B4C3A`
- **Mode sombre** : supporté nativement via Tailwind `dark:`
- **Police** : Inter (system-ui fallback)
- Classes utilitaires custom dans `tailwind.config.js` : `bcp-orange`, `bcp-brown`, `dark-bg`, `dark-bg-soft`, `dark-border`, `dark-text`, `dark-text-dim`
- Animations : `float`, `pulse-subtle`, `gradient-shift`, `fadeIn` (dropdown)
- Classe `premium-input` : style uniforme pour tous les champs de formulaire

---

## Routing

```
/login              → LoginPage (public)
/                   → redirect → /dashboard
/dashboard          → DashboardPage
/partners           → PartnersPage
/users              → UsersPage
/roles              → RolesPage
/audit              → AuditLogPage
/change-password    → ChangePasswordPage
/no-role            → NoRolePage (utilisateur sans profil assigné)
```

Toutes les routes sauf `/login` sont protégées par `PrivateRoute` (token valide requis).

---

## Sélecteur de pays ISO 3166-1

Le composant `CountrySelect` (`src/components/common/CountrySelect.tsx`) remplace les `<select>` simples pour les champs pays :
- **249 pays** de la liste officielle ISO 3166-1
- Recherche par nom (FR ou EN) ou code ISO
- Affichage : badge code ISO + nom du pays
- **Stockage** : code ISO 2 lettres (ex: `MA`, `FR`, `US`) — compatible avec la base de production
- Données dans `src/utils/countries.ts`

---

## Build de production

```bash
npm run build
# Sortie dans dist/
# Servir avec nginx, Apache, ou tout serveur de fichiers statiques
```

Configuration Vite (`vite.config.ts`) : proxy `/api` → `http://localhost:8080` en développement.
