'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserCheck, UserX, Crown, User } from 'lucide-react';
import { api } from '@/lib/api';

interface Member {
  id: string;
  role: string;
  status: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    qualification?: string;
    certifications?: string[];
  };
}

interface MemberListProps {
  members: Member[];
  isAdmin: boolean;
  communityId: string;
  onMemberUpdate: () => void;
}

export function MemberList({ members, isAdmin, communityId, onMemberUpdate }: MemberListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const approvedMembers = members.filter(member => member.status === 'approved');
  const pendingMembers = members.filter(member => member.status === 'pending');

  const filteredMembers = (memberList: Member[]) => {
    if (!searchTerm) return memberList;
    
    return memberList.filter(member =>
      member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.user.qualification && member.user.qualification.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleApproveMember = async (userId: string) => {
    setIsLoading(userId);
    try {
      await api.communities.approveMember(communityId, userId);
      onMemberUpdate();
    } catch (error) {
      console.error('Failed to approve member:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleRejectMember = async (userId: string) => {
    setIsLoading(userId);
    try {
      await api.communities.rejectMember(communityId, userId);
      onMemberUpdate();
    } catch (error) {
      console.error('Failed to reject member:', error);
    } finally {
      setIsLoading(null);
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const MemberCard = ({ member }: { member: Member }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={member.user.profilePhoto} />
              <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{member.user.name}</h4>
                {getRoleIcon(member.role)}
                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                  {member.role}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{member.user.email}</p>
              {member.user.qualification && (
                <p className="text-xs text-gray-500">{member.user.qualification}</p>
              )}
              {member.user.certifications && member.user.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {member.user.certifications.slice(0, 2).map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                  {member.user.certifications.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.user.certifications.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isAdmin && member.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleApproveMember(member.user.id)}
                disabled={isLoading === member.user.id}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRejectMember(member.user.id)}
                disabled={isLoading === member.user.id}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <UserX className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
          
          {member.status === 'approved' && (
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search members by name, email, or qualification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Members (Admin Only) */}
      {isAdmin && pendingMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-orange-600" />
              Pending Approval ({pendingMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMembers(pendingMembers).map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Approved Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Community Members ({filteredMembers(approvedMembers).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers(approvedMembers).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No members found matching your search.' : 'No members yet.'}
            </div>
          ) : (
            filteredMembers(approvedMembers).map((member) => (
              <MemberCard key={member.id} member={member} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
