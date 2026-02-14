import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';

interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastContextType {
  toast: (type: 'success' | 'error' | 'info', text: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

let nextId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    const id = nextId++;
    setMessages(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {messages.map(m => (
          <div
            key={m.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl animate-slide-up max-w-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              m.type === 'success'
                ? 'bg-green-500/20 border-green-500/40 text-green-200'
                : m.type === 'error'
                ? 'bg-red-500/20 border-red-500/40 text-red-200'
                : 'bg-blue-500/20 border-blue-500/40 text-blue-200'
            }`}
            onClick={() => dismiss(m.id)}
          >
            <span className="text-lg flex-shrink-0">
              {m.type === 'success' ? '✓' : m.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span className="text-sm font-medium">{m.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
