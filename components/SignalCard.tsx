import React, { useState, useEffect } from 'react';
import { Signal } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Clock, Copy, ExternalLink, Bot } from 'lucide-react';
import { BROKER_URL } from '../constants';

interface SignalCardProps {
  signal: Signal;
  detailed?: boolean;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, detailed = false }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (signal.status !== 'active') {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((signal.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [signal.expiresAt, signal.status]);

  const isExpired = signal.status === 'expired' || (signal.status === 'active' && timeLeft === 0);
  
  // Dynamic Styles
  const isBuy = signal.direction === 'BUY';
  const borderColor = isExpired ? 'border-gray-700' : (isBuy ? 'border-neon-green' : 'border-neon-red');
  const glowColor = isExpired ? '' : (isBuy ? 'shadow-[0_0_15px_rgba(0,255,157,0.15)]' : 'shadow-[0_0_15px_rgba(255,0,85,0.15)]');
  const opacity = isExpired ? 'opacity-60 grayscale' : 'opacity-100';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = () => {
      alert(`Ordem copiada: ${signal.direction} BTC em ${signal.entryPrice}`);
  };

  // Clean display of symbol to remove USDT suffix if present
  const displaySymbol = signal.symbol ? signal.symbol.replace('USDT', '') : 'BTC';

  return (
    <div className={`relative bg-card-bg border ${borderColor} rounded-xl p-5 mb-4 transition-all duration-300 ${glowColor} ${opacity} group`}>
      {/* Bot Badge */}
      {signal.generatedBy === 'AUTO_BOT' && (
          <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg z-10 border border-purple-400">
              <Bot size={10} /> AUTO
          </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isBuy ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'}`}>
                {isBuy ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
            </div>
            <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                    {displaySymbol}
                    <span className={`text-xs px-2 py-0.5 rounded border ${isBuy ? 'border-neon-green text-neon-green' : 'border-neon-red text-neon-red'}`}>
                        {signal.direction === 'BUY' ? 'COMPRA' : 'VENDA'}
                    </span>
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                    {new Date(signal.createdAt).toLocaleTimeString()}
                </span>
            </div>
        </div>
        
        {/* Timer / Status Badge */}
        <div className="text-right">
            {signal.status === 'active' && !isExpired ? (
                <div className="flex flex-col items-end">
                     <span className="text-xs text-gray-400 mb-1">Expira em</span>
                     <div className="text-xl font-mono font-bold text-white animate-pulse">
                        {formatTime(timeLeft)}
                     </div>
                </div>
            ) : (
                <span className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 font-bold border border-gray-700">
                    {signal.status.toUpperCase()}
                </span>
            )}
        </div>
      </div>

      {/* Prices Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4 bg-black/20 p-3 rounded-lg border border-white/5">
         <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase">Entrada</p>
            <p className="font-mono text-white font-bold">{signal.entryPrice.toLocaleString()}</p>
         </div>
         <div className="text-center border-l border-gray-700">
            <p className="text-[10px] text-gray-500 uppercase">Stop Loss</p>
            <p className="font-mono text-neon-red">{signal.stopLoss.toLocaleString()}</p>
         </div>
         <div className="text-center border-l border-gray-700">
            <p className="text-[10px] text-gray-500 uppercase">Take Profit</p>
            <p className="font-mono text-neon-green">{signal.takeProfit[0].toLocaleString()}</p>
         </div>
      </div>

      {/* Info */}
      <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
         <div className="flex items-center gap-1">
            <Clock size={12} /> Duração: <span className="text-white">{signal.duration}</span>
         </div>
         {signal.notes && (
             <div className="italic text-gray-500">"{signal.notes}"</div>
         )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
          <button 
            onClick={copyToClipboard}
            className="w-14 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg transition-colors"
            title="Copiar"
          >
            <Copy size={20} />
          </button>
          
          <a 
            href={BROKER_URL}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/50 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
             Abrir Corretora <ExternalLink size={16} />
          </a>
      </div>
    </div>
  );
};

export default SignalCard;