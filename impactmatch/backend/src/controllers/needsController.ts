import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Need from '../models/Need';
import Organization from '../models/Organization';
import Assignment from '../models/Assignment';
import VolunteerProfile, { getBadge } from '../models/VolunteerProfile';
import { AuthRequest } from '../middleware/auth';

// genAI is now initialized inside the controller functions to ensure the API key is loaded.

export const extractNeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ message: 'Text is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      res.status(500).json({ message: 'Gemini API key is missing. Please check your backend .env file.' });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest' });
    const prompt = `Extract structured volunteer need data from this text and return ONLY valid JSON (no markdown, no explanation):

Text: "${text}"

Return this exact JSON structure:
{
  "title": "short title for the need",
  "category": "one of: Disaster Relief, Medical, Education, Environment, Food, Elder Care, Animal Care, Community, Tech Support, Other",
  "skillsRequired": ["skill1", "skill2"],
  "urgency": "one of: critical, high, medium, low",
  "location": "city or area",
  "schedule": "date/time description",
  "scheduleDays": ["Monday", "Tuesday"] 
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text().trim();
    
    // Better JSON cleaning
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('AI returned invalid data format');
    }
    const cleaned = raw.substring(jsonStart, jsonEnd);
    const extracted = JSON.parse(cleaned);

    res.json({ extracted });
  } catch (err: any) {
    console.error('Gemini extraction error:', err);
    res.status(500).json({ 
      message: 'AI extraction failed', 
      error: err.message || String(err) 
    });
  }
};

export const createNeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = await Organization.findOne({ adminUserId: req.user?.id });
    if (!org) {
      res.status(404).json({ message: 'Organization not found' });
      return;
    }

    const need = await Need.create({ ...req.body, orgId: org._id });
    res.status(201).json({ need });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create need', error: err });
  }
};

export const getNeeds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let query: Record<string, unknown> = {};

    if (req.user?.role === 'admin') {
      const org = await Organization.findOne({ adminUserId: req.user.id });
      if (org) query.orgId = org._id;
    } else {
      query.status = 'open';
    }

    const needs = await Need.find(query).sort({ createdAt: -1 }).populate('orgId', 'name');
    res.json({ needs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch needs', error: err });
  }
};

export const getNeedById = async (req: Request, res: Response): Promise<void> => {
  try {
    const need = await Need.findById(req.params.id).populate('orgId', 'name');
    if (!need) {
      res.status(404).json({ message: 'Need not found' });
      return;
    }
    res.json({ need });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch need', error: err });
  }
};

export const fulfillNeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const need = await Need.findById(req.params.id);
    if (!need) {
      res.status(404).json({ message: 'Need not found' });
      return;
    }

    need.status = 'fulfilled';
    await need.save();

    // Award credits
    const creditMap: Record<string, number> = { critical: 500, high: 300, medium: 150, low: 75 };
    const credits = creditMap[need.urgency] || 75;

    const assignments = await Assignment.find({ needId: need._id, status: 'confirmed' });
    await Assignment.updateMany({ needId: need._id, status: 'confirmed' }, { status: 'completed' });

    for (const assignment of assignments) {
      await VolunteerProfile.findOneAndUpdate(
        { userId: assignment.volunteerId },
        { $inc: { socialCredits: credits } }
      );
    }

    res.json({ message: 'Task fulfilled and credits awarded', need, creditsAwarded: credits, volunteersRewarded: assignments.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fulfill need', error: err });
  }
};

export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = await Organization.findOne({ adminUserId: req.user?.id });
    if (!org) { res.json({ stats: {} }); return; }

    const total = await Need.countDocuments({ orgId: org._id });
    const open = await Need.countDocuments({ orgId: org._id, status: 'open' });
    const fulfilled = await Need.countDocuments({ orgId: org._id, status: 'fulfilled' });
    const critical = await Need.countDocuments({ orgId: org._id, urgency: 'critical', status: 'open' });

    const needIds = (await Need.find({ orgId: org._id }).select('_id')).map(n => n._id);
    const volunteersHelped = await Assignment.distinct('volunteerId', { needId: { $in: needIds }, status: 'completed' });

    res.json({ stats: { total, open, fulfilled, critical, volunteersHelped: volunteersHelped.length } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err });
  }
};
