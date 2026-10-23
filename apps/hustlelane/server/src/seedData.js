import { User } from './models/User.js';
import { Opportunity } from './models/Opportunity.js';
import { Application } from './models/Application.js';
import { Notification } from './models/Notification.js';

/** Idempotent-ish seed used by CLI and boot-time empty DB fill */
export async function seedDatabase({ wipe = true } = {}) {
  if (wipe) {
    await Promise.all([
      User.deleteMany({}),
      Opportunity.deleteMany({}),
      Application.deleteMany({}),
      Notification.deleteMany({}),
    ]);
  }

  const existing = await User.countDocuments();
  if (!wipe && existing > 0) {
    return { skipped: true, users: existing };
  }

  const [seeker, poster, poster2] = await User.create([
    {
      name: 'Nomsa Khumalo',
      email: 'nomsa@hustlelane.dev',
      password: 'demo1234',
      role: 'seeker',
      headline: 'Aspiring fullstack developer · Wits student',
      skills: ['JavaScript', 'React', 'Java'],
      metro: 'Braamfontein',
      province: 'Gauteng',
      whatsapp: '27821234567',
      avatarColor: '#F4A261',
    },
    {
      name: 'Kagiso Mokoena',
      email: 'kagiso@hustlelane.dev',
      password: 'demo1234',
      role: 'poster',
      headline: 'Talent lead · township tech hub',
      metro: 'Soweto',
      province: 'Gauteng',
      whatsapp: '27829876543',
      avatarColor: '#2A9D8F',
    },
    {
      name: 'Farah Jacobs',
      email: 'farah@hustlelane.dev',
      password: 'demo1234',
      role: 'poster',
      headline: 'Hiring for Cape Town startups',
      metro: 'Cape Town',
      province: 'Western Cape',
      avatarColor: '#E76F51',
    },
  ]);

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 21);

  await Opportunity.create([
    {
      title: 'Junior React Intern — load-shedding resilient team',
      company: 'Jozi Byte Collective',
      description:
        'Build UI for community apps. Async-first culture with offline-friendly workflows when Stage 4 hits. Ideal for students who already ship side projects.',
      type: 'internship',
      province: 'Gauteng',
      metro: 'Braamfontein',
      remote: true,
      stipendZar: 4500,
      loadSheddingFriendly: true,
      tags: ['react', 'junior', 'hybrid'],
      whatsappContact: '27829876543',
      deadline,
      postedBy: poster._id,
    },
    {
      title: 'IT Learnership — hardware + helpdesk',
      company: 'Soweto Skills Lab',
      description:
        '12-month learnership covering PC hardware, ticketing, and customer support. Travel stipend for taxi routes within Greater Joburg.',
      type: 'learnership',
      province: 'Gauteng',
      metro: 'Soweto',
      remote: false,
      stipendZar: 3500,
      loadSheddingFriendly: true,
      tags: ['hardware', 'support', 'NQF'],
      whatsappContact: '27829876543',
      deadline,
      postedBy: poster._id,
    },
    {
      title: 'Weekend gig: event check-in app demo',
      company: 'Cape Flats Creatives',
      description:
        'Need a React demo for a weekend market check-in flow. WhatsApp handoff preferred. Pay on delivery.',
      type: 'gig',
      province: 'Western Cape',
      metro: 'Cape Town',
      remote: true,
      stipendZar: 2500,
      loadSheddingFriendly: false,
      tags: ['react', 'weekend', 'contract'],
      whatsappContact: '27821112222',
      deadline,
      postedBy: poster2._id,
    },
    {
      title: 'CSIR-aligned bursary support track (demo)',
      company: 'Future Coders SA',
      description:
        'Demo bursary listing for portfolio. Mentorship + device allowance for first-year IT students.',
      type: 'bursary',
      province: 'Gauteng',
      metro: 'Pretoria',
      remote: false,
      unpaid: true,
      stipendZar: 0,
      tags: ['bursary', 'students'],
      deadline,
      postedBy: poster2._id,
    },
    {
      title: 'Entry-level QA tester',
      company: 'Durban Softworks',
      description: 'Manual QA on mobile web apps. Training provided. Office days optional during high stages.',
      type: 'entry-level',
      province: 'KwaZulu-Natal',
      metro: 'Durban',
      remote: true,
      stipendZar: 8000,
      loadSheddingFriendly: true,
      tags: ['qa', 'junior'],
      deadline,
      postedBy: poster2._id,
    },
  ]);

  return { skipped: false, users: 3, seeker: seeker.email, poster: poster.email };
}
