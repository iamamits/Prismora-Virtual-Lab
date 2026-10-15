import { describe, it, expect } from 'vitest';
import { UserRole, Permission, hasPermission, canAccessResource, type AuthSession } from '../roles';

describe('RBAC & Permission System', () => {
  it('ANONYMOUS users should have simulation:run and simulation:export permissions', () => {
    expect(hasPermission(UserRole.ANONYMOUS, Permission.SIMULATION_RUN)).toBe(true);
    expect(hasPermission(UserRole.ANONYMOUS, Permission.SIMULATION_EXPORT)).toBe(true);
  });

  it('ANONYMOUS users should NOT have save or admin permissions', () => {
    expect(hasPermission(UserRole.ANONYMOUS, Permission.EXPERIMENT_SAVE)).toBe(false);
    expect(hasPermission(UserRole.ANONYMOUS, Permission.SYSTEM_ADMIN)).toBe(false);
  });

  it('STUDENT should be able to save and view own experiments', () => {
    expect(hasPermission(UserRole.STUDENT, Permission.EXPERIMENT_SAVE)).toBe(true);
    expect(hasPermission(UserRole.STUDENT, Permission.EXPERIMENT_VIEW_OWN)).toBe(true);
  });

  it('STUDENT should NOT be able to manage classrooms or administer system', () => {
    expect(hasPermission(UserRole.STUDENT, Permission.CLASSROOM_MANAGE)).toBe(false);
    expect(hasPermission(UserRole.STUDENT, Permission.SYSTEM_ADMIN)).toBe(false);
  });

  it('EDUCATOR should be able to manage classrooms and assignments', () => {
    expect(hasPermission(UserRole.EDUCATOR, Permission.CLASSROOM_MANAGE)).toBe(true);
    expect(hasPermission(UserRole.EDUCATOR, Permission.ASSIGNMENT_CREATE)).toBe(true);
  });

  it('PLATFORM_ADMIN should have system administration access', () => {
    expect(hasPermission(UserRole.PLATFORM_ADMIN, Permission.SYSTEM_ADMIN)).toBe(true);
    expect(hasPermission(UserRole.PLATFORM_ADMIN, Permission.USER_MANAGE)).toBe(true);
  });

  it('PLATFORM_SUPER_ADMIN should have all permissions', () => {
    for (const perm of Object.values(Permission)) {
      expect(hasPermission(UserRole.PLATFORM_SUPER_ADMIN, perm)).toBe(true);
    }
  });

  describe('canAccessResource', () => {
    const studentSession: AuthSession = {
      user: { id: 'usr-123', role: UserRole.STUDENT },
      expiresAt: '2026-12-31T00:00:00Z',
    };

    const adminSession: AuthSession = {
      user: { id: 'usr-admin', role: UserRole.PLATFORM_ADMIN },
      expiresAt: '2026-12-31T00:00:00Z',
    };

    it('should allow public access to public resources without session', () => {
      expect(canAccessResource(null, 'usr-123', true)).toBe(true);
    });

    it('should deny non-public access when session is null', () => {
      expect(canAccessResource(null, 'usr-123', false)).toBe(false);
    });

    it('should allow owner to access their private resource', () => {
      expect(canAccessResource(studentSession, 'usr-123', false)).toBe(true);
    });

    it('should deny non-owner without admin rights', () => {
      expect(canAccessResource(studentSession, 'usr-456', false)).toBe(false);
    });

    it('should allow platform admin to access non-owned private resource', () => {
      expect(canAccessResource(adminSession, 'usr-456', false)).toBe(true);
    });
  });
});
