import { describe, it, expect } from 'vitest';
import { hasRole, requireAdmin, AuthenticatedUser } from '../middleware/auth';

const makeUser = (roles: string[]): AuthenticatedUser => ({
  userId: 'user-123',
  email: 'pilot@example.com',
  name: 'Test Pilot',
  roles,
});

describe('hasRole', () => {
  it('returns true when user has the specified role', () => {
    const admin = makeUser(['admin', 'user']);
    expect(hasRole(admin, 'admin')).toBe(true);
    expect(hasRole(admin, 'user')).toBe(true);
  });

  it('returns false when user does not have the specified role', () => {
    const user = makeUser(['user']);
    expect(hasRole(user, 'admin')).toBe(false);
    expect(hasRole(user, 'superuser')).toBe(false);
  });

  it('returns false when user has no roles', () => {
    const noRoles = makeUser([]);
    expect(hasRole(noRoles, 'user')).toBe(false);
  });

  it('is case-sensitive', () => {
    const user = makeUser(['Admin']);
    expect(hasRole(user, 'admin')).toBe(false);
    expect(hasRole(user, 'Admin')).toBe(true);
  });
});

describe('requireAdmin', () => {
  it('does not throw when user has admin role', () => {
    const admin = makeUser(['admin']);
    expect(() => requireAdmin(admin)).not.toThrow();
  });

  it('does not throw when user has multiple roles including admin', () => {
    const adminUser = makeUser(['user', 'admin']);
    expect(() => requireAdmin(adminUser)).not.toThrow();
  });

  it('throws when user only has user role', () => {
    const regularUser = makeUser(['user']);
    expect(() => requireAdmin(regularUser)).toThrow('Admin role required');
  });

  it('throws when user has no roles', () => {
    const noRoles = makeUser([]);
    expect(() => requireAdmin(noRoles)).toThrow('Admin role required');
  });

  it('throws with the correct error message', () => {
    const user = makeUser(['user']);
    expect(() => requireAdmin(user)).toThrow('Admin role required');
  });
});
