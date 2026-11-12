import { t } from './langStore';

// Profile names (must match the backend: org.bcp.dlmsenrolment.security.Profiles)
export const PROFIL_ADMIN_CENTRAL = 'PROFIL_ADMIN_CENTRAL';
export const PROFIL_AGENT_HABILITATION = 'PROFIL_AGENT_HABILITATION';
export const PROFIL_AGENT_ENROLEMENT = 'PROFIL_AGENT_ENROLEMENT';
export const PROFIL_CONSULTATION = 'PROFIL_CONSULTATION';
// Merged into PROFIL_AGENT_ENROLEMENT; still accepted so older sessions keep working
export const LEGACY_PROFIL_SAISIE = 'PROFIL_SAISIE';
export const LEGACY_PROFIL_VALIDATEUR = 'PROFIL_VALIDATEUR';

/** Data entry + validation (4-eyes rule enforced by the backend). */
export const ENROLEMENT_ROLES = [PROFIL_AGENT_ENROLEMENT, LEGACY_PROFIL_SAISIE, LEGACY_PROFIL_VALIDATEUR];
/** Can open the users page. */
export const USER_MANAGEMENT_ROLES = [PROFIL_ADMIN_CENTRAL, PROFIL_AGENT_HABILITATION];
/** Roles an habilitation agent may assign/revoke (the backend enforces the same rule). */
export const ASSIGNABLE_BY_HABILITATION = [PROFIL_AGENT_ENROLEMENT, PROFIL_CONSULTATION];
/** Accounts only a central admin may modify. */
export const PROTECTED_FROM_HABILITATION = [PROFIL_ADMIN_CENTRAL, PROFIL_AGENT_HABILITATION];

export const hasAnyRole = (roleNames: string[] | undefined, roles: string[]) =>
  (roleNames || []).some((r) => roles.includes(r));

// Single source for profile labels (job titles), used by the navbar, dashboard, users and roles pages
export const ROLE_LABELS: Record<string, [string, string]> = {
  PROFIL_ADMIN_CENTRAL: ['Administrateur central', 'Central administrator'],
  PROFIL_AGENT_HABILITATION: ["Agent d'habilitation", 'Access management agent'],
  PROFIL_AGENT_ENROLEMENT: ["Agent d'enrôlement", 'Enrolment agent'],
  PROFIL_CONSULTATION: ['Consultant', 'Viewer'],
  PROFIL_SAISIE: ['Agent de saisie (ancien profil)', 'Data entry agent (legacy)'],
  PROFIL_VALIDATEUR: ['Validateur (ancien profil)', 'Validator (legacy)'],
};

export const roleLabel = (name: string) => (ROLE_LABELS[name] ? t(...ROLE_LABELS[name]) : name);

// Profile descriptions shown on the users and roles pages
export const ROLE_DESCRIPTIONS: Record<string, [string, string]> = {
  PROFIL_ADMIN_CENTRAL: ['Administrateur avec accès complet au système', 'Administrator with full system access'],
  PROFIL_AGENT_HABILITATION: [
    "Gestion des utilisateurs et attribution des rôles agent d'enrôlement / consultant",
    'User management and assignment of the enrolment agent / viewer roles',
  ],
  PROFIL_AGENT_ENROLEMENT: [
    'Saisie et validation des partenaires/clients (principe des 4 yeux : on ne valide pas sa propre saisie)',
    'Partner/client data entry and validation (4-eyes rule: you cannot validate your own entry)',
  ],
  PROFIL_CONSULTATION: ['Profil de consultation seule', 'Read-only consultation profile'],
  PROFIL_SAISIE: ["Ancien profil, remplacé par Agent d'enrôlement", 'Legacy profile, replaced by Enrolment agent'],
  PROFIL_VALIDATEUR: ["Ancien profil, remplacé par Agent d'enrôlement", 'Legacy profile, replaced by Enrolment agent'],
};

export const roleDescription = (name: string, desc?: string) =>
  ROLE_DESCRIPTIONS[name] ? t(...ROLE_DESCRIPTIONS[name]) : (desc || '');
