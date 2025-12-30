
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, FacebookPage, Conversation, Message, ConversationStatus } from '../types';
import { MOCK_USERS, MOCK_PAGES, MOCK_CONVERSATIONS } from '../constants';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  pages: FacebookPage[];
  addPage: (page: FacebookPage) => void;
  removePage: (id: string) => void;
  conversations: Conversation[];
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  messages: Message[];
  addMessage: (msg: Message) => void;
  agents: User[];
  addAgent: (agent: User) => void;
  login: (email: string) => void;
  logout: () => void;
  simulateIncomingWebhook: (pageId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'messengerflow_v2_state';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadInitialState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { console.error(e); }
    }
    return {
      pages: MOCK_PAGES,
      conversations: MOCK_CONVERSATIONS,
      agents: MOCK_USERS,
      messages: [],
    };
  };

  const initialState = loadInitialState();

  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [pages, setPages] = useState<FacebookPage[]>(initialState.pages);
  const [conversations, setConversations] = useState<Conversation[]>(initialState.conversations);
  const [agents, setAgents] = useState<User[]>(initialState.agents);
  const [messages, setMessages] = useState<Message[]>(initialState.messages);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pages, conversations, agents, messages }));
  }, [pages, conversations, agents, messages]);

  const addPage = (page: FacebookPage) => setPages(prev => {
    if (prev.find(p => p.id === page.id)) return prev;
    return [...prev, page];
  });
  
  const removePage = (id: string) => setPages(prev => prev.filter(p => p.id !== id));

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
    updateConversation(msg.conversationId, {
      lastMessage: msg.text,
      lastTimestamp: msg.timestamp,
    });
  };

  const addAgent = (agent: User) => setAgents(prev => [...prev, agent]);

  // AUTO-ASSIGNMENT LOGIC (Round Robin)
  const autoAssignConversation = (convId: string) => {
    const availableAgents = agents.filter(a => a.role === UserRole.AGENT && a.status === 'online');
    if (availableAgents.length === 0) return;

    // Simplified: Assign to agent with fewest active conversations
    const agentWorkloads = availableAgents.map(agent => ({
      id: agent.id,
      count: conversations.filter(c => c.assignedAgentId === agent.id && c.status !== ConversationStatus.RESOLVED).length
    }));
    
    agentWorkloads.sort((a, b) => a.count - b.count);
    updateConversation(convId, { assignedAgentId: agentWorkloads[0].id });
  };

  const simulateIncomingWebhook = (pageId: string) => {
    const customerId = `cust-${Math.floor(Math.random() * 1000)}`;
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      pageId: pageId,
      customerId: customerId,
      customerName: `Live Customer ${customerId.split('-')[1]}`,
      customerAvatar: `https://picsum.photos/seed/${customerId}/200`,
      lastMessage: "I have a question about my recent payment.",
      lastTimestamp: new Date().toISOString(),
      status: ConversationStatus.OPEN,
      assignedAgentId: null,
      unreadCount: 1,
    };

    setConversations(prev => [newConv, ...prev]);
    autoAssignConversation(newConv.id);
  };

  const login = (email: string) => {
    const user = agents.find(u => u.email === email);
    if (user) setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      pages, addPage, removePage,
      conversations, updateConversation,
      messages, addMessage,
      agents, addAgent,
      login, logout,
      simulateIncomingWebhook
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
