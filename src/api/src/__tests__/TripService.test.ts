import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripService } from '../services/TripService';
import { Trip, TripStatus, ChecklistItem } from '../models/Trip';
import { TravelSegment, TravelSegmentType } from '../models/TravelSegment';

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeChecklist = (): ChecklistItem[] => [
  { id: 'c1', label: 'Check gear', completed: false, order: 1 },
  { id: 'c2', label: 'Book flight', completed: false, order: 2 },
];

const makeTrip = (overrides: Partial<Trip> = {}): Trip => ({
  id: 'trip-abc-123',
  userId: 'user-456',
  name: 'Arizona Boogie 2026',
  status: TripStatus.PLANNED,
  startDate: '2026-03-01',
  endDate: '2026-03-10',
  segments: [],
  checklist: makeChecklist(),
  createdAt: '2025-12-01T00:00:00Z',
  updatedAt: '2025-12-01T00:00:00Z',
  ...overrides,
});

const makeSegment = (): TravelSegment => ({
  id: 'seg-existing-1',
  type: TravelSegmentType.FLIGHT,
  startDate: '2026-03-01',
  endDate: '2026-03-01',
  completed: false,
  createdAt: '2025-12-01T00:00:00Z',
  updatedAt: '2025-12-01T00:00:00Z',
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

// ── getTripById ───────────────────────────────────────────────────────────────

describe('TripService.getTripById', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: TripService;

  beforeEach(() => {
    container = makeContainerMock();
    const client = makeCosmosClientMock(container) as any;
    service = new TripService(client, 'TestDB');
  });

  it('returns trip when found', async () => {
    const trip = makeTrip();
    container.item.mockReturnValue({ read: vi.fn().mockResolvedValue({ resource: trip }) });

    const result = await service.getTripById('trip-abc-123', 'user-456');
    expect(result).toEqual(trip);
  });

  it('returns null on 404', async () => {
    container.item.mockReturnValue({ read: vi.fn().mockRejectedValue({ code: 404 }) });
    expect(await service.getTripById('nonexistent', 'user-456')).toBeNull();
  });

  it('throws on non-404 errors', async () => {
    container.item.mockReturnValue({
      read: vi.fn().mockRejectedValue(new Error('Service unavailable')),
    });
    await expect(service.getTripById('trip-abc-123', 'user-456')).rejects.toThrow('Service unavailable');
  });
});

// ── createTrip ────────────────────────────────────────────────────────────────

describe('TripService.createTrip', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: TripService;

  beforeEach(() => {
    container = makeContainerMock();
    const client = makeCosmosClientMock(container) as any;
    service = new TripService(client, 'TestDB');
  });

  it('creates a trip with default checklist items', async () => {
    const createdTrip = makeTrip();
    container.items.create.mockResolvedValue({ resource: createdTrip });

    let capturedTrip: Trip | undefined;
    container.items.create.mockImplementation(async (trip: Trip) => {
      capturedTrip = trip;
      return { resource: trip };
    });

    await service.createTrip('user-456', {
      name: 'Arizona Boogie 2026',
      startDate: '2026-03-01',
      endDate: '2026-03-10',
    });

    expect(capturedTrip?.name).toBe('Arizona Boogie 2026');
    expect(capturedTrip?.userId).toBe('user-456');
    expect(capturedTrip?.status).toBe(TripStatus.PLANNED);
    expect(capturedTrip?.id).toMatch(/^trip-/);
    expect(capturedTrip?.checklist.length).toBeGreaterThan(0);
    expect(capturedTrip?.segments).toEqual([]);
  });

  it('assigns unique ids to checklist items', async () => {
    container.items.create.mockImplementation(async (trip: Trip) => ({ resource: trip }));

    const result = await service.createTrip('user-456', {
      name: 'Test Trip',
      startDate: '2026-01-01',
      endDate: '2026-01-07',
    });

    const ids = result.checklist.map(item => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('throws when resource is not returned', async () => {
    container.items.create.mockResolvedValue({ resource: undefined });
    await expect(
      service.createTrip('user-456', { name: 'Trip', startDate: '2026-01-01', endDate: '2026-01-07' })
    ).rejects.toThrow('Failed to create trip');
  });
});

// ── updateTrip ────────────────────────────────────────────────────────────────

describe('TripService.updateTrip', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: TripService;
  let existingTrip: Trip;

  beforeEach(() => {
    existingTrip = makeTrip();
    container = makeContainerMock();
    container.item.mockReturnValue({
      read: vi.fn().mockResolvedValue({ resource: existingTrip }),
    });
    container.items.upsert.mockImplementation(async (t: Trip) => ({ resource: t }));
    const client = makeCosmosClientMock(container) as any;
    service = new TripService(client, 'TestDB');
  });

  it('updates trip name', async () => {
    const result = await service.updateTrip('trip-abc-123', 'user-456', { name: 'New Name' });
    expect(result.name).toBe('New Name');
  });

  it('updates status', async () => {
    const result = await service.updateTrip('trip-abc-123', 'user-456', { status: TripStatus.IN_PROGRESS });
    expect(result.status).toBe(TripStatus.IN_PROGRESS);
  });

  it('throws when trip not found', async () => {
    container.item.mockReturnValue({ read: vi.fn().mockRejectedValue({ code: 404 }) });
    await expect(
      service.updateTrip('nonexistent', 'user-456', { name: 'X' })
    ).rejects.toThrow('Trip not found');
  });

  it('throws when end date is before start date', async () => {
    await expect(
      service.updateTrip('trip-abc-123', 'user-456', { endDate: '2026-01-01', startDate: '2026-06-01' })
    ).rejects.toThrow('End date cannot be before start date');
  });

  it('updates updatedAt timestamp', async () => {
    const before = existingTrip.updatedAt;
    const result = await service.updateTrip('trip-abc-123', 'user-456', { name: 'Updated' });
    expect(result.updatedAt).not.toBe(before);
  });
});

// ── addTravelSegment ──────────────────────────────────────────────────────────

describe('TripService.addTravelSegment', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: TripService;
  let existingTrip: Trip;

  beforeEach(() => {
    existingTrip = makeTrip({ segments: [] });
    container = makeContainerMock();
    container.item.mockReturnValue({
      read: vi.fn().mockResolvedValue({ resource: existingTrip }),
    });
    container.items.upsert.mockImplementation(async (t: Trip) => ({ resource: t }));
    const client = makeCosmosClientMock(container) as any;
    service = new TripService(client, 'TestDB');
  });

  it('adds a new segment with a generated id', async () => {
    const result = await service.addTravelSegment('trip-abc-123', 'user-456', {
      type: TravelSegmentType.FLIGHT,
      startDate: '2026-03-01',
      endDate: '2026-03-01',
    });

    expect(result.segments.length).toBe(1);
    expect(result.segments[0].id).toMatch(/^seg-/);
    expect(result.segments[0].type).toBe(TravelSegmentType.FLIGHT);
  });

  it('throws when trip not found', async () => {
    container.item.mockReturnValue({ read: vi.fn().mockRejectedValue({ code: 404 }) });
    await expect(
      service.addTravelSegment('nonexistent', 'user-456', {
        type: TravelSegmentType.DRIVE,
        startDate: '2026-03-01',
        endDate: '2026-03-02',
      })
    ).rejects.toThrow('Trip not found');
  });

  it('sets completed to false for new segments', async () => {
    const result = await service.addTravelSegment('trip-abc-123', 'user-456', {
      type: TravelSegmentType.LODGING,
      startDate: '2026-03-01',
      endDate: '2026-03-07',
    });
    expect(result.segments[0].completed).toBe(false);
  });
});

// ── updateTravelSegment ───────────────────────────────────────────────────────

describe('TripService.updateTravelSegment', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: TripService;
  let existingTrip: Trip;

  beforeEach(() => {
    const segment = makeSegment();
    existingTrip = makeTrip({ segments: [segment] });
    container = makeContainerMock();
    container.item.mockReturnValue({
      read: vi.fn().mockResolvedValue({ resource: existingTrip }),
    });
    container.items.upsert.mockImplementation(async (t: Trip) => ({ resource: t }));
    const client = makeCosmosClientMock(container) as any;
    service = new TripService(client, 'TestDB');
  });

  it('updates segment notes', async () => {
    const result = await service.updateTravelSegment('trip-abc-123', 'user-456', 'seg-existing-1', {
      notes: 'Window seat preferred',
    });
    expect(result.segments[0].notes).toBe('Window seat preferred');
  });

  it('marks segment as completed', async () => {
    const result = await service.updateTravelSegment('trip-abc-123', 'user-456', 'seg-existing-1', {
      completed: true,
    });
    expect(result.segments[0].completed).toBe(true);
  });

  it('updates actualJumpCount', async () => {
    const result = await service.updateTravelSegment('trip-abc-123', 'user-456', 'seg-existing-1', {
      actualJumpCount: 12,
    });
    expect(result.segments[0].actualJumpCount).toBe(12);
  });

  it('throws when trip not found', async () => {
    container.item.mockReturnValue({ read: vi.fn().mockRejectedValue({ code: 404 }) });
    await expect(
      service.updateTravelSegment('nonexistent', 'user-456', 'seg-existing-1', { completed: true })
    ).rejects.toThrow('Trip not found');
  });

  it('throws when segment not found', async () => {
    await expect(
      service.updateTravelSegment('trip-abc-123', 'user-456', 'seg-unknown', { completed: true })
    ).rejects.toThrow('Travel segment not found');
  });
});

