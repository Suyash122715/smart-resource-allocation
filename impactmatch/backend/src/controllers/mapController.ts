import { Response } from 'express';
import Need from '../models/Need';
import Assignment from '../models/Assignment';
import { AuthRequest } from '../middleware/auth';

const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'koramangala':     { lat: 12.9352, lng: 77.6245 },
  'indiranagar':     { lat: 12.9784, lng: 77.6408 },
  'whitefield':      { lat: 12.9698, lng: 77.7499 },
  'jayanagar':       { lat: 12.9308, lng: 77.5838 },
  'malleshwaram':    { lat: 13.0035, lng: 77.5640 },
  'electronic city': { lat: 12.8399, lng: 77.6770 },
  'hsr layout':      { lat: 12.9116, lng: 77.6389 },
  'jp nagar':        { lat: 12.9063, lng: 77.5857 },
  'bannerghatta':    { lat: 12.8005, lng: 77.5773 },
  'yelahanka':       { lat: 13.1004, lng: 77.5963 },
};

const URGENCY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function matchLocationKey(location: string): string | null {
  const lower = location.toLowerCase();
  for (const key of Object.keys(LOCATION_COORDS)) {
    if (lower.includes(key)) return key;
  }
  return null;
}

export const getMapData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Fetch all needs
    const needs = await Need.find({});

    // Fetch all confirmed assignments and populate needId to get location
    const assignments = await Assignment.find({ status: 'confirmed' }).populate('needId');

    // Group needs by matched location key
    type LocationBucket = {
      location: string;
      lat: number;
      lng: number;
      urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
      openNeeds: number;
      fulfilledNeeds: number;
      activeVolunteers: number;
      topUrgencyScore: number;
    };

    const buckets = new Map<string, LocationBucket>();

    for (const need of needs) {
      const key = matchLocationKey(need.location);
      if (!key) continue;

      const coords = LOCATION_COORDS[key];
      if (!buckets.has(key)) {
        buckets.set(key, {
          location: key,
          lat: coords.lat,
          lng: coords.lng,
          urgencyLevel: need.urgency,
          openNeeds: 0,
          fulfilledNeeds: 0,
          activeVolunteers: 0,
          topUrgencyScore: URGENCY_ORDER[need.urgency] ?? 1,
        });
      }

      const bucket = buckets.get(key)!;

      // Update highest urgency
      const score = URGENCY_ORDER[need.urgency] ?? 1;
      if (score > bucket.topUrgencyScore) {
        bucket.topUrgencyScore = score;
        bucket.urgencyLevel = need.urgency;
      }

      if (need.status === 'fulfilled') {
        bucket.fulfilledNeeds += 1;
      } else {
        bucket.openNeeds += 1;
      }
    }

    // Count active volunteers per location using populated assignment needIds
    for (const assignment of assignments) {
      const populatedNeed = assignment.needId as any;
      if (!populatedNeed?.location) continue;
      const key = matchLocationKey(populatedNeed.location);
      if (!key || !buckets.has(key)) continue;
      buckets.get(key)!.activeVolunteers += 1;
    }

    // Serialize and strip internal fields
    const result = Array.from(buckets.values()).map(({ topUrgencyScore: _s, ...rest }) => rest);

    res.json({ data: result });
  } catch (err) {
    console.error('Map data error:', err);
    res.status(500).json({ message: 'Failed to fetch map data' });
  }
};
