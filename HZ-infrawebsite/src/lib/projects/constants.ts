export type ProjectTypeKey = 'apartment' | 'villa' | 'venture' | 'villaplot';

export const TYPE_LABELS: Record<ProjectTypeKey, string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  venture: 'Venture / Plot',
  villaplot: 'Villa Plots',
};

export const TYPE_COLORS: Record<ProjectTypeKey, string> = {
  apartment: '#2563eb',
  villa: '#be185d',
  venture: '#ca8a04',
  villaplot: '#16a34a',
};

export const TYPE_BGS: Record<ProjectTypeKey, string> = {
  apartment: '#e8f1fd',
  villa: '#fce7f3',
  venture: '#fef3c7',
  villaplot: '#dcfce7',
};

export const TYPE_ICONS: Record<ProjectTypeKey, string> = {
  apartment: '🏢',
  villa: '🏡',
  venture: '🗺',
  villaplot: '🌿',
};

export const TYPE_FILTER_PILLS: { id: ProjectTypeKey | 'all'; label: string }[] = [
  { id: 'all', label: 'All types' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'villa', label: 'Villa' },
  { id: 'venture', label: 'Venture / Plotted' },
  { id: 'villaplot', label: 'Villa Plots' },
];

export const STATUS_LABELS: Record<string, string> = {
  'Under Construction': 'Under Construction',
  'Ready to Move': 'Ready to Move',
  'New Launch': 'New Launch',
  'Sold Out': 'Sold Out',
  uc: 'Under Construction',
  ready: 'Ready to Move',
  launch: 'New Launch',
  sold: 'Sold Out',
};

export const STATUS_CLASS: Record<string, string> = {
  'Under Construction': 'st-uc',
  'Ready to Move': 'st-ready',
  'New Launch': 'st-launch',
  'Sold Out': 'st-sold',
};

export const BANKS_GOV = ['SBI', 'Bank of Baroda', 'Canara Bank', 'PNB', 'UCO Bank', 'Bank of India'];
export const BANKS_PRIVATE = ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Yes Bank', 'Federal Bank', 'IndusInd'];
export const BANKS_NBFC = [
  'LIC Housing Finance',
  'PNB Housing',
  'Indiabulls Home Loans',
  'Bajaj Housing Finance',
  'IIFL Home Finance',
  'Tata Capital Housing',
];

export const AMENITIES_APT = [
  'Swimming Pool',
  'Gymnasium',
  'Covered Parking',
  'Clubhouse',
  '24hr Security',
  'Power Backup',
  'CCTV',
  'Children Play Area',
  'Vastu Compliant',
  'Lift / Elevator',
  'Jogging Track',
  'Tennis Court',
  'Badminton Court',
  'Indoor Games',
  'Party Hall',
  'Yoga / Meditation',
  'EV Charging',
  'Solar Panels',
  'Visitor Parking',
  'Amphitheatre',
];

export const AMENITIES_VILLA = [
  'Gated Community',
  'Clubhouse',
  'Swimming Pool',
  '24hr Security',
  'Landscaped Gardens',
  'Power Backup',
  'CCTV Surveillance',
  'Visitor Management',
  'Indoor Sports',
  'Vastu Compliant',
  'Rainwater Harvesting',
  'Tree-lined Roads',
  'Children Play Area',
  'Cycling Track',
];

export const INFRA_FEATURES = [
  'BT/CC Roads',
  'Underground Drainage',
  'EB Connection',
  'Streetlighting',
  'Compound Wall',
  'Water Sump',
  'Entrance Gate',
  'Gated Community',
  'CCTV at Entrance',
  'Borewell',
];
