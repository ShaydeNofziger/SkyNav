import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../services/UserService';
import { User, UserRole, DEFAULT_USER_PREFERENCES } from '../models/User';

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-abc-123',
  email: 'jumper@example.com',
  emailVerified: true,
  roles: [UserRole.USER],
  profile: { displayName: 'Test Jumper' },
  preferences: { ...DEFAULT_USER_PREFERENCES },
  favoriteDropzoneIds: [],
  isActive: true,
  isBanned: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

const makeContainerMock = () => ({
  item: vi.fn(),
  items: {
    upsert: vi.fn(),
    create: vi.fn(),
    query: vi.fn(),
  },
});

const makeCosmosClientMock = (containerMock: ReturnType<typeof makeContainerMock>) => ({
  database: vi.fn().mockReturnValue({
    container: vi.fn().mockReturnValue(containerMock),
  }),
});

// ── getUserById ───────────────────────────────────────────────────────────────

describe('UserService.getUserById', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: UserService;

  beforeEach(() => {
    container = makeContainerMock();
    const client = makeCosmosClientMock(container) as any;
    service = new UserService(client, 'TestDB');
  });

  it('returns user when found', async () => {
    const user = makeUser();
    container.item.mockReturnValue({ read: vi.fn().mockResolvedValue({ resource: user }) });

    const result = await service.getUserById('user-abc-123');
    expect(result).toEqual(user);
  });

  it('returns null when user is not found (404)', async () => {
    container.item.mockReturnValue({
      read: vi.fn().mockRejectedValue({ code: 404 }),
    });

    const result = await service.getUserById('nonexistent');
    expect(result).toBeNull();
  });

  it('throws on non-404 errors', async () => {
    container.item.mockReturnValue({
      read: vi.fn().mockRejectedValue(new Error('Connection refused')),
    });

    await expect(service.getUserById('user-abc-123')).rejects.toThrow('Connection refused');
  });
});

// ── upsertUser ────────────────────────────────────────────────────────────────

describe('UserService.upsertUser', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: UserService;

  beforeEach(() => {
    container = makeContainerMock();
    const client = makeCosmosClientMock(container) as any;
    service = new UserService(client, 'TestDB');
  });

  it('returns the upserted user', async () => {
    const user = makeUser();
    container.items.upsert.mockResolvedValue({ resource: user });

    const result = await service.upsertUser(user);
    expect(result).toEqual(user);
  });

  it('throws when resource is not returned', async () => {
    container.items.upsert.mockResolvedValue({ resource: undefined });
    await expect(service.upsertUser(makeUser())).rejects.toThrow('Failed to upsert user');
  });
});

// ── createUserOnFirstLogin ────────────────────────────────────────────────────

describe('UserService.createUserOnFirstLogin', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: UserService;

  beforeEach(() => {
    container = makeContainerMock();
    const client = makeCosmosClientMock(container) as any;
    service = new UserService(client, 'TestDB');
  });

  it('returns existing user without creating a new one', async () => {
    const existing = makeUser({ id: 'existing-user' });
    container.item.mockReturnValue({
      read: vi.fn().mockResolvedValue({ resource: existing }),
    });

    const result = await service.createUserOnFirstLogin('existing-user', 'a@b.com', 'Alice');
    expect(result).toEqual(existing);
    expect(container.items.upsert).not.toHaveBeenCalled();
  });

  it('creates a new user when none exists', async () => {
    container.item.mockReturnValue({
      read: vi.fn().mockRejectedValue({ code: 404 }),
    });

    const newUser = makeUser({ id: 'new-user' });
    container.items.upsert.mockResolvedValue({ resource: newUser });

    const result = await service.createUserOnFirstLogin('new-user', 'new@example.com', 'New User');
    expect(container.items.upsert).toHaveBeenCalled();
    expect(result).toEqual(newUser);
  });

  it('creates user with provided email and name', async () => {
    container.item.mockReturnValue({
      read: vi.fn().mockRejectedValue({ code: 404 }),
    });

    let capturedUser: User | undefined;
    container.items.upsert.mockImplementation(async (user: User) => {
      capturedUser = user;
      return { resource: user };
    });

    await service.createUserOnFirstLogin('user-xyz', 'skydiver@dz.com', 'Sky Diver');

    expect(capturedUser?.email).toBe('skydiver@dz.com');
    expect(capturedUser?.profile.displayName).toBe('Sky Diver');
    expect(capturedUser?.roles).toEqual([UserRole.USER]);
    expect(capturedUser?.isActive).toBe(true);
    expect(capturedUser?.isBanned).toBe(false);
  });

  it('falls back to empty strings when email and name are not provided', async () => {
    container.item.mockReturnValue({
      read: vi.fn().mockRejectedValue({ code: 404 }),
    });

    let capturedUser: User | undefined;
    container.items.upsert.mockImplementation(async (user: User) => {
      capturedUser = user;
      return { resource: user };
    });

    await service.createUserOnFirstLogin('user-noemail');
    expect(capturedUser?.email).toBe('');
    expect(capturedUser?.profile.displayName).toBe('');
  });
});

// ── updateUserProfile ─────────────────────────────────────────────────────────

