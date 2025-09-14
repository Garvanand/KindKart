// Help Request Categories
export const HELP_REQUEST_CATEGORIES = [
  {
    id: 'groceries',
    name: 'Groceries',
    description: 'Help with grocery shopping, delivery, or pickup',
    icon: '🛒',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'repairs',
    name: 'Home Repairs',
    description: 'Minor repairs, maintenance, or handyman services',
    icon: '🔧',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'babysitting',
    name: 'Childcare',
    description: 'Babysitting, child supervision, or childcare help',
    icon: '👶',
    color: 'bg-pink-100 text-pink-800'
  },
  {
    id: 'transportation',
    name: 'Transportation',
    description: 'Rides, carpooling, or transportation assistance',
    icon: '🚗',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'petcare',
    name: 'Pet Care',
    description: 'Pet sitting, walking, or pet-related assistance',
    icon: '🐕',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'eldercare',
    name: 'Elder Care',
    description: 'Assistance for elderly community members',
    icon: '👴',
    color: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'technology',
    name: 'Technology Help',
    description: 'Tech support, device setup, or digital assistance',
    icon: '💻',
    color: 'bg-cyan-100 text-cyan-800'
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    description: 'House cleaning, yard work, or maintenance',
    icon: '🧹',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Other types of assistance or help',
    icon: '🤝',
    color: 'bg-gray-100 text-gray-800'
  }
] as const;

export const REQUEST_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const PRIVACY_LEVELS = {
  COMMUNITY: 'community',
  PUBLIC: 'public'
} as const;

export type HelpRequestCategory = typeof HELP_REQUEST_CATEGORIES[number]['id'];
export type RequestStatus = typeof REQUEST_STATUSES[keyof typeof REQUEST_STATUSES];
export type PrivacyLevel = typeof PRIVACY_LEVELS[keyof typeof PRIVACY_LEVELS];
