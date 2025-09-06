export interface Signal {
  id: string;
  prospectName: string;
  company: string;
  title: string;
  signalType: 'funding' | 'hiring' | 'job_change' | 'tech_adoption' | 'intent';
  urgency: 'high' | 'medium' | 'low';
  industry: string;
  companySize: '1-50' | '51-200' | '201-1000' | '1000+';
  description: string;
  timestamp: Date;
  confidence: number; // 0-100
  actionTaken: boolean;
  isNew?: boolean; // For real-time updates
}

export interface FilterState {
  signalTypes: string[];
  urgencies: string[];
  industries: string[];
  companySizes: string[];
  searchQuery: string;
}

export interface SignalFilters {
  signalTypes: string[];
  urgencies: string[];
  industries: string[];
  companySizes: string[];
  searchQuery: string;
}

export const SIGNAL_TYPES = [
  { value: 'funding', label: 'Funding' },
  { value: 'hiring', label: 'Hiring' },
  { value: 'job_change', label: 'Job Change' },
  { value: 'tech_adoption', label: 'Tech Adoption' },
  { value: 'intent', label: 'Intent' },
] as const;

export const URGENCY_LEVELS = [
  { value: 'high', label: 'High', color: 'destructive' },
  { value: 'medium', label: 'Medium', color: 'default' },
  { value: 'low', label: 'Low', color: 'secondary' },
] as const;

export const COMPANY_SIZES = [
  { value: '1-50', label: '1-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-1000', label: '201-1000' },
  { value: '1000+', label: '1000+' },
] as const;

export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'SaaS',
  'Manufacturing',
  'Education',
  'Real Estate',
  'Media',
  'Consulting',
  'Retail',
  'Automotive',
  'Energy',
  'Telecommunications',
  'Transportation',
] as const;
