export interface Tweet {
  id: string;
  content: string;
  userId: string;
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
  };
  isPublic: boolean;
  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTweetRequest {
  content: string;
  isPublic?: boolean;
}

export interface UpdateTweetRequest {
  content: string;
  isPublic?: boolean;
}

export interface TweetResponse {
  success: boolean;
  message?: string;
  data: Tweet;
}

export interface PaginatedTweetsResponse {
  success: boolean;
  message?: string;
  data: {
    tweets: Tweet[];
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

export interface TweetFilters {
  page?: number;
  limit?: number;
  userId?: string;
  isPublic?: boolean;
} 