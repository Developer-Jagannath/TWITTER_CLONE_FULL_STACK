export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  profileImage: string | null;
  coverImage: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowRequest {
  userId: string; // ID of the user to follow/unfollow
}

export interface FollowResponse {
  success: boolean;
  message: string;
  data?: {
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
  };
}

export interface PaginatedUsersResponse {
  success: boolean;
  data: {
    users: UserProfile[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
} 