import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Signal, SignalDuration, User, BotConfig } from '../types';
import { DURATION_OPTIONS, IMG_LOGO } from '../constants';

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
    const BATCH_SIZE = 20; // Generate 20 signals per batch
    
    // Allowed durations to pick from randomly
    const ALLOWED_DURATIONS: { label: SignalDuration, sec: number }[] = [
        { label: '15s', sec: 15 },
        { label: '30s', sec: 30 },
        { label: '1m', sec: 60 },
        { label: '5m', sec: 300 },
        { label: '15m', sec: 900 }
    ];

    // Technical Analysis Reasons
    const BUY_REASONS = [
        "RSI em zona de sobrevenda extrema",
        "Rompimento de cunha descendente",
        "Cruzamento de médias móveis (EMA 9/21)",
        "Suporte forte confirmado no Order Block",
        "Divergência altista no MACD",
        "Volume comprador institucional detectado",
        "Reteste de Fibonacci 61.8%",
        "Padrão Martelo no gráfico de 1M"
    ];

    const SELL_REASONS = [
        "RSI em zona de sobrecompra crítica",
        "Rejeição em resistência psicológica",
        "Cruzamento da morte (Death Cross)",
        "Formação de topo duplo confirmada",
        "Perda de suporte dinâmico (LTA)",
        "Divergência baixista no RSI Estocástico",
        "Volume vendedor absorvendo ofertas",
        "Padrão Estrela Cadente identificado"
    ];

    // List of assets to generate signals for with Logos
    // Updated with reliable CoinGecko sources for all requested assets
    const CRYPTO_ASSETS = [
        { symbol: 'BTCUSDT', basePrice: 67500, logo: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png' },
        { symbol: 'ETHUSDT', basePrice: 2650, logo: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png' },
        { symbol: 'SOLUSDT', basePrice: 155, logo: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png' },
        { symbol: 'XRPUSDT', basePrice: 0.55, logo: 'https://assets.coingecko.com/coins/images/44/standard/xrp-symbol-white-128.png' },
        { symbol: 'DOGEUSDT', basePrice: 0.11, logo: 'https://assets.coingecko.com/coins/images/5/standard/dogecoin.png' },
        { symbol: 'ADAUSDT', basePrice: 0.35, logo: 'https://assets.coingecko.com/coins/images/975/standard/cardano.png' },
        { symbol: 'TRXUSDT', basePrice: 0.15, logo: 'https://assets.coingecko.com/coins/images/1094/standard/tron-logo.png' },
        { symbol: 'TONUSDT', basePrice: 5.20, logo: 'https://assets.coingecko.com/coins/images/17980/standard/ton_symbol.png' },
        { symbol: 'SHIBUSDT', basePrice: 0.000018, logo: 'https://assets.coingecko.com/coins/images/11939/standard/shiba.png' },
        { symbol: 'LINKUSDT', basePrice: 11.00, logo: 'https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png' },
        { symbol: 'BCHUSDT', basePrice: 330, logo: 'https://assets.coingecko.com/coins/images/780/standard/bitcoin-cash-circle.png' },
        { symbol: 'DOTUSDT', basePrice: 4.20, logo: 'https://assets.coingecko.com/coins/images/12171/standard/polkadot.png' },
        { symbol: 'NEARUSDT', basePrice: 4.80, logo: 'https://assets.coingecko.com/coins/images/10365/standard/near.png' },
        { symbol: 'MATICUSDT', basePrice: 0.38, logo: 'https://assets.coingecko.com/coins/images/4713/standard/matic-token-icon.png' },
        { symbol: 'LTCUSDT', basePrice: 70, logo: 'https://assets.coingecko.com/coins/images/2/standard/litecoin.png' },
        { symbol: 'PEPEUSDT', basePrice: 0.000009, logo: 'https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg' },
        { symbol: 'ICPUSDT', basePrice: 8.00, logo: 'https://assets.coingecko.com/coins/images/14495/standard/Internet_Computer_logo.png' },
        { symbol: 'ARBUSDT', basePrice: 0.55, logo: 'https://assets.coingecko.com/coins/images/16547/standard/arbitrum.jpg' },
        { symbol: 'RNDRUSDT', basePrice: 5.00, logo: 'https://assets.coingecko.com/coins/images/11636/standard/rndr.png' },
        { symbol: 'ATOMUSDT', basePrice: 4.50, logo: 'https://assets.coingecko.com/coins/images/1481/standard/cosmos_hub.png' },
        { symbol: 'STXUSDT', basePrice: 1.80, logo: 'https://assets.coingecko.com/coins/images/2069/standard/Stacks_logo_full.png' },
        { symbol: 'IMXUSDT', basePrice: 1.50, logo: 'https://assets.coingecko.com/coins/images/17233/standard/immutableX_symbol.png' },
        { symbol: 'INJUSDT', basePrice: 20.00, logo: 'https://assets.coingecko.com/coins/images/12882/standard/Secondary_Symbol.png' },
        { symbol: 'TAOUSDT', basePrice: 550, logo: 'https://assets.coingecko.com/coins/images/29338/standard/tao.png' },
        { symbol: 'WIFUSDT', basePrice: 2.50, logo: 'https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg' },
        { symbol: 'TIAUSDT', basePrice: 5.00, logo: 'https://assets.coingecko.com/coins/images/31967/standard/tia.png' },
        { symbol: 'GRTUSDT', basePrice: 0.15, logo: 'https://assets.coingecko.com/coins/images/13397/standard/Graph_Token.png' },
        { symbol: 'SUIUSDT', basePrice: 1.90, logo: 'https://assets.coingecko.com/coins/images/26375/standard/sui_asset.jpeg' },
        { symbol: 'HBARUSDT', basePrice: 0.05, logo: 'https://assets.coingecko.com/coins/images/3688/standard/hbar.png' },
        { symbol: 'ONDOUSDT', basePrice: 0.70, logo: 'https://assets.coingecko.com/coins/images/28879/standard/ondo.png' },
        { symbol: 'SEIUSDT', basePrice: 0.40, logo: 'https://assets.coingecko.com/coins/images/28205/standard/Sei_Logo_-_Blue_Gradient.png' },
        { symbol: 'JUPUSDT', basePrice: 0.80, logo: 'https://assets.coingecko.com/coins/images/34188/standard/jup.png' },
        { symbol: 'FLOKIUSDT', basePrice: 0.00014, logo: 'https://assets.coingecko.com/coins/images/16746/standard/floki.png' },
        { symbol: 'PYTHUSDT', basePrice: 0.30, logo: 'https://assets.coingecko.com/coins/images/31924/standard/pyth.png' },
        { symbol: 'SANDUSDT', basePrice: 0.25, logo: 'https://assets.coingecko.com/coins/images/12129/standard/sandbox_logo.jpg' },
        { symbol: 'MANAUSDT', basePrice: 0.30, logo: 'https://assets.coingecko.com/coins/images/878/standard/decentraland-mana-logo.png' },
        { symbol: 'EOSUSDT', basePrice: 0.50, logo: 'https://assets.coingecko.com/coins/images/738/standard/eos-eos-logo.png' },
        { symbol: 'IOTAUSDT', basePrice: 0.12, logo: 'https://assets.coingecko.com/coins/images/692/standard/IOTA_Swirl.png' },
        { symbol: 'DASHUSDT', basePrice: 25, logo: 'https://assets.coingecko.com/coins/images/19/standard/dash-logo.png' },
        { symbol: 'ORDIUSDT', basePrice: 35.00, logo: 'https://assets.coingecko.com/coins/images/30169/standard/ordi.png' },
        { symbol: '1000SATS', basePrice: 0.0003, logo: 'https://assets.coingecko.com/coins/images/33276/standard/sats.png' },
        { symbol: 'WLDUSDT', basePrice: 2.00, logo: 'https://assets.coingecko.com/coins/images/31368/standard/worldcoin-logo.png' },
        { symbol: 'RONUSDT', basePrice: 1.50, logo: 'https://assets.coingecko.com/coins/images/20128/standard/ronin.png' },
        { symbol: 'DYDXUSDT', basePrice: 1.00, logo: 'https://assets.coingecko.com/coins/images/17500/standard/dydx.png' },
        { symbol: 'RAYUSDT', basePrice: 1.60, logo: 'https://assets.coingecko.com/coins/images/13928/standard/Raydium_Logo.png' },
        // Meme / Special Request
        { symbol: 'TRUMP', basePrice: 3.50, logo: 'https://assets.coingecko.com/coins/images/31260/standard/trump.jpg' },
        { symbol: 'FARTCOIN', basePrice: 0.00001, logo: 'https://assets.coingecko.com/coins/images/34065/standard/FartCoin.jpeg' }, 
        { symbol: 'PENGU', basePrice: 0.05, logo: 'https://assets.coingecko.com/coins/images/39328/standard/pengu.jpg' },
        { symbol: 'MELANINA', basePrice: 0.01, logo: 'https://cdn-icons-png.flaticon.com/512/2152/2152539.png' }, // Generic coin icon
    ];

    // Generate BATCH_SIZE (20) signals
    for (let i = 0; i < BATCH_SIZE; i++) {
        // Pick a random asset
        const asset = CRYPTO_ASSETS[Math.floor(Math.random() * CRYPTO_ASSETS.length)];
        
        // Pick a random duration from allowed options (15s, 30s, 1m, 5m, 15m)
        const durInfo = ALLOWED_DURATIONS[Math.floor(Math.random() * ALLOWED_DURATIONS.length)];

        // 1. Action (Direction)
        // INVERTED LOGIC: > 0.5 ? 'SELL' : 'BUY'
        const direction: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'SELL' : 'BUY';
        
        // 2. Price Generation (Proportional to base price)
        // Random fluctuation between -1% and +1% of base price
        const fluctuationPercent = (Math.random() * 0.02) - 0.01; 
        const rawEntry = asset.basePrice * (1 + fluctuationPercent);
        
        // Determine decimal precision based on price value
        // If price < 0.01 (like PEPE), use 8 decimals. If < 10, use 4. Else 2.
        let decimals = 2;
        if (rawEntry < 0.01) decimals = 8;
        else if (rawEntry < 10) decimals = 4;

        const entryPrice = Number(rawEntry.toFixed(decimals));

        // 3. Stop Loss & Take Profit (Percentage based)
        // Shorter duration = tighter stops/targets
        let volatilityMultiplier = 0.006; // Default for 15m
        if (durInfo.label === '15s') volatilityMultiplier = 0.0002;
        else if (durInfo.label === '30s') volatilityMultiplier = 0.0004;
        else if (durInfo.label === '1m') volatilityMultiplier = 0.001;
        else if (durInfo.label === '5m') volatilityMultiplier = 0.003;
        
        const slPercent = volatilityMultiplier * (0.8 + Math.random() * 0.4); // slightly randomized
        const tp1Percent = volatilityMultiplier * (1.2 + Math.random() * 0.5);
        const tp2Percent = volatilityMultiplier * (2.0 + Math.random() * 0.8);

        let stopLoss, tp1, tp2;

        if (direction === 'BUY') {
            stopLoss = entryPrice * (1 - slPercent);
            tp1 = entryPrice * (1 + tp1Percent);
            tp2 = entryPrice * (1 + tp2Percent);
        } else { // SELL
            stopLoss = entryPrice * (1 + slPercent);
            tp1 = entryPrice * (1 - tp1Percent);
            tp2 = entryPrice * (1 - tp2Percent);
        }

        // Format SL/TP with correct decimals
        const slFormatted = Number(stopLoss.toFixed(decimals));
        const tp1Formatted = Number(tp1.toFixed(decimals));
        const tp2Formatted = Number(tp2.toFixed(decimals));

        const takeProfit = [tp1Formatted, tp2Formatted].sort((a,b) => direction === 'BUY' ? a - b : b - a);

        // 4. GENERATE ACCURACY AND REASONING
        // Accuracy between 75% and 95%
        const accuracy = Math.floor(Math.random() * (95 - 75 + 1)) + 75;
        
        // Reasoning based on direction
        const reasonsList = direction === 'BUY' ? BUY_REASONS : SELL_REASONS;
        const reasoning = reasonsList[Math.floor(Math.random() * reasonsList.length)];

        const newSignal: Signal = {
            id: crypto.randomUUID(),
            symbol: asset.symbol,
            direction: direction,
            entryPrice: entryPrice,
            stopLoss: slFormatted,
            takeProfit: takeProfit,
            duration: durInfo.label,
            expirySeconds: durInfo.sec,
            createdAt: now, // Same batch time
            expiresAt: now + (durInfo.sec * 1000),
            status: 'active',
            generatedBy: 'AUTO_BOT',
            notes: '⚡ Algo Trading',
            logo: asset.logo,
            accuracy: accuracy,
            reasoning: reasoning
        };
        
        newSignalsBatch.push(newSignal);
    }

    setSignals(prev => {
        // Prevent Accumulation: Replace active signals
        // Keep expired signals for history (limit 20)
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