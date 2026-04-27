import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Organization from '../models/Organization';
import VolunteerProfile from '../models/VolunteerProfile';
import Need from '../models/Need';

dotenv.config();

const SKILLS_POOL = [
  'First Aid', 'Driving', 'Teaching', 'Medical', 'Cooking', 'Carpentry',
  'Counseling', 'Data Entry', 'Photography', 'Social Media', 'Translation',
  'Web Dev', 'Fundraising', 'Logistics', 'Construction',
];

const BANGALORE_AREAS = [
  'Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'Malleshwaram',
  'Electronic City', 'HSR Layout', 'JP Nagar', 'Bannerghatta', 'Yelahanka',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aultrix';
    console.log(`📡 Attempting to connect to MongoDB at: ${uri}...`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
    });
    
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Organization.deleteMany({});
    await VolunteerProfile.deleteMany({});
    await Need.deleteMany({});

    // Create admin
    const admin = await User.create({
      name: 'Priya Sharma',
      email: 'admin@aultrix.org',
      password: 'admin123',
      role: 'admin',
    });

    const org = await Organization.create({
      name: 'BangaloreAid NGO',
      adminUserId: admin._id,
      description: 'Coordinating relief efforts across Bangalore',
    });

    console.log('✅ Admin created: admin@aultrix.org / admin123');

    // Create volunteers
    const volunteerData = [
      { name: 'Arjun Reddy', email: 'arjun@email.com', skills: ['First Aid', 'Driving', 'Logistics'], location: 'Koramangala', availability: ['Saturday', 'Sunday'] },
      { name: 'Meera Iyer', email: 'meera@email.com', skills: ['Teaching', 'Counseling', 'Translation'], location: 'Indiranagar', availability: ['Monday', 'Wednesday', 'Friday'] },
      { name: 'Ravi Kumar', email: 'ravi@email.com', skills: ['Carpentry', 'Construction', 'Logistics'], location: 'Whitefield', availability: ['Saturday', 'Sunday'] },
      { name: 'Ananya Nair', email: 'ananya@email.com', skills: ['Medical', 'First Aid', 'Counseling'], location: 'Jayanagar', availability: ['Tuesday', 'Thursday', 'Saturday'] },
      { name: 'Vikram Bhat', email: 'vikram@email.com', skills: ['Driving', 'Logistics', 'Fundraising'], location: 'Malleshwaram', availability: ['Saturday', 'Sunday'] },
      { name: 'Divya Menon', email: 'divya@email.com', skills: ['Cooking', 'Fundraising', 'Photography'], location: 'HSR Layout', availability: ['Monday', 'Saturday', 'Sunday'] },
      { name: 'Suresh Babu', email: 'suresh@email.com', skills: ['Web Dev', 'Data Entry', 'Social Media'], location: 'Electronic City', availability: ['Wednesday', 'Friday', 'Saturday'] },
      { name: 'Kavya Rao', email: 'kavya@email.com', skills: ['Teaching', 'Photography', 'Social Media'], location: 'JP Nagar', availability: ['Tuesday', 'Thursday'] },
      { name: 'Arun Shetty', email: 'arun@email.com', skills: ['Driving', 'First Aid', 'Construction'], location: 'Bannerghatta', availability: ['Saturday', 'Sunday'] },
      { name: 'Lakshmi Prasad', email: 'lakshmi@email.com', skills: ['Counseling', 'Teaching', 'Translation'], location: 'Yelahanka', availability: ['Monday', 'Tuesday', 'Wednesday'] },
    ];

    for (const vd of volunteerData) {
      const user = await User.create({ name: vd.name, email: vd.email, password: 'volunteer123', role: 'volunteer' });
      await VolunteerProfile.create({
        userId: user._id,
        skills: vd.skills,
        availability: vd.availability,
        location: vd.location,
        socialCredits: Math.floor(Math.random() * 800),
        active: true,
      });
    }

    console.log('✅ 10 volunteers created (password: volunteer123)');

    // Create sample needs
    const needs = [
      {
        title: 'Flood Relief Volunteers Needed',
        description: 'Urgent help needed for flood-affected families in Koramangala. Drivers and first aid trained volunteers needed.',
        category: 'Disaster Relief',
        skillsRequired: ['Driving', 'First Aid', 'Logistics'],
        urgency: 'critical',
        location: 'Koramangala',
        schedule: 'This Saturday and Sunday',
        scheduleDays: ['Saturday', 'Sunday'],
      },
      {
        title: 'Free Medical Camp Volunteers',
        description: 'Monthly medical camp at Whitefield. Need medical professionals and general volunteers.',
        category: 'Medical',
        skillsRequired: ['Medical', 'First Aid'],
        urgency: 'high',
        location: 'Whitefield',
        schedule: 'Every second Saturday',
        scheduleDays: ['Saturday'],
      },
      {
        title: 'Rural Education Program',
        description: 'Teach basic numeracy and literacy to underprivileged kids in Bannerghatta.',
        category: 'Education',
        skillsRequired: ['Teaching', 'Counseling'],
        urgency: 'medium',
        location: 'Bannerghatta',
        schedule: 'Tuesdays and Thursdays',
        scheduleDays: ['Tuesday', 'Thursday'],
      },
    ];

    for (const need of needs) {
      await Need.create({ ...need, orgId: org._id });
    }

    console.log('✅ 3 sample needs created');
    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
