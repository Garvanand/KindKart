'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { PageHeader, PageSection, ContainerGrid } from '@/components/ui-kit';
import { RequestCard, RequestsGrid, RequestFilterBar } from '@/components/requests';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface Request {
  id: string;
  title: string;
  description: string;
  category: 'home' | 'technical' | 'personal' | 'professional' | 'emergency' | 'health';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  trustRequired?: number;
  reward?: number;
  location?: string;
  postedBy: { name: string; rating: number };
  completionRate?: number;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  postedTime: string;
}

// Mock data - replace with API call
const mockRequests: Request[] = [
  {
    id: '1',
    title: 'Help with Home Painting',
    description: 'Looking for someone to help paint the living room walls. Professional experience preferred.',
    category: 'home',
    urgency: 'high',
    trustRequired: 3.5,
    reward: 500,
    location: 'Block A, Sector 7',
    postedBy: { name: 'Raj Patel', rating: 4.8 },
    status: 'open',
    postedTime: '2 hours ago',
  },
  {
    id: '2',
    title: 'WiFi Router Setup',
    description: 'Having issues with WiFi connectivity. Need help setting up the new router.',
    category: 'technical',
    urgency: 'medium',
    trustRequired: 3.0,
    reward: 200,
    location: 'Block B, Sector 8',
    postedBy: { name: 'Priya Singh', rating: 4.6 },
    status: 'open',
    postedTime: '45 min ago',
  },
  {
    id: '3',
    title: 'Piano Lessons for Kids',
    description: 'Looking for a piano teacher for my 8-year-old. Beginner level.',
    category: 'personal',
    urgency: 'low',
    trustRequired: 4.0,
    reward: 300,
    location: 'Block C, Sector 9',
    postedBy: { name: 'Anjali Verma', rating: 5.0 },
    status: 'open',
    postedTime: '3 hours ago',
  },
  {
    id: '4',
    title: 'Medical Emergency - First Aid',
    description: 'Immediate assistance needed. Minor injury requiring first aid attention.',
    category: 'emergency',
    urgency: 'urgent',
    reward: 1000,
    location: 'Block A, Sector 7',
    postedBy: { name: 'Dr. Kumar', rating: 4.9 },
    status: 'in-progress',
    postedTime: '15 min ago',
  },
  {
    id: '5',
    title: 'Tax Filing Assistance',
    description: 'Need help understanding ITR filing process for freelancers.',
    category: 'professional',
    urgency: 'medium',
    trustRequired: 4.5,
    reward: 800,
    location: 'Online',
    postedBy: { name: 'Vikram Nair', rating: 4.7 },
    status: 'open',
    postedTime: '1 hour ago',
  },
  {
    id: '6',
    title: 'Grocery Shopping Help',
    description: 'Senior citizen needs help with weekly grocery shopping.',
    category: 'personal',
    urgency: 'low',
    reward: 150,
    location: 'Block D, Sector 10',
    postedBy: { name: 'Mrs. Sharma', rating: 4.4 },
    status: 'completed',
    postedTime: 'Yesterday',
  },
];

export default function RequestsFeed() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return mockRequests.filter((request) => {
      if (selectedCategory && request.category !== selectedCategory) return false;
      if (selectedUrgency && request.urgency !== selectedUrgency) return false;
      if (selectedStatus && request.status !== selectedStatus) return false;
      return true;
    });
  }, [selectedCategory, selectedUrgency, selectedStatus]);

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedUrgency('');
    setSelectedStatus('');
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <PageHeader
          title="Browse Help Requests"
          description={`${filteredRequests.length} ${filteredRequests.length === 1 ? 'request' : 'requests'} available`}
          icon={<Filter className="h-6 w-6" />}
          actions={
            <Button size="sm" className="gap-2" onClick={() => router.push('/requests/create')}>
              <Plus className="h-4 w-4" />
              Create Request
            </Button>
          }
        />

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <RequestFilterBar
              selectedCategory={selectedCategory}
              selectedUrgency={selectedUrgency}
              selectedStatus={selectedStatus}
              onCategoryChange={setSelectedCategory}
              onUrgencyChange={setSelectedUrgency}
              onStatusChange={setSelectedStatus}
              onReset={handleReset}
            />
          </motion.div>

          {/* Requests Grid */}
          {filteredRequests.length > 0 ? (
            <RequestsGrid>
              {filteredRequests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => router.push(`/requests/${request.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <RequestCard
                    {...request}
                    onAccept={() => {
                      // TODO: Handle accept logic
                      console.log('Accepted request:', request.id);
                    }}
                  />
                </motion.div>
              ))}
            </RequestsGrid>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No requests found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or create a new request
              </p>
              <Button onClick={() => router.push('/requests/create')}>
                Create Request
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
