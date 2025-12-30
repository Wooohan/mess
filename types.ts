
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  AGENT = 'AGENT',
}

export enum ConversationStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
}

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  isConnected: boolean;
  accessToken: string;
  assignedAgentIds: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isIncoming: boolean;
  isRead: boolean;
  notes?: string;
}

export interface Conversation {
  id: string;
  pageId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
  status: ConversationStatus;
  assignedAgentId: string | null;
  unreadCount: number;
}
