import { Response } from 'express';
import VolunteerProfile, { getBadge } from '../models/VolunteerProfile';
import Need from '../models/Need';
import Assignment from '../models/Assignment';
import { matchVolunteers } from '../services/matchingService';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await VolunteerProfile.findOne({ userId: req.user?.id });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    const badge = getBadge(profile.socialCredits);
    res.json({ profile, badge });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await VolunteerProfile.findOneAndUpdate(
      { userId: req.user?.id },
      { ...req.body },
      { new: true, upsert: true }
    );
    const badge = getBadge(profile!.socialCredits);
    res.json({ profile, badge });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err });
  }
};

export const getMatchedNeeds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const openNeeds = await Need.find({ status: 'open' }).populate('orgId', 'name');
    const profile = await VolunteerProfile.findOne({ userId: req.user?.id });
    const myAssignments = await Assignment.find({ volunteerId: req.user?.id }).select('needId');
    const acceptedNeedIds = myAssignments.map(a => a.needId.toString());

    const scored = openNeeds.map(need => {
      const needSkills = need.skillsRequired.map(s => s.toLowerCase());
      const volSkills = (profile?.skills || []).map(s => s.toLowerCase());
      let skillMatch = 0;
      if (needSkills.length > 0) {
        const matched = volSkills.filter(s => needSkills.some(ns => ns.includes(s) || s.includes(ns)));
        skillMatch = Math.round((matched.length / needSkills.length) * 100);
      }
      return {
        need,
        matchPercent: skillMatch,
        isAccepted: acceptedNeedIds.includes(need._id.toString()),
      };
    });

    scored.sort((a, b) => b.matchPercent - a.matchPercent);
    res.json({ needs: scored });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch matched needs', error: err });
  }
};