// ── deleteTravelSegment ───────────────────────────────────────────────────────

describe('TripService.deleteTravelSegment', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: TripService;

  beforeEach(() => {
    const trip = makeTrip({ segments: [makeSegment()] });
    container = makeContainerMock();
    container.item.mockReturnValue({
      read: vi.fn().mockResolvedValue({ resource: trip }),
    });
    container.items.upsert.mockImplementation(async (t: Trip) => ({ resource: t }));
    const client = makeCosmosClientMock(container) as any;
    service = new TripService(client, 'TestDB');
  });

  it('removes the segment from the trip', async () => {
    const result = await service.deleteTravelSegment('trip-abc-123', 'user-456', 'seg-existing-1');
    expect(result.segments.length).toBe(0);
  });

  it('throws when segment not found', async () => {
    await expect(
      service.deleteTravelSegment('trip-abc-123', 'user-456', 'seg-unknown')
    ).rejects.toThrow('Travel segment not found');
  });
});

// ── listTrips ─────────────────────────────────────────────────────────────────

describe('TripService.listTrips', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: TripService;

  beforeEach(() => {
    container = makeContainerMock();
    const client = makeCosmosClientMock(container) as any;
    service = new TripService(client, 'TestDB');
  });

  it('returns paginated results with correct metadata', async () => {
    const trips = Array.from({ length: 5 }, (_, i) =>
      makeTrip({ id: `trip-00${i}`, name: `Trip ${i}` })
    );
    container.items.query.mockReturnValue({
      fetchAll: vi.fn().mockResolvedValue({ resources: trips }),
    });

    const result = await service.listTrips({ userId: 'user-456', page: 1, pageSize: 3 });
    expect(result.trips.length).toBe(3);
    expect(result.totalCount).toBe(5);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(3);
  });

  it('applies offset for page 2', async () => {
    const trips = Array.from({ length: 5 }, (_, i) =>
      makeTrip({ id: `trip-00${i}`, name: `Trip ${i}` })
    );
    container.items.query.mockReturnValue({
      fetchAll: vi.fn().mockResolvedValue({ resources: trips }),
    });

    const result = await service.listTrips({ userId: 'user-456', page: 2, pageSize: 3 });
    expect(result.trips.length).toBe(2); // remaining 2 on page 2
    expect(result.page).toBe(2);
  });

  it('uses default page=1 and pageSize=30', async () => {
    container.items.query.mockReturnValue({
      fetchAll: vi.fn().mockResolvedValue({ resources: [] }),
    });

    const result = await service.listTrips({ userId: 'user-456' });
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(30);
  });
});

