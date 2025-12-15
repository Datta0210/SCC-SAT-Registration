import { BranchContact, LocationEnum } from './types';

// IMPORTANT: REPLACE THIS URL WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx_PLACEHOLDER_FOR_YOUR_SCRIPT_ID/exec'; 

export const SCC_WEBSITE = 'https://www.shivchhatrapaticlasses.com/';
export const EXAM_DATE = '21 December 2025';
export const CONTACT_EMAIL = 'Shivchhatrapaticlasses@gmail.com';

export const BRANCHES: Record<LocationEnum, BranchContact> = {
  [LocationEnum.SATPUR]: {
    name: 'Satpur Branch (Main)',
    phones: ['7972229409'],
    address: 'Shivchhatrapati Classes, Korus Computers, 39, in front of Bagul Driving School, Ashoknagar, Satpur Colony, Nashik, Maharashtra 422012',
    mapLink: 'https://maps.app.goo.gl/iWEuyDNKwGksUAqQ8'
  },
  [LocationEnum.MERI]: {
    name: 'Meri Branch',
    phones: ['7276812377'],
    address: "'A' Wing, Shop No. 501 and 508, 5th Floor, Champa Business Square, RTO Corner, Near Raj Sweets, Meri Masarul, Nashik - 422004",
    mapLink: 'https://maps.app.goo.gl/CPo2cLBG4bL64dWG8'
  }
};

export const BENEFITS = [
  "Top 30 Students: 12th Standard completely FREE",
  "Exam Fee: 100% Free",
  "Every student receives a gift after appearing for exam",
  "Qualify as per SCC rules",
  "Student pays only 11th standard fees"
];

export const OFFERINGS = [
  "NEET Coaching",
  "JEE Coaching",
  "MHT-CET Coaching",
  "Maharashtra State Board Preparation"
];

export const ACHIEVEMENTS = [
  { icon: 'Trophy', title: 'AIR 1', subtitle: 'Chemistry Topper' },
  { icon: 'Stethoscope', title: '4 MBBS', subtitle: 'Govt Seats' },
  { icon: 'Leaf', title: '20+ BAMS', subtitle: 'Top Colleges' },
  { icon: 'BarChart3', title: '20+ CET', subtitle: '90%tile+' },
  { icon: 'Rocket', title: 'JEE Adv', subtitle: 'Qualified' },
  { icon: 'Star', title: '95%tile+', subtitle: 'JEE Mains 2025' }
];