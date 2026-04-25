import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Organization from '../models/Organization';
import VolunteerProfile from '../models/VolunteerProfile';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string, role: string, name: string): string => {
  return jwt.sign({ id, role, name }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, organizationName } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const user = await User.create({ name, email, password, role });

    if (role === 'admin') {
      await Organization.create({
        name: organizationName || `${name}'s Organization`,
        adminUserId: user._id,
      });
    } else {
      await VolunteerProfile.create({
        userId: user._id,
        skills: [],
        availability: [],
        location: '',
        socialCredits: 0,
        active: true,
      });
    }

    const token = generateToken(user._id.toString(), user.role, user.name);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const token = generateToken(user._id.toString(), user.role, user.name);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err });
  }
};
