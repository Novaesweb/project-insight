import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Interface para o estado global
interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light' | 'system';
  notifications: Notification[];
  
  // User State
  user: User | null;
  isAuthenticated: boolean;
  
  // App State
  loading: boolean;
  error: string | null;
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client' | 'reseller';
  avatar?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp?: Date;
  read?: boolean;
}

// Storage customizado para evitar erros de serialização
const customStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  }
};

// Store principal
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sidebarCollapsed: false,
      theme: 'dark',
      notifications: [],
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      setTheme: (theme) => set({ theme }),
      
      addNotification: (notification) => {
        const id = crypto.randomUUID();
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: new Date(),
          read: false
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      },
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'novaesweb-app-state',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Hooks específicos para facilitar o uso
export const useAuth = () => {
  const { user, isAuthenticated, setUser } = useAppStore();
  
  const login = (userData: User) => {
    setUser(userData);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return {
    user,
    isAuthenticated,
    login,
    logout
  };
};

export const useNotifications = () => {
  const { notifications, addNotification, removeNotification } = useAppStore();
  
  const success = (title: string, message: string) => {
    addNotification({ title, message, type: 'success' });
  };
  
  const error = (title: string, message: string) => {
    addNotification({ title, message, type: 'error' });
  };
  
  const warning = (title: string, message: string) => {
    addNotification({ title, message, type: 'warning' });
  };
  
  const info = (title: string, message: string) => {
    addNotification({ title, message, type: 'info' });
  };
  
  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  };
};

export const useUI = () => {
  const { sidebarCollapsed, theme, setSidebarCollapsed, setTheme } = useAppStore();
  
  return {
    sidebarCollapsed,
    theme,
    setSidebarCollapsed,
    setTheme
  };
};