// ── updateChecklist ───────────────────────────────────────────────────────────

describe('TripService.updateChecklist', () => {
  let container: ReturnType<typeof makeContainerMock>;
  let service: TripService;
  let existingTrip: Trip;

  beforeEach(() => {
    existingTrip = makeTrip();
    container = makeContainerMock();
    container.item.mockReturnValue({
      read: vi.fn().mockResolvedValue({ resource: existingTrip }),
    });
    container.items.upsert.mockImplementation(async (t: Trip) => ({ resource: t }));
    const client = makeCosmosClientMock(container) as any;
    service = new TripService(client, 'TestDB');
  });

  it('replaces the checklist with the provided items', async () => {
    const newChecklist = [
      { id: 'c1', label: 'Check gear', completed: true, order: 1 },
      { id: 'c2', label: 'Book flight', completed: false, order: 2 },
    ];

    const result = await service.updateChecklist('trip-abc-123', 'user-456', newChecklist);
    expect(result.checklist).toEqual(newChecklist);
  });

  it('accepts an empty checklist array', async () => {
    const result = await service.updateChecklist('trip-abc-123', 'user-456', []);
    expect(result.checklist).toEqual([]);
  });

  it('updates the updatedAt timestamp', async () => {
    const before = existingTrip.updatedAt;
    const result = await service.updateChecklist('trip-abc-123', 'user-456', makeChecklist());
    expect(result.updatedAt).not.toBe(before);
  });

  it('throws when trip not found', async () => {
    container.item.mockReturnValue({ read: vi.fn().mockRejectedValue({ code: 404 }) });
    await expect(
      service.updateChecklist('nonexistent', 'user-456', [])
    ).rejects.toThrow('Trip not found');
  });

  it('throws when upsert fails to return resource', async () => {
    container.items.upsert.mockResolvedValue({ resource: undefined });
    await expect(
      service.updateChecklist('trip-abc-123', 'user-456', makeChecklist())
    ).rejects.toThrow('Failed to update checklist');
  });
});
