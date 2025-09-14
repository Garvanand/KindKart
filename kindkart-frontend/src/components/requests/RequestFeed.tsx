'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HELP_REQUEST_CATEGORIES, REQUEST_STATUSES } from '@/lib/constants';
import { Search, Clock, MapPin, User, MessageCircle, CheckCircle } from 'lucide-react';
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
      setRequests(communityRequests);
    } catch (error) {
      console.error('Failed to load requests:', error);
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
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
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
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <MessageCircle className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters to see more requests.'
                  : 'Be the first to create a help request in this community!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const categoryData = getCategoryData(request.category);
            const canRespond = request.status === 'pending' && request.requester.id !== user?.id;
            
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{categoryData.icon}</span>
                        <Badge className={categoryData.color}>
                          {categoryData.name}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardTitle 
                        className="text-lg cursor-pointer"
                        onClick={() => onRequestClick?.(request)}
                      >
                        {request.title}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {request.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {request.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {request.location}
                      </div>
                    )}
                    {request.timing && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {request.timing}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={request.requester.profilePhoto} />
                        <AvatarFallback>{getInitials(request.requester.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{request.requester.name}</p>
                        {request.requester.qualification && (
                          <p className="text-xs text-gray-500">{request.requester.qualification}</p>
                        )}
                      </div>
                    </div>

                    {request.helper && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Helped by {request.helper.name}</span>
                      </div>
                    )}

                    {canRespond && (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRespondToRequest(request.id);
                        }}
                      >
                        Offer Help
                      </Button>
                    )}

                    {request.responses && request.responses.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {request.responses.length} response{request.responses.length !== 1 ? 's' : ''}
                      </div>
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
