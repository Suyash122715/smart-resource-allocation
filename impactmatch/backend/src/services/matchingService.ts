import Need from '../models/Need';
import VolunteerProfile from '../models/VolunteerProfile';
import User from '../models/User';

const urgencyWeights: Record<string, number> = {
  critical: 1.0,
  high: 0.66,
  medium: 0.33,
  low: 0.16,
};

export interface MatchResult {
  volunteerId: string;
  name: string;
  email: string;
  skills: string[];
  location: string;
  availability: string[];
  socialCredits: number;
  matchScore: number;
  skillScore: number;
  locationScore: number;
  availabilityScore: number;
  urgencyScore: number;
}

export const matchVolunteers = async (needId: string): Promise<MatchResult[]> => {
  const need = await Need.findById(needId);
  if (!need) throw new Error('Need not found');

  const profiles = await VolunteerProfile.find({ active: true }).populate('userId', 'name email');

  const results: MatchResult[] = [];

  for (const profile of profiles) {
    const user = profile.userId as unknown as { _id: string; name: string; email: string };
    if (!user) continue;

    // Skill overlap score (0-1)
    const needSkills = need.skillsRequired.map(s => s.toLowerCase());
    const volSkills = profile.skills.map(s => s.toLowerCase());
    let skillScore = 0;
    if (needSkills.length > 0) {
      const matched = volSkills.filter(s => needSkills.some(ns => ns.includes(s) || s.includes(ns)));
      skillScore = matched.length / needSkills.length;
      skillScore = Math.min(skillScore, 1);
    } else {
      skillScore = 0.5;
    }

    // Location score (0-1)
    let locationScore = 0;
    if (profile.location && need.location) {
      const profileLoc = profile.location.toLowerCase();
      const needLoc = need.location.toLowerCase();
      if (profileLoc === needLoc) locationScore = 1;
      else if (profileLoc.includes(needLoc) || needLoc.includes(profileLoc)) locationScore = 0.75;
      else locationScore = 0.1;
    } else {
      locationScore = 0.3;
    }

    // Availability overlap score (0-1)
    const needDays = need.scheduleDays.map(d => d.toLowerCase());
    const volAvail = profile.availability.map(d => d.toLowerCase());
    let availabilityScore = 0;
    if (needDays.length > 0 && volAvail.length > 0) {
      const matched = needDays.filter(d => volAvail.includes(d));
      availabilityScore = matched.length / needDays.length;
    } else {
      availabilityScore = 0.5;
    }

    // Urgency bonus
    const urgencyScore = urgencyWeights[need.urgency] || 0.33;

    // Final weighted score
    const matchScore = (skillScore * 0.4 + locationScore * 0.25 + availabilityScore * 0.2 + urgencyScore * 0.15) * 100;

    results.push({
      volunteerId: user._id.toString(),
      name: user.name,
      email: user.email,
      skills: profile.skills,
      location: profile.location,
      availability: profile.availability,
      socialCredits: profile.socialCredits,
      matchScore: Math.round(matchScore * 10) / 10,
      skillScore: Math.round(skillScore * 100),
      locationScore: Math.round(locationScore * 100),
      availabilityScore: Math.round(availabilityScore * 100),
      urgencyScore: Math.round(urgencyScore * 100),
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 20);
};
