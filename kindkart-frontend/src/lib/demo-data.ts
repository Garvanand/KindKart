export interface DemoCommunityMembership {
  id: string;
  role: string;
  status: string;
  joinedAt: string;
  community: {
    id: string;
    name: string;
    inviteCode: string;
  };
}

export interface DemoRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  createdAt: string;
  communityId: string;
  requesterId: string;
  requester: {
    name: string;
    reputationScore: number;
  };
  responses: Array<{ id: string; helperId: string; message: string; status: string }>;
}

export interface DemoConversation {
  requestId: string;
  requestTitle: string;
  otherUser: { id: string; name: string; profilePhoto?: string };
  lastMessage: { content: string; senderName: string; createdAt: string } | null;
  updatedAt: string;
}

export interface DemoWalletTransaction {
  id: string;
  amount: number;
  status: string;
  type: 'payment' | 'earning';
  createdAt: string;
  description: string;
}

export const demoCommunityMemberships: DemoCommunityMembership[] = [
  {
    id: 'm1',
    role: 'member',
    status: 'approved',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    community: { id: 'c-greenwood', name: 'Greenwood Block C', inviteCode: 'GRN-C31' },
  },
  {
    id: 'm2',
    role: 'helper',
    status: 'approved',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    community: { id: 'c-riverside', name: 'Riverside Towers', inviteCode: 'RIV-44A' },
  },
  {
    id: 'm3',
    role: 'moderator',
    status: 'approved',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
    community: { id: 'c-sunrise', name: 'Sunrise Enclave', inviteCode: 'SUN-128' },
  },
];

export const demoRequests: DemoRequest[] = [
  {
    id: 'r1',
    title: 'Need help carrying groceries to 3rd floor',
    description: 'Two heavy bags from gate to flat. Elevator is under maintenance till evening.',
    category: 'home',
    status: 'pending',
    location: 'Greenwood Block C, Tower 2',
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    communityId: 'c-greenwood',
    requesterId: 'u-arpita',
    requester: { name: 'Arpita S.', reputationScore: 4.8 },
    responses: [{ id: 'rr1', helperId: 'u-samir', message: 'I can help in 15 minutes.', status: 'pending' }],
  },
  {
    id: 'r2',
    title: 'Router keeps disconnecting every 10 min',
    description: 'Internet drops repeatedly. Need someone who understands basic home networking.',
    category: 'technical',
    status: 'accepted',
    location: 'Riverside Towers, A-904',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    communityId: 'c-riverside',
    requesterId: 'u-rohan',
    requester: { name: 'Rohan M.', reputationScore: 4.5 },
    responses: [{ id: 'rr2', helperId: 'u-neha', message: 'Bringing a spare cable and tester.', status: 'accepted' }],
  },
  {
    id: 'r3',
    title: 'Post-op medicine pickup from pharmacy',
    description: 'Need medicine pickup today before 8 PM. Prescription will be shared on chat.',
    category: 'health',
    status: 'completed',
    location: 'Sunrise Enclave, B-1103',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    communityId: 'c-sunrise',
    requesterId: 'u-kavya',
    requester: { name: 'Kavya R.', reputationScore: 4.9 },
    responses: [{ id: 'rr3', helperId: 'u-aman', message: 'Done, delivered at 7:10 PM.', status: 'accepted' }],
  },
  {
    id: 'r4',
    title: 'Urgent: jump start for parked scooter',
    description: 'Scooter battery died near gate. Need jump start cables or quick mechanic advice.',
    category: 'emergency',
    status: 'pending',
    location: 'Greenwood main gate',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    communityId: 'c-greenwood',
    requesterId: 'u-nitin',
    requester: { name: 'Nitin P.', reputationScore: 4.2 },
    responses: [],
  },
  {
    id: 'r5',
    title: 'Need volunteer for kids science club setup',
    description: 'Looking for one person to help arrange tables and projector for Sunday event.',
    category: 'community',
    status: 'pending',
    location: 'Riverside common hall',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    communityId: 'c-riverside',
    requesterId: 'u-devika',
    requester: { name: 'Devika T.', reputationScore: 4.7 },
    responses: [{ id: 'rr5', helperId: 'u-jai', message: 'Can assist from 10 to 11 AM.', status: 'pending' }],
  },
];

