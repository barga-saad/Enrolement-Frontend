/**
 * Dev-only UI preview mode (frontend auth bypass).
 *
 * Active ONLY when both are true:
 *  - running the Vite dev server (`import.meta.env.DEV`; always false in `vite build`, so this
 *    code is stripped from production/UAT bundles), and
 *  - `VITE_DEV_AUTH_BYPASS=true` is set in a local, git-ignored env file (`.env.development.local`).
 *
 * It only lets the UI render every page with a fake profile holding all roles. The backend is
 * untouched: API calls are sent without a token and still get rejected (401), so pages show no data.
 */

import { User } from '../types';

export const DEV_AUTH_BYPASS: boolean =
  import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

export const DEV_PREVIEW_USER: User = {
  id: 0,
  username: 'dev.preview',
  email: '',
  firstName: 'Dev',
  lastName: 'Preview',
  isActive: true,
  roleNames: ['PROFIL_ADMIN_CENTRAL', 'PROFIL_AGENT_HABILITATION', 'PROFIL_AGENT_ENROLEMENT', 'PROFIL_CONSULTATION'],
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
  isDeleted: false,
};
