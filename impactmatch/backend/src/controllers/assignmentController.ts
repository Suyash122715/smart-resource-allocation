import { Response } from 'express';
import Assignment from '../models/Assignment';
import Need from '../models/Need';
import { matchVolunteers } from '../services/matchingService';
import { AuthRequest } from '../middleware/auth';

export const acceptAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { needId } = req.body;
    const volunteerId = req.user?.id;

    const need = await Need.findById(needId);
    if (!need || need.status === 'fulfilled') {
      res.status(400).json({ message: 'Need is not available' });
      return;
    }

    const existing = await Assignment.findOne({ needId, volunteerId });
    if (existing) {
      res.status(400).json({ message: 'Already accepted this task' });
      return;
    }

    // Get match score for this volunteer
    const matches = await matchVolunteers(needId);
    const myMatch = matches.find(m => m.volunteerId === volunteerId);
    const matchScore = myMatch?.matchScore || 0;

    const assignment = await Assignment.create({
      needId,
      volunteerId,
      matchScore,
      status: 'confirmed',
    });

    if (need.status === 'open') {
      need.status = 'assigned';
      await need.save();
    }

    res.status(201).json({ assignment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept task', error: err });
  }
};

export const getMyAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignments = await Assignment.find({ volunteerId: req.user?.id })
      .populate({
        path: 'needId',
        populate: { path: 'orgId', select: 'name' },
      })
      .sort({ assignedAt: -1 });

    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assignments', error: err });
  }
};