export const demoConversations: DemoConversation[] = [
  {
    requestId: 'r1',
    requestTitle: 'Need help carrying groceries to 3rd floor',
    otherUser: { id: 'u-arpita', name: 'Arpita S.' },
    lastMessage: { content: 'I am at the gate now, can you come?', senderName: 'Arpita S.', createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
    updatedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    requestId: 'r2',
    requestTitle: 'Router keeps disconnecting every 10 min',
    otherUser: { id: 'u-rohan', name: 'Rohan M.' },
    lastMessage: { content: 'Issue is fixed. Thanks a lot!', senderName: 'Rohan M.', createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString() },
    updatedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    requestId: 'r3',
    requestTitle: 'Post-op medicine pickup from pharmacy',
    otherUser: { id: 'u-kavya', name: 'Kavya R.' },
    lastMessage: { content: 'Received everything. Really appreciate it.', senderName: 'Kavya R.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString() },
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
];

export const demoMessagesByRequest: Record<string, Array<{ id: string; content: string; sender: 'me' | 'other'; time: string }>> = {
  r1: [
    { id: 'm1', content: 'Hi, I can help. I am nearby.', sender: 'me', time: new Date(Date.now() - 1000 * 60 * 16).toISOString() },
    { id: 'm2', content: 'Great, thank you. I will wait near lift lobby.', sender: 'other', time: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
    { id: 'm3', content: 'Reached the gate. Coming up now.', sender: 'other', time: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
  ],
  r2: [
    { id: 'm4', content: 'Can you share your router model?', sender: 'me', time: new Date(Date.now() - 1000 * 60 * 140).toISOString() },
    { id: 'm5', content: 'TP-Link Archer C6.', sender: 'other', time: new Date(Date.now() - 1000 * 60 * 132).toISOString() },
    { id: 'm6', content: 'Try changing channel to 6 and reboot once.', sender: 'me', time: new Date(Date.now() - 1000 * 60 * 118).toISOString() },
  ],
};

export const demoWalletStats = {
  balance: 3860,
  pendingAmount: 420,
  totalEarned: 6240,
  totalSpent: 2380,
};

export const demoWalletTransactions: DemoWalletTransaction[] = [
  {
    id: 't1',
    type: 'earning',
    description: 'Escrow release: Router troubleshooting',
    amount: 450,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'completed',
  },
  {
    id: 't2',
    type: 'payment',
    description: 'Payment sent: Medicine pickup support',
    amount: 300,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    status: 'completed',
  },
  {
    id: 't3',
    type: 'earning',
    description: 'Escrow hold: Event setup volunteer',
    amount: 420,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    status: 'pending',
  },
  {
    id: 't4',
    type: 'earning',
    description: 'Escrow release: Grocery assistance',
    amount: 220,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 33).toISOString(),
    status: 'completed',
  },
];

export const demoGuestProfiles = [
  { name: 'Guest Asha', rank: 'Helpful Neighbor', xp: 120, level: 2, trustScore: 18 },
  { name: 'Guest Ravi', rank: 'Rising Helper', xp: 220, level: 3, trustScore: 29 },
  { name: 'Guest Meera', rank: 'Community Starter', xp: 80, level: 2, trustScore: 14 },
];

export function createDemoRequestsForCommunities(communityIds: string[]): DemoRequest[] {
  if (!communityIds.length) return demoRequests;
  const ids = new Set(communityIds);
  const filtered = demoRequests.filter((request) => ids.has(request.communityId));
  return filtered.length ? filtered : demoRequests;
}
