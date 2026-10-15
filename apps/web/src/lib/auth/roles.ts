/**
 * Prismora Authentication & Role-Based Access Control (RBAC) System
 *
 * Implements server-enforced permissions, tenant isolation, and resource ownership.
 * Anonymous visitors have unhindered access to public simulations without logging in.
 */

export const UserRole = {
  ANONYMOUS: 'ANONYMOUS',
  STUDENT: 'STUDENT',
  EDUCATOR: 'EDUCATOR',
  RESEARCHER: 'RESEARCHER',
  CREATOR: 'CREATOR',
  MODERATOR: 'MODERATOR',
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  PLATFORM_SUPER_ADMIN: 'PLATFORM_SUPER_ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Permission = {
  // Public access
  SIMULATION_RUN: 'simulation:run',
  SIMULATION_EXPORT: 'simulation:export',

  // User features
  EXPERIMENT_SAVE: 'experiment:save',
  EXPERIMENT_FORK: 'experiment:fork',
  EXPERIMENT_VIEW_OWN: 'experiment:view_own',
  EXPERIMENT_DELETE_OWN: 'experiment:delete_own',

  // Educator features
  CLASSROOM_MANAGE: 'classroom:manage',
  ASSIGNMENT_CREATE: 'assignment:create',

  // Creator features
  SIMULATION_AUTHOR: 'simulation:author',
  SIMULATION_PUBLISH: 'simulation:publish',

  // Moderation & Platform Administration
  CONTENT_MODERATE: 'content:moderate',
  USER_MANAGE: 'user:manage',
  SYSTEM_ADMIN: 'system:admin',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  [UserRole.ANONYMOUS]: [
    Permission.SIMULATION_RUN,
    Permission.SIMULATION_EXPORT,
  ],
  [UserRole.STUDENT]: [
    Permission.SIMULATION_RUN,
    Permission.SIMULATION_EXPORT,
    Permission.EXPERIMENT_SAVE,
    Permission.EXPERIMENT_FORK,
    Permission.EXPERIMENT_VIEW_OWN,
    Permission.EXPERIMENT_DELETE_OWN,
  ],
  [UserRole.EDUCATOR]: [
    Permission.SIMULATION_RUN,
    Permission.SIMULATION_EXPORT,
    Permission.EXPERIMENT_SAVE,
    Permission.EXPERIMENT_FORK,
    Permission.EXPERIMENT_VIEW_OWN,
    Permission.EXPERIMENT_DELETE_OWN,
    Permission.CLASSROOM_MANAGE,
    Permission.ASSIGNMENT_CREATE,
  ],
  [UserRole.RESEARCHER]: [
    Permission.SIMULATION_RUN,
    Permission.SIMULATION_EXPORT,
    Permission.EXPERIMENT_SAVE,
    Permission.EXPERIMENT_FORK,
    Permission.EXPERIMENT_VIEW_OWN,
    Permission.EXPERIMENT_DELETE_OWN,
  ],
  [UserRole.CREATOR]: [
    Permission.SIMULATION_RUN,
    Permission.SIMULATION_EXPORT,
    Permission.EXPERIMENT_SAVE,
    Permission.EXPERIMENT_FORK,
    Permission.EXPERIMENT_VIEW_OWN,
    Permission.EXPERIMENT_DELETE_OWN,
    Permission.SIMULATION_AUTHOR,
    Permission.SIMULATION_PUBLISH,
  ],
  [UserRole.MODERATOR]: [
    Permission.SIMULATION_RUN,
    Permission.SIMULATION_EXPORT,
    Permission.CONTENT_MODERATE,
  ],
  [UserRole.PLATFORM_ADMIN]: [
    Permission.SIMULATION_RUN,
    Permission.SIMULATION_EXPORT,
    Permission.EXPERIMENT_SAVE,
    Permission.EXPERIMENT_FORK,
    Permission.EXPERIMENT_VIEW_OWN,
    Permission.EXPERIMENT_DELETE_OWN,
    Permission.CLASSROOM_MANAGE,
    Permission.ASSIGNMENT_CREATE,
    Permission.SIMULATION_AUTHOR,
    Permission.SIMULATION_PUBLISH,
    Permission.CONTENT_MODERATE,
    Permission.USER_MANAGE,
    Permission.SYSTEM_ADMIN,
  ],
  [UserRole.PLATFORM_SUPER_ADMIN]: Object.values(Permission),
};

export interface AuthSession {
  readonly user: {
    readonly id: string;
    readonly email?: string;
    readonly name?: string;
    readonly role: UserRole;
    readonly organizationId?: string;
  };
  readonly expiresAt: string;
}

/**
 * Server-side authorization check.
 * Never trust roles sent from the client without server verification.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Resource-level ownership check.
 * Verifies if a user owns a resource or has administrative override privileges.
 */
export function canAccessResource(
  session: AuthSession | null,
  resourceOwnerId: string,
  isPublic: boolean = false,
): boolean {
  if (isPublic) return true;
  if (!session) return false;
  if (session.user.id === resourceOwnerId) return true;
  return hasPermission(session.user.role, Permission.SYSTEM_ADMIN);
}
