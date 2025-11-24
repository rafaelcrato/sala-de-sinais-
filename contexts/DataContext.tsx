import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Signal, SignalDuration, User, BotConfig } from '../types';
import { DURATION_OPTIONS } from '../constants';

interface DataContextType {
  signals: Signal[];
  deleteSignal: (id: string) => void;
  getStats: () => any;
  usersList: User[];
  toggleUserLicense: (userId: string) => void;
  // Bot Controls
  botConfig: BotConfig;
  updateBotConfig: (config: Partial<BotConfig>) => void;
  generateManualBotSignal: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  
  // Bot State - Default Active
  const [botConfig, setBotConfig] = useState<BotConfig>(() => {
      const saved = localStorage.getItem('btc_bot_config');
      return saved ? JSON.parse(saved) : { isActive: true, intervalSeconds: 30 };
  });

  // Load initial data
  useEffect(() => {
    const storedSignals = localStorage.getItem('btc_signals');
    if (storedSignals) setSignals(JSON.parse(storedSignals));

    // Load users for admin
    const storedUsers = localStorage.getItem('btc_users_db');
    if (storedUsers) {
        const parsed = JSON.parse(storedUsers).map((u: any) => {
            const { password, ...rest } = u;
            return rest;
        });
        setUsersList(parsed);
    }
  }, []);

  // Persist Bot Config
  useEffect(() => {
      localStorage.setItem('btc_bot_config', JSON.stringify(botConfig));
  }, [botConfig]);

  // --- BOT LOGIC START ---
  
  const generateRandomSignal = useCallback(() => {
    const now = Date.now();
    const newSignalsBatch: Signal[] = [];
    const BATCH_SIZE = 10; // Generate 10 signals per tick

    for (let i = 0; i < BATCH_SIZE; i++) {
        // 1. Action (Direction)
        const direction: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'BUY' : 'SELL';
        
        // 2. Price Generation (Base 68000 +/- 200)
        // Add a slight variance per signal in the batch so they aren't identical prices
        const basePrice = 68000;
        const variation = (Math.random() * 400) - 200; 
        const microVariation = (Math.random() * 10) - 5; 
        const entryPrice = Number((basePrice + variation + microVariation).toFixed(2));

        // 3. Stop Loss (Entry +/- 20 to 80)
        const slVariation = (Math.random() * 60) + 20; // 20 to 80
        const stopLoss = direction === 'BUY' 
            ? Number((entryPrice - slVariation).toFixed(2)) 
            : Number((entryPrice + slVariation).toFixed(2));

        // 4. Take Profit Array
        const tp1Var = (Math.random() * 110) + 40;
        const tp2Var = (Math.random() * 120) + 80;
        
        const tp1 = direction === 'BUY' ? entryPrice + tp1Var : entryPrice - tp1Var;
        const tp2 = direction === 'BUY' ? entryPrice + tp2Var : entryPrice - tp2Var;
        
        const takeProfit = [Number(tp1.toFixed(2)), Number(tp2.toFixed(2))].sort((a,b) => direction === 'BUY' ? a - b : b - a);

        // 5. Expiration - Randomly select for EACH signal in the batch
        const expiryOptions = [
            { label: '15s', sec: 15 }, 
            { label: '30s', sec: 30 }, 
            { label: '1m', sec: 60 }, 
            { label: '5m', sec: 300 }
        ];
        const selectedExpiry = expiryOptions[Math.floor(Math.random() * expiryOptions.length)];

        const newSignal: Signal = {
            id: crypto.randomUUID(),
            symbol: 'BTC',
            direction: direction,
            entryPrice: entryPrice,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            duration: selectedExpiry.label as SignalDuration,
            expirySeconds: selectedExpiry.sec,
            createdAt: now + i, // Add ms to ensure unique sorting if needed
            expiresAt: now + (selectedExpiry.sec * 1000),
            status: 'active',
            generatedBy: 'AUTO_BOT',
            notes: '⚡ Algo Trading'
        };
        
        newSignalsBatch.push(newSignal);
    }

    setSignals(prev => {
        const updated = [...newSignalsBatch, ...prev];
        // Keep array size manageable (e.g., max 100 signals)
        const trimmed = updated.slice(0, 100); 
        localStorage.setItem('btc_signals', JSON.stringify(trimmed));
        return trimmed;
    });

  }, []);

  // Bot Loop
  useEffect(() => {
      if (!botConfig.isActive) return;

      const timer = setInterval(() => {
          generateRandomSignal();
      }, botConfig.intervalSeconds * 1000);

      return () => clearInterval(timer);
  }, [botConfig.isActive, botConfig.intervalSeconds, generateRandomSignal]);

  // --- BOT LOGIC END ---

  // Timer to auto-expire signals (Maintenance Loop)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSignals(prev => {
        let changed = false;
        const newSignals = prev.map(s => {
          if (s.status === 'active' && s.expiresAt <= now) {
            changed = true;
            return { ...s, status: 'expired' as const };
          }
          return s;
        });
        
        if (changed) {
          localStorage.setItem('btc_signals', JSON.stringify(newSignals));
          return newSignals;
        }
        return prev;
      });
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  const deleteSignal = (id: string) => {
    const updated = signals.filter(s => s.id !== id);
    setSignals(updated);
    localStorage.setItem('btc_signals', JSON.stringify(updated));
  };
  
  const toggleUserLicense = (userId: string) => {
     const dbUsers = JSON.parse(localStorage.getItem('btc_users_db') || '[]');
     const updatedDb = dbUsers.map((u: any) => {
         if (u.id === userId) {
             return { ...u, licenseStatus: u.licenseStatus === 'active' ? 'inactive' : 'active' };
         }
         return u;
     });
     localStorage.setItem('btc_users_db', JSON.stringify(updatedDb));
     
     setUsersList(updatedDb.map((u: any) => {
         const { password, ...rest } = u;
         return rest;
     }));
  };

  const updateBotConfig = (config: Partial<BotConfig>) => {
      setBotConfig(prev => ({ ...prev, ...config }));
  };

  const getStats = () => {
    return {
      totalSignals: signals.length,
      activeSignals: signals.filter(s => s.status === 'active').length,
      botSignals: signals.filter(s => s.generatedBy === 'AUTO_BOT').length,
      totalUsers: usersList.length
    };
  };

  return (
    <DataContext.Provider value={{ 
        signals, 
        deleteSignal, 
        getStats, 
        usersList, 
        toggleUserLicense,
        botConfig,
        updateBotConfig,
        generateManualBotSignal: generateRandomSignal
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};