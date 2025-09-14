'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, Settings, Share2 } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  inviteCode: string;
  rules?: string;
  createdAt: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    role: string;
    status: string;
    user: {
      id: string;
      name: string;
      email: string;
      profilePhoto?: string;
    };
  }>;
}

interface CommunityHeaderProps {
  community: Community;
  userRole?: string;
  isAdmin?: boolean;
}

export function CommunityHeader({ community, userRole, isAdmin }: CommunityHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(community.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite code:', err);
    }
  };

  const shareCommunity = async () => {
    const shareData = {
      title: `Join ${community.name} on KindKart`,
      text: `Join my community "${community.name}" on KindKart! Use invite code: ${community.inviteCode}`,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy share text:', err);
      }
    }
  };

  const approvedMembers = community.members.filter(member => member.status === 'approved');
  const pendingMembers = community.members.filter(member => member.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Community Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{community.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {userRole === 'admin' ? 'Admin' : 'Member'}
                </Badge>
                <span className="text-sm text-gray-500">
                  Created {new Date(community.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {isAdmin && (
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {community.rules && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Community Rules</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {community.rules}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-semibold text-blue-900">Members</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">{approvedMembers.length}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <span className="font-semibold text-orange-900">Pending</span>
              </div>
              <p className="text-2xl font-bold text-orange-800">{pendingMembers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Invite New Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">Share this code with your neighbors:</p>
              <div className="flex items-center gap-2">
                <code className="text-xl font-mono font-bold bg-gray-100 px-3 py-2 rounded">
                  {community.inviteCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyInviteCode}
                  className={copied ? "bg-green-50 border-green-200" : ""}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button onClick={shareCommunity} variant="outline" className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share Community
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
