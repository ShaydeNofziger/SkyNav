import { describe, it, expect } from 'vitest';
import { toTripSummaryDTO, toTripDetailDTO } from '../dtos/TripDTO';
import { Trip, TripStatus, ChecklistItem } from '../models/Trip';
import { TravelSegment, TravelSegmentType } from '../models/TravelSegment';

const makeChecklistItem = (id: string, completed: boolean): ChecklistItem => ({
  id,
  label: 'Check gear',
  completed,
  order: 1,
});

const makeSegment = (id: string, plannedJumps?: number, actualJumps?: number): TravelSegment => ({
  id,
  type: TravelSegmentType.FLIGHT,
  startDate: '2026-03-01',
  endDate: '2026-03-01',
  plannedJumpCount: plannedJumps,
  actualJumpCount: actualJumps,
  completed: false,
  createdAt: '2025-12-01T00:00:00Z',
  updatedAt: '2025-12-01T00:00:00Z',
});

const makeTrip = (overrides: Partial<Trip> = {}): Trip => ({
  id: 'trip-abc-123',
  userId: 'user-456',
  name: 'Arizona Boogie 2026',
  description: 'Fun boogie trip',
  status: TripStatus.PLANNED,
  startDate: '2026-03-01',
  endDate: '2026-03-10',
  segments: [],
  checklist: [],
  notes: 'Bring extra gear',
  createdAt: '2025-12-01T00:00:00Z',
  updatedAt: '2025-12-15T00:00:00Z',
  ...overrides,
});

describe('toTripSummaryDTO', () => {
  it('maps basic trip fields correctly', () => {
    const trip = makeTrip();
    const dto = toTripSummaryDTO(trip);

    expect(dto.id).toBe('trip-abc-123');
    expect(dto.name).toBe('Arizona Boogie 2026');
    expect(dto.status).toBe(TripStatus.PLANNED);
    expect(dto.startDate).toBe('2026-03-01');
    expect(dto.endDate).toBe('2026-03-10');
  });

  it('counts dropzones as number of segments', () => {
    const trip = makeTrip({ segments: [makeSegment('seg-1'), makeSegment('seg-2')] });
    const dto = toTripSummaryDTO(trip);
    expect(dto.dropzoneCount).toBe(2);
  });

  it('counts total jumps using actualJumpCount when available', () => {
    const trip = makeTrip({
      segments: [
        makeSegment('seg-1', 10, 8),  // actual=8
        makeSegment('seg-2', 5, 5),   // actual=5
      ],
    });
    const dto = toTripSummaryDTO(trip);
    expect(dto.totalJumps).toBe(13);
  });

  it('falls back to plannedJumpCount when actual is not set', () => {
    const trip = makeTrip({
      segments: [
        makeSegment('seg-1', 10),  // planned=10, no actual
        makeSegment('seg-2', 5, 0), // actual=0, treated as falsy
      ],
    });
    const dto = toTripSummaryDTO(trip);
    // seg-1: no actual -> uses planned (10); seg-2: actual=0 (falsy) -> uses planned (5)
    expect(dto.totalJumps).toBe(15);
  });

  it('reports zero totalJumps when no jump counts set', () => {
    const trip = makeTrip({ segments: [makeSegment('seg-1')] });
    const dto = toTripSummaryDTO(trip);
    expect(dto.totalJumps).toBe(0);
  });

  it('counts completed checklist items correctly', () => {
    const trip = makeTrip({
      checklist: [
        makeChecklistItem('c1', true),
        makeChecklistItem('c2', true),
        makeChecklistItem('c3', false),
        makeChecklistItem('c4', false),
      ],
    });
    const dto = toTripSummaryDTO(trip);
    expect(dto.completedChecklistItems).toBe(2);
    expect(dto.totalChecklistItems).toBe(4);
  });

  it('reports zeros for empty checklist', () => {
    const trip = makeTrip({ checklist: [] });
    const dto = toTripSummaryDTO(trip);
    expect(dto.completedChecklistItems).toBe(0);
    expect(dto.totalChecklistItems).toBe(0);
  });
});

describe('toTripDetailDTO', () => {
  it('maps all fields correctly', () => {
    const segment = makeSegment('seg-1');
    const checkItem = makeChecklistItem('c1', false);
    const trip = makeTrip({ segments: [segment], checklist: [checkItem] });

    const dto = toTripDetailDTO(trip);

    expect(dto.id).toBe('trip-abc-123');
    expect(dto.name).toBe('Arizona Boogie 2026');
    expect(dto.description).toBe('Fun boogie trip');
    expect(dto.status).toBe(TripStatus.PLANNED);
    expect(dto.startDate).toBe('2026-03-01');
    expect(dto.endDate).toBe('2026-03-10');
    expect(dto.notes).toBe('Bring extra gear');
    expect(dto.createdAt).toBe('2025-12-01T00:00:00Z');
    expect(dto.updatedAt).toBe('2025-12-15T00:00:00Z');
    expect(dto.segments).toEqual([segment]);
    expect(dto.checklist).toEqual([checkItem]);
  });

  it('handles optional fields being undefined', () => {
    const trip = makeTrip({ description: undefined, notes: undefined });
    const dto = toTripDetailDTO(trip);
    expect(dto.description).toBeUndefined();
    expect(dto.notes).toBeUndefined();
  });
});
