const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const authStore = localStorage.getItem('kindkart-auth-storage');
      if (authStore) {
        const { state } = JSON.parse(authStore);
        if (state.accessToken) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${state.accessToken}`,
          };
        }
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  auth = {
    sendOTP: (data: { email?: string; phone?: string }) =>
      this.request('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    verifyOTP: (data: {
      email?: string;
      phone?: string;
      otp: string;
      name?: string;
      age?: number;
      qualification?: string;
      certifications?: string[];
    }) =>
      this.request('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    refreshToken: (refreshToken: string) =>
      this.request('/api/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),

    logout: () =>
      this.request('/api/auth/logout', {
        method: 'POST',
      }),
  };

  // User endpoints
  users = {
    getProfile: () =>
      this.request('/api/users/profile', {
        method: 'GET',
      }),

    updateProfile: (data: {
      name?: string;
      age?: number;
      qualification?: string;
      certifications?: string[];
    }) =>
      this.request('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    uploadPhoto: (photoUrl: string) =>
      this.request('/api/users/upload-photo', {
        method: 'POST',
        body: JSON.stringify({ photoUrl }),
      }),

    getCommunities: () =>
      this.request('/api/users/communities', {
        method: 'GET',
      }),
  };

  // Community endpoints
  communities = {
    create: (data: { name: string; rules?: string }) =>
      this.request('/api/communities/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    join: (inviteCode: string) =>
      this.request('/api/communities/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
      }),

    get: (id: string) =>
      this.request(`/api/communities/${id}`, {
        method: 'GET',
      }),

    getMembers: (id: string) =>
      this.request(`/api/communities/${id}/members`, {
        method: 'GET',
      }),

    approveMember: (communityId: string, userId: string) =>
      this.request(`/api/communities/${communityId}/approve-member`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),

    rejectMember: (communityId: string, userId: string) =>
      this.request(`/api/communities/${communityId}/reject-member`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
  };

  // Help Request endpoints
  requests = {
    create: (data: {
      title: string;
      description: string;
      category: string;
      communityId: string;
      location?: string;
      timing?: string;
      privacyLevel: string;
    }) =>
      this.request('/api/requests/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getByCommunity: (communityId: string) =>
      this.request(`/api/requests/community/${communityId}`, {
        method: 'GET',
      }),

    get: (id: string) =>
      this.request(`/api/requests/${id}`, {
        method: 'GET',
      }),

    respond: (requestId: string, message: string) =>
      this.request(`/api/requests/${requestId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),

    acceptResponse: (requestId: string, responseId: string) =>
      this.request(`/api/requests/${requestId}/accept-response`, {
        method: 'POST',
        body: JSON.stringify({ responseId }),
      }),

    updateStatus: (requestId: string, status: string) =>
      this.request(`/api/requests/${requestId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    getUserRequests: () =>
      this.request('/api/requests/my-requests', {
        method: 'GET',
      }),

    getMyResponses: () =>
      this.request('/api/requests/my-responses', {
        method: 'GET',
      }),
  };
}

export const api = new ApiClient(API_BASE_URL);
