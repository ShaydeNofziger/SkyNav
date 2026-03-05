import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DropZoneService } from '../services/DropZoneService';
import { DropZone } from '../models/DropZone';

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeDropZone = (overrides: Partial<DropZone> = {}): DropZone => ({
  id: 'dz-eloy-az',
  name: 'Skydive Arizona',
  description: 'World-class facility in Eloy, AZ',
  isActive: true,
  location: { type: 'Point', coordinates: [-111.5496, 32.7498] },
  address: {
    street: '5600 N Toltec Rd',
    city: 'Eloy',
    state: 'AZ',
    zip: '85131',
    country: 'US',
  },
  facilities: {
    maxAltitude: 15000,
    aircraft: ['Twin Otter', 'Cessna 182'],
    hasOnSiteRigger: true,
    hasBunkhouse: true,
    hasRentalGear: true,
    hasCafeteria: true,
    hasShowers: true,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'admin-user',
  ...overrides,
});

const makeContainerMock = () => ({
  item: vi.fn(),
  items: {
    upsert: vi.fn(),
    delete: vi.fn(),
    query: vi.fn(),
  },
});

const makeCosmosClientMock = (containerMock: ReturnType<typeof makeContainerMock>) => ({
  database: vi.fn().mockReturnValue({
    container: vi.fn().mockReturnValue(containerMock),
  }),
});

// ── getDropZoneById ───────────────────────────────────────────────────────────

describe('DropZoneService.getDropZoneById', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: DropZoneService;

  beforeEach(() => {
    container = makeContainerMock();
    const client = makeCosmosClientMock(container) as any;
    service = new DropZoneService(client, 'TestDB');
  });

  it('returns dropzone when found', async () => {
    const dz = makeDropZone();
    container.item.mockReturnValue({ read: vi.fn().mockResolvedValue({ resource: dz }) });

    const result = await service.getDropZoneById('dz-eloy-az');
    expect(result).toEqual(dz);
  });

  it('returns null on 404', async () => {
    container.item.mockReturnValue({ read: vi.fn().mockRejectedValue({ code: 404 }) });
    expect(await service.getDropZoneById('nonexistent')).toBeNull();
  });

  it('throws on other errors', async () => {
    container.item.mockReturnValue({
      read: vi.fn().mockRejectedValue(new Error('Network error')),
    });
    await expect(service.getDropZoneById('dz-eloy-az')).rejects.toThrow('Network error');
  });
});

// ── upsertDropZone ────────────────────────────────────────────────────────────

describe('DropZoneService.upsertDropZone', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: DropZoneService;

  beforeEach(() => {
    container = makeContainerMock();
    const client = makeCosmosClientMock(container) as any;
    service = new DropZoneService(client, 'TestDB');
  });

  it('returns the upserted dropzone', async () => {
    const dz = makeDropZone();
    container.items.upsert.mockResolvedValue({ resource: dz });

    const result = await service.upsertDropZone(dz);
    expect(result).toEqual(dz);
  });

  it('throws when resource is not returned', async () => {
    container.items.upsert.mockResolvedValue({ resource: undefined });
    await expect(service.upsertDropZone(makeDropZone())).rejects.toThrow('Failed to upsert dropzone');
  });
});

// ── listDropZones ─────────────────────────────────────────────────────────────

describe('DropZoneService.listDropZones', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: DropZoneService;

  const makeDzList = (n: number) =>
    Array.from({ length: n }, (_, i) =>
      makeDropZone({ id: `dz-${i}`, name: `Dropzone ${i}` })
    );

  beforeEach(() => {
    container = makeContainerMock();
    const client = makeCosmosClientMock(container) as any;
    service = new DropZoneService(client, 'TestDB');
  });

  it('returns paginated results with correct metadata', async () => {
    container.items.query.mockReturnValue({
      fetchAll: vi.fn().mockResolvedValue({ resources: makeDzList(10) }),
    });

    const result = await service.listDropZones({ page: 1, pageSize: 5 });
    expect(result.dropzones.length).toBe(5);
    expect(result.totalCount).toBe(10);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(5);
    expect(result.hasMore).toBe(true);
  });

  it('sets hasMore to false on last page', async () => {
    container.items.query.mockReturnValue({
      fetchAll: vi.fn().mockResolvedValue({ resources: makeDzList(5) }),
    });

    const result = await service.listDropZones({ page: 1, pageSize: 10 });
    expect(result.hasMore).toBe(false);
  });

  it('returns empty results when no dropzones match', async () => {
    container.items.query.mockReturnValue({
      fetchAll: vi.fn().mockResolvedValue({ resources: [] }),
    });

    const result = await service.listDropZones();
    expect(result.dropzones).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it('defaults to page=1 and pageSize=30', async () => {
    container.items.query.mockReturnValue({
      fetchAll: vi.fn().mockResolvedValue({ resources: [] }),
    });

    const result = await service.listDropZones();
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(30);
  });
});
