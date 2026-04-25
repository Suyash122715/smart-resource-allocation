import { Request, Response } from 'express';
import { matchVolunteers } from '../services/matchingService';
import Assignment from '../models/Assignment';

export const getMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { needId } = req.params;
    const matches = await matchVolunteers(needId);

    // Get already accepted volunteers
    const accepted = await Assignment.find({ needId }).select('volunteerId status');
    const acceptedIds = accepted.map(a => a.volunteerId.toString());

    const enriched = matches.map(m => ({
      ...m,
      isAccepted: acceptedIds.includes(m.volunteerId),
      assignmentStatus: accepted.find(a => a.volunteerId.toString() === m.volunteerId)?.status || null,
    }));

    res.json({ matches: enriched });
  } catch (err) {
    res.status(500).json({ message: 'Matching failed', error: String(err) });
  }
};
