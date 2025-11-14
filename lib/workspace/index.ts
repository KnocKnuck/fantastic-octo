/**
 * Workspace Multi-Tenancy Module
 *
 * Central export point for workspace context and multi-tenancy utilities.
 *
 * @module workspace
 */

export {
  getWorkspaceFromSession,
  getWorkspaceById,
  withWorkspaceId,
  verifyWorkspaceAccess,
  createPersonalWorkspace,
  switchWorkspace,
  getUserWorkspaces,
  createWorkspaceClient,
  monitorWorkspaceQuery,
  type WorkspaceContext,
} from './context';