describe('UserService.updateUserProfile', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: UserService;
  let existingUser: User;

  beforeEach(() => {
    existingUser = makeUser();
    container = makeContainerMock();
    container.item.mockReturnValue({
      read: vi.fn().mockResolvedValue({ resource: existingUser }),
    });
    container.items.upsert.mockImplementation(async (u: User) => ({ resource: u }));
    const client = makeCosmosClientMock(container) as any;
    service = new UserService(client, 'TestDB');
  });

  it('throws when user is not found', async () => {
    container.item.mockReturnValue({
      read: vi.fn().mockRejectedValue({ code: 404 }),
    });
    await expect(service.updateUserProfile('nonexistent', { displayName: 'X' })).rejects.toThrow('User not found');
  });

  it('updates displayName', async () => {
    const result = await service.updateUserProfile('user-abc-123', { displayName: 'New Name' });
    expect(result.profile.displayName).toBe('New Name');
  });

  it('updates jumpCount', async () => {
    const result = await service.updateUserProfile('user-abc-123', { jumpCount: 750 });
    expect(result.profile.jumpCount).toBe(750);
  });

  it('updates licenses array', async () => {
    const result = await service.updateUserProfile('user-abc-123', { licenses: ['A', 'B', 'C'] });
    expect(result.profile.licenses).toEqual(['A', 'B', 'C']);
  });

  it('sets homeDropzoneId to undefined when null is passed', async () => {
    const result = await service.updateUserProfile('user-abc-123', { homeDropzoneId: null });
    expect(result.profile.homeDropzoneId).toBeUndefined();
  });

  it('updates updatedAt timestamp', async () => {
    const before = existingUser.updatedAt;
    const result = await service.updateUserProfile('user-abc-123', { firstName: 'Alice' });
    expect(result.updatedAt).not.toBe(before);
  });
});

// ── updateUserPreferences ─────────────────────────────────────────────────────

describe('UserService.updateUserPreferences', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: UserService;
  let existingUser: User;

  beforeEach(() => {
    existingUser = makeUser();
    container = makeContainerMock();
    container.item.mockReturnValue({
      read: vi.fn().mockResolvedValue({ resource: existingUser }),
    });
    container.items.upsert.mockImplementation(async (u: User) => ({ resource: u }));
    const client = makeCosmosClientMock(container) as any;
    service = new UserService(client, 'TestDB');
  });

  it('updates theme preference', async () => {
    const result = await service.updateUserPreferences('user-abc-123', { theme: 'dark' });
    expect(result.preferences.theme).toBe('dark');
  });

  it('updates measurementUnit', async () => {
    const result = await service.updateUserPreferences('user-abc-123', { measurementUnit: 'metric' });
    expect(result.preferences.measurementUnit).toBe('metric');
  });

  it('updates travelModeEnabled', async () => {
    const result = await service.updateUserPreferences('user-abc-123', { travelModeEnabled: true });
    expect(result.preferences.travelModeEnabled).toBe(true);
  });

  it('throws when user not found', async () => {
    container.item.mockReturnValue({ read: vi.fn().mockRejectedValue({ code: 404 }) });
    await expect(
      service.updateUserPreferences('nonexistent', { theme: 'dark' })
    ).rejects.toThrow('User not found');
  });
});

// ── favorites ─────────────────────────────────────────────────────────────────

describe('UserService.addFavoriteDropzone', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: UserService;
  let existingUser: User;

  beforeEach(() => {
    existingUser = makeUser({ favoriteDropzoneIds: [] });
    container = makeContainerMock();
    container.item.mockReturnValue({
      read: vi.fn().mockResolvedValue({ resource: existingUser }),
    });
    container.items.upsert.mockImplementation(async (u: User) => ({ resource: u }));
    const client = makeCosmosClientMock(container) as any;
    service = new UserService(client, 'TestDB');
  });

  it('adds a new dropzone to favorites', async () => {
    const result = await service.addFavoriteDropzone('user-abc-123', 'dz-eloy');
    expect(result.favoriteDropzoneIds).toContain('dz-eloy');
  });

  it('does not add duplicate favorites', async () => {
    existingUser.favoriteDropzoneIds = ['dz-eloy'];
    const result = await service.addFavoriteDropzone('user-abc-123', 'dz-eloy');
    expect(result.favoriteDropzoneIds.filter(id => id === 'dz-eloy').length).toBe(1);
    expect(container.items.upsert).not.toHaveBeenCalled();
  });
});

describe('UserService.removeFavoriteDropzone', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: UserService;
  let existingUser: User;

  beforeEach(() => {
    existingUser = makeUser({ favoriteDropzoneIds: ['dz-eloy', 'dz-perris'] });
    container = makeContainerMock();
    container.item.mockReturnValue({
      read: vi.fn().mockResolvedValue({ resource: existingUser }),
    });
    container.items.upsert.mockImplementation(async (u: User) => ({ resource: u }));
    const client = makeCosmosClientMock(container) as any;
    service = new UserService(client, 'TestDB');
  });

  it('removes an existing favorite', async () => {
    const result = await service.removeFavoriteDropzone('user-abc-123', 'dz-eloy');
    expect(result.favoriteDropzoneIds).not.toContain('dz-eloy');
    expect(result.favoriteDropzoneIds).toContain('dz-perris');
  });

  it('returns user unchanged when dropzone is not in favorites', async () => {
    const result = await service.removeFavoriteDropzone('user-abc-123', 'dz-unknown');
    expect(result.favoriteDropzoneIds).toEqual(['dz-eloy', 'dz-perris']);
    expect(container.items.upsert).not.toHaveBeenCalled();
  });
});
