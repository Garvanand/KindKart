'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HELP_REQUEST_CATEGORIES, REQUEST_STATUSES } from '@/lib/constants';
import { Search, Clock, MapPin, CheckCircle, HelpCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location?: string;
  timing?: string;
  privacyLevel: string;
  createdAt: string;
  requester: {
    id: string;
    name: string;
    profilePhoto?: string;
    qualification?: string;
  };
  helper?: {
    id: string;
    name: string;
    profilePhoto?: string;
  };
  responses?: Array<{
    id: string;
    helper: {
      id: string;
      name: string;
      profilePhoto?: string;
    };
    message: string;
    createdAt: string;
  }>;
}

interface RequestFeedProps {
  communityId: string;
  onRequestClick?: (request: HelpRequest) => void;
}

export function RequestFeed({ communityId, onRequestClick }: RequestFeedProps) {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { user } = useAuthStore();

  useEffect(() => {
    loadRequests();
  }, [communityId]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const communityRequests = await api.requests.getByCommunity(communityId);
      setRequests(Array.isArray(communityRequests) ? communityRequests : []);
    } catch (error) {
      console.warn('Requests unavailable (backend may be off):', error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryData = (categoryId: string) => {
    return HELP_REQUEST_CATEGORIES.find(cat => cat.id === categoryId) || {
      id: categoryId,
      name: categoryId,
      icon: '🤝',
      color: 'bg-gray-100 text-gray-800'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/15 text-warning';
      case 'accepted':
        return 'bg-primary/15 text-primary';
      case 'in_progress':
        return 'bg-info/15 text-info';
      case 'completed':
        return 'bg-success/15 text-success';
      case 'cancelled':
        return 'bg-destructive/15 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleRespondToRequest = async (requestId: string) => {
    // This will be implemented when we add the response functionality
    console.log('Responding to request:', requestId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-5 w-16 shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="mb-4 h-12 w-full" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {HELP_REQUEST_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Request List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <HelpCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No requests found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters to see more requests.'
                  : 'Be the first to create a help request in this community.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const categoryData = getCategoryData(request.category);
            const canRespond = request.status === 'pending' && request.requester.id !== user?.id;

            return (
              <Card
                key={request.id}
                className="cursor-pointer transition-colors hover:border-primary/30 hover:bg-muted/30"
                onClick={() => onRequestClick?.(request)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-lg">{categoryData.icon}</span>
                        <Badge variant="secondary" className="font-normal">
                          {categoryData.name}
                        </Badge>
                        <Badge className={cn('font-normal', getStatusColor(request.status))}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-semibold leading-tight">
                        {request.title}
                      </CardTitle>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {request.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {request.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {request.location}
                      </span>
                    )}
                    {request.timing && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {request.timing}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.requester.profilePhoto} />
                        <AvatarFallback className="text-xs">
                          {getInitials(request.requester.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {request.requester.name}
                        </p>
                        {request.requester.qualification && (
                          <p className="text-xs text-muted-foreground">
                            {request.requester.qualification}
                          </p>
                        )}
                      </div>
                    </div>
                    {request.helper && (
                      <span className="flex items-center gap-1.5 text-sm text-success">
                        <CheckCircle className="h-4 w-4" />
                        Helped by {request.helper.name}
                      </span>
                    )}
                    {canRespond && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRespondToRequest(request.id);
                        }}
                      >
                        Offer help
                      </Button>
                    )}
                    {request.responses && request.responses.length > 0 && !request.helper && (
                      <span className="text-sm text-muted-foreground">
                        {request.responses.length} response
                        {request.responses.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
