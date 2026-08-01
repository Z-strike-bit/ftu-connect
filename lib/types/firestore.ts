// Firestore TypeScript interfaces for PIVOT v2

export type Timestamp = any; // use firebase.firestore.Timestamp at runtime

export interface Member {
  uid: string;
  email?: string;
  name?: string;
  photoURL?: string;
  coverPhotoUrl?: string;
  bio?: string;
  major?: string;
  specialization?: string;
  role: 'student' | 'employee' | 'admin';
  contactLink?: string;

  // PIVOT v2 fields
  tier?: 1 | 2;
  verifiedCompany?: string;
  verifiedStatus?: 'pending' | 'approved' | 'rejected';
  reputation?: number;
  isShadowBanned?: boolean;
  anonymous?: boolean;

  friends?: string[];
  pendingRequests?: string[];
  sentRequests?: string[];

  createdAt?: Timestamp;
  lastActiveAt?: Timestamp;
}

export interface Thread {
  id: string;
  authorUid: string;
  authorName?: string;
  authorPhotoURL?: string;
  authorTier?: 1 | 2;
  authorCompany?: string;

  title: string;
  content: string;
  tags?: string[];
  company?: string;

  upvotes?: number;
  downvotes?: number;
  upvotedBy?: string[];
  downvotedBy?: string[];

  views?: number;

  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;

  anonymous?: boolean;

  status?: 'pending' | 'published' | 'hidden' | 'rejected';
  moderationFlags?: string[];
  moderationReason?: string;

  hotScore?: number;

  commentCount?: number;
  createdAt?: Timestamp;
  lastActivityAt?: Timestamp;
}

export interface Comment {
  id: string;
  threadId: string;
  parentId?: string | null;
  authorUid: string;
  authorName?: string;
  authorPhotoURL?: string;
  authorTier?: 1 | 2;
  authorCompany?: string;
  content: string;
  upvotes?: number;
  downvotes?: number;
  upvotedBy?: string[];
  downvotedBy?: string[];
  anonymous?: boolean;
  status?: 'pending' | 'published' | 'hidden';
  depth?: number;
  createdAt?: Timestamp;
}

export interface ModerationQueueItem {
  id: string;
  type: 'thread' | 'comment';
  content: string;
  authorUid?: string;
  aiVerdict?: 'clean' | 'flag' | 'toxic';
  aiFlags?: string[];
  aiConfidence?: number;
  humanVerdict?: 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  status?: 'auto_approved' | 'pending_human' | 'resolved';
  createdAt?: Timestamp;
}

export interface ModerationAppeal {
  id: string;
  threadId: string;
  appellantUid: string;
  reason: string;
  status?: 'pending' | 'upheld' | 'overturned';
  createdAt?: Timestamp;
  resolvedAt?: Timestamp;
}

export interface Vote {
  id: string;
  targetType: 'thread' | 'comment';
  targetId: string;
  voterUid: string;
  voteType: 'up' | 'down';
  createdAt?: Timestamp;
}

export interface AnalyticsDaily {
  date: string; // ISO date
  dau: number;
  new_signups: number;
  threads_created: number;
  comments_created: number;
}
