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
  nextGenTime: number; // Expose cooldown time
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  
  // Bot State - Default Active
  const [botConfig, setBotConfig] = useState<BotConfig>(() => {
      const saved = localStorage.getItem('btc_bot_config');
      // Default set to 120 seconds (2 minutes) per user request
      return saved ? JSON.parse(saved) : { isActive: true, intervalSeconds: 120 };
  });

  const [nextGenTime, setNextGenTime] = useState<number>(0);

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
    
    // ENFORCE COOLDOWN: If current time is less than next generation time, do nothing.
    if (now < nextGenTime) {
        return; 
    }

    const newSignalsBatch: Signal[] = [];
    
    // STRICT REQUIREMENT: 3 Signals (1m, 5m, 15m)
    const requiredDurations: { label: SignalDuration, sec: number }[] = [
        { label: '1m', sec: 60 },
        { label: '5m', sec: 300 },
        { label: '15m', sec: 900 }
    ];

    requiredDurations.forEach((durInfo, i) => {
        // 1. Action (Direction)
        // INVERTED LOGIC: > 0.5 ? 'SELL' : 'BUY'
        const direction: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'SELL' : 'BUY';
        
        // 2. Price Generation (Base 68000 +/- 200)
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

        const newSignal: Signal = {
            id: crypto.randomUUID(),
            symbol: 'BTC',
            direction: direction,
            entryPrice: entryPrice,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            duration: durInfo.label,
            expirySeconds: durInfo.sec,
            createdAt: now + i, // Add ms to ensure unique sorting
            expiresAt: now + (durInfo.sec * 1000),
            status: 'active',
            generatedBy: 'AUTO_BOT',
            notes: '⚡ Algo Trading'
        };
        
        newSignalsBatch.push(newSignal);
    });

    setSignals(prev => {
        // Prevent Accumulation: Replace active signals
        const history = prev.filter(s => s.status !== 'active').slice(0, 20);
        const updated = [...newSignalsBatch, ...history];
        localStorage.setItem('btc_signals', JSON.stringify(updated));
        return updated;
    });

    // SET COOLDOWN based on interval settings
    setNextGenTime(now + (botConfig.intervalSeconds * 1000));

  }, [botConfig.intervalSeconds, nextGenTime]);

  // Bot Loop
  useEffect(() => {
      if (!botConfig.isActive) return;

      const timer = setInterval(() => {
          // The function itself checks nextGenTime, so we can call it.
          // However, to avoid drift, we rely on the internal check.
          generateRandomSignal();
      }, 1000); // Check every second if we can generate

      return () => clearInterval(timer);
  }, [botConfig.isActive, generateRandomSignal]);

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
      // If manually changing settings, reset timer to allow immediate action if desired, 
      // or keep it to prevent abuse. Keeping it simple for now.
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
        generateManualBotSignal: generateRandomSignal,
        nextGenTime
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