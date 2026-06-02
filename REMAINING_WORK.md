# Travail Restant — 2 Juin 2026

## STATUT : IMPLEMENTATION COMPLETE (Blocs 1-9)
Seuls les tests end-to-end (Bloc 10) restent a realiser.

---

## TESTS E2E A REALISER (Priorite haute)

### Test 1 : Flux complet saisie -> validation
Compte PROFIL_SAISIE :
  1. Se connecter -> aller sur "Saisie Nouveau"
  2. Choisir type Partenaire
  3. Remplir : nom, numero compte, pays, classification (Local ou International)
  4. "Sauvegarder" -> brouillon DRAFT
  5. "Mes Brouillons" -> voir la ligne avec statut DRAFT
  6. "Soumettre" -> status PENDING, badge +1 dans la sidebar validation
Compte PROFIL_VALIDATEUR (compte different) :
  7. "Validation" -> voir le partenaire avec badge count
  8. Cliquer oeil -> formulaire read-only + timeline historique
  9. "Valider" -> status VALIDATED, retour liste auto

### Test 2 : Flux rejet -> correction -> re-soumission
  1. Validateur : rejeter avec motif de rejet
  2. Saisisseur : voir le motif en rouge dans "Mes Brouillons"
  3. Saisisseur : "Reprendre" -> corriger -> re-soumettre
  4. Validateur : re-valider

### Test 3 : Principe 4 yeux
  Meme compte tente de valider sa propre soumission
  -> Toast rouge : "Vous ne pouvez pas valider votre propre saisie..."

### Test 4 : Modification partenaire valide
  SAISIE modifie un partenaire VALIDATED
  -> Status repasse PENDING
  -> VALIDATEUR voit le changement dans la queue

### Test 5 : Export CSV
  Cliquer "Telecharger" dans la liste partenaires
  -> Fichier partners_YYYY-MM-DD.csv telecharge

### Test 6 : Token refresh silencieux
  Laisser la session expirer (ou reduire TTL JWT a 1 minute dans Keycloak)
  -> Faire une action -> refresh se declenche silencieusement
  -> Si refresh echoue -> redirect /login propre

---

## MAINTENANCE

### SQL a executer en production
  Fichier : Enrolement-Backend/fix_created_by_uuids.sql
  Purpose : Corriger les anciens enregistrements ou createdBy = UUID (avant fix SecurityUtils)

### Nouvelles colonnes en base (DDL-auto=update)
  Ces colonnes sont ajoutees automatiquement au prochain demarrage du backend :
  - conformite_do_date_naissance
  - conformite_do_pays_naissance
  - conformite_do_adresse
  - conformite_benef_ville_residence
  - conformite_benef_pays_residence
  - fichier_synthese

---

## ARCHITECTURE EN PLACE

Backend Spring Boot 3.2.9 :
  - Port 8080
  - PostgreSQL 17 (DDL-auto=update)
  - Keycloak 23.0.1 (port 8081)
  - Tous les endpoints implementes et compiles
  - POST /auth/refresh (nouveau — token refresh silencieux)

Frontend React 18 + TypeScript :
  - Port 5173
  - 0 erreur TypeScript (npx tsc --noEmit clean)
  - 0 erreur de build
  - Dark mode / Light mode
  - Bilingue FR/EN (helper t(fr, en))

Docker Compose :
  - Keycloak : REDHAT_SSO-Docker_Compose/docker-compose.yaml