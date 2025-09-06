import { Signal, SIGNAL_TYPES, URGENCY_LEVELS, COMPANY_SIZES, INDUSTRIES } from '@/types/signal';

// Sample data for generating realistic signals
const PROSPECT_NAMES = [
  'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Lisa Wang',
  'James Wilson', 'Maria Garcia', 'Robert Brown', 'Jennifer Lee', 'Christopher Davis',
  'Amanda Taylor', 'Daniel Martinez', 'Jessica Anderson', 'Matthew Thomas', 'Ashley Jackson',
  'Andrew White', 'Stephanie Harris', 'Kevin Martin', 'Nicole Thompson', 'Ryan Garcia',
  'Rachel Miller', 'Brandon Jones', 'Lauren Davis', 'Tyler Wilson', 'Megan Moore',
  'Justin Taylor', 'Samantha Anderson', 'Nathan Jackson', 'Brittany White', 'Zachary Harris',
  'Kayla Martin', 'Jordan Thompson', 'Alexis Garcia', 'Cameron Miller', 'Taylor Jones',
  'Morgan Davis', 'Hunter Wilson', 'Paige Moore', 'Blake Taylor', 'Sydney Anderson',
  'Connor Jackson', 'Madison White', 'Logan Harris', 'Chloe Martin', 'Noah Thompson',
  'Emma Garcia', 'Liam Miller', 'Olivia Jones', 'William Davis', 'Ava Wilson'
];

const COMPANY_NAMES = [
  'TechCorp', 'DataFlow', 'CloudSync', 'AI Solutions', 'NextGen Systems',
  'Digital Dynamics', 'InnovateLab', 'FutureTech', 'SmartData', 'CyberCore',
  'QuantumLeap', 'NexusTech', 'VelocitySoft', 'PrimeData', 'EliteSystems',
  'AlphaTech', 'BetaCorp', 'GammaSoft', 'DeltaData', 'EpsilonAI',
  'ZetaTech', 'EtaCorp', 'ThetaSoft', 'IotaData', 'KappaAI',
  'LambdaTech', 'MuCorp', 'NuSoft', 'XiData', 'OmicronAI',
  'PiTech', 'RhoCorp', 'SigmaSoft', 'TauData', 'UpsilonAI',
  'PhiTech', 'ChiCorp', 'PsiSoft', 'OmegaData', 'AlphaAI',
  'BetaTech', 'GammaCorp', 'DeltaSoft', 'EpsilonData', 'ZetaAI',
  'EtaTech', 'ThetaCorp', 'IotaSoft', 'KappaData', 'LambdaAI'
];

const JOB_TITLES = [
  'CEO', 'CTO', 'VP of Engineering', 'Head of Product', 'Director of Sales',
  'VP of Marketing', 'Chief Revenue Officer', 'Head of Operations', 'VP of Finance',
  'Director of Engineering', 'Product Manager', 'Engineering Manager', 'Sales Director',
  'Marketing Director', 'Operations Manager', 'Finance Director', 'Data Scientist',
  'AI Engineer', 'Software Engineer', 'DevOps Engineer', 'Product Owner',
  'Business Development Manager', 'Account Executive', 'Marketing Manager',
  'Operations Director', 'Financial Analyst', 'Research Scientist', 'ML Engineer',
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'QA Engineer',
  'Technical Lead', 'Scrum Master', 'UX Designer', 'UI Designer', 'Data Analyst',
  'Business Analyst', 'Project Manager', 'Customer Success Manager', 'Sales Manager'
];

const SIGNAL_DESCRIPTIONS = {
  funding: [
    'Company raised Series A funding of $5M',
    'Closed Series B round with $15M investment',
    'Secured $25M in Series C funding',
    'Announced $50M growth capital round',
    'Completed $10M seed funding round',
    'Raised $30M in Series D funding',
    'Closed $8M pre-seed round',
    'Secured $20M bridge funding',
    'Announced $100M Series E round',
    'Completed $12M convertible note'
  ],
  hiring: [
    'Hiring 50+ engineers for expansion',
    'Looking to hire 25 sales professionals',
    'Recruiting for 15 product managers',
    'Seeking 30 data scientists',
    'Hiring 20 marketing specialists',
    'Looking for 10 DevOps engineers',
    'Recruiting 40 customer success managers',
    'Seeking 35 AI/ML engineers',
    'Hiring 60 software developers',
    'Looking for 12 business analysts'
  ],
  job_change: [
    'New CTO joined from Google',
    'VP of Sales hired from Salesforce',
    'Head of Product moved from Microsoft',
    'CTO transitioned to CEO role',
    'New VP of Engineering from Amazon',
    'Director of Marketing joined from HubSpot',
    'Head of Operations from Uber',
    'VP of Finance from Stripe',
    'New CRO from LinkedIn',
    'Head of Data Science from Netflix'
  ],
  tech_adoption: [
    'Migrating to cloud infrastructure',
    'Implementing AI/ML solutions',
    'Adopting microservices architecture',
    'Moving to containerized deployment',
    'Implementing data analytics platform',
    'Adopting DevOps practices',
    'Migrating to modern frontend framework',
    'Implementing CI/CD pipeline',
    'Adopting serverless architecture',
    'Implementing real-time data processing'
  ],
  intent: [
    'Researching enterprise software solutions',
    'Evaluating CRM platforms',
    'Looking for marketing automation tools',
    'Seeking data analytics solutions',
    'Researching AI/ML platforms',
    'Evaluating cloud migration services',
    'Looking for customer support software',
    'Seeking project management tools',
    'Researching security solutions',
    'Evaluating API management platforms'
  ]
};

export function generateRandomSignal(): Signal {
  const signalType = SIGNAL_TYPES[Math.floor(Math.random() * SIGNAL_TYPES.length)].value;
  const urgency = URGENCY_LEVELS[Math.floor(Math.random() * URGENCY_LEVELS.length)].value;
  const companySize = COMPANY_SIZES[Math.floor(Math.random() * COMPANY_SIZES.length)].value;
  const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
  
  const prospectName = PROSPECT_NAMES[Math.floor(Math.random() * PROSPECT_NAMES.length)];
  const company = COMPANY_NAMES[Math.floor(Math.random() * COMPANY_NAMES.length)];
  const title = JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)];
  
  const descriptions = SIGNAL_DESCRIPTIONS[signalType];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  const confidence = Math.floor(Math.random() * 40) + 60; // 60-100
  const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
  
  return {
    id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    prospectName,
    company,
    title,
    signalType: signalType as Signal['signalType'],
    urgency: urgency as Signal['urgency'],
    industry,
    companySize: companySize as Signal['companySize'],
    description,
    timestamp,
    confidence,
    actionTaken: false,
    isNew: false
  };
}

export function generateSignals(count: number): Signal[] {
  try {
    if (count <= 0) return [];
    return Array.from({ length: count }, generateRandomSignal);
  } catch (error) {
    console.error('Error generating signals:', error);
    return [];
  }
}

export function getSignalTypeLabel(signalType: string): string {
  const type = SIGNAL_TYPES.find(t => t.value === signalType);
  return type?.label || signalType;
}

export function getUrgencyLabel(urgency: string): string {
  const level = URGENCY_LEVELS.find(u => u.value === urgency);
  return level?.label || urgency;
}

export function getUrgencyColor(urgency: string): string {
  const level = URGENCY_LEVELS.find(u => u.value === urgency);
  return level?.color || 'default';
}

export function getCompanySizeLabel(companySize: string): string {
  const size = COMPANY_SIZES.find(s => s.value === companySize);
  return size?.label || companySize;
}
