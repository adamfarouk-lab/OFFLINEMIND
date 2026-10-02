export type Guide = {
  slug: string;
  title: string;
  short: string;
  intro: string;
  experiencing: string;
  might: string;
  now: string[];
  days: string[];
  professional: string;
  urgent?: boolean;
  relatedSituations: string[];
  relatedResources: string[];
};

export type FeelingGuideData = {
  slug: string;
  label: string;
  title: string;
  shortDescription: string;
  introduction: string;
  whatMightBeHappening: string;
  thingsToTry: string[];
  nextFewDays: string[];
  professionalHelp: string;
  relatedSituations: string[];
  relatedTools: { label: string; href: string }[];
  urgentHelpRelevant: boolean;
  startingPoints?: string[];
};

export type Situation = {
  slug: string;
  title: string;
  short: string;
  might: string;
  now: string[];
  tryThis: string;
  questions: { question: string; answer: string }[];
  professional: string;
  urgent?: boolean;
};

export type Source = {
  title: string;
  organization: string;
  link: string;
  date?: string;
};

export type Topic = {
  slug: string;
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
  sources: Source[];
  lastReviewed: string;
  reviewStatus: 'needs-review' | 'reviewed';
  relatedTopics: string[];
  relatedTools: string[];
  relatedSituations: string[];
};

export type Resource = {
  name: string;
  type: string;
  scope?: string;
  city?: string;
  description?: string;
  address?: string;
  phone?: string;
  alternativePhone?: string;
  email?: string;
  officialUrl?: string;
  website?: string;
  availability?: string;
  services?: string[];
  languages?: string[];
  verificationStatus: 'verified' | 'Unverified placeholder';
  lastVerified: string | null;
  source: string | null;
  verificationDate?: string;
  status?: 'verified';
};