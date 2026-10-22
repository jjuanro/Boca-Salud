import React, { useEffect, useState } from 'react';
import { InAppNotification, notificationService } from '../utils/notificationService';
import { Bell, Droplets, Flame, Utensils, Footprints, Moon, X } from 'lucide-react';

export const DynamicIslandBanner: React.FC = () => {
  const [currentNotification, setCurrentNotification] = useState<InAppNotification | null>(null);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((item) => {
      setCurrentNotification(item);
      const timer = window.setTimeout(() => {
        setCurrentNotification((prev) => (prev?.id === item.id ? null : prev));
      }, 5500);
      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, []);

  if (!currentNotification) return null;

  const getIcon = () => {
    switch (currentNotification.type) {
      case 'water':
        return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'move':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'meal':
        return <Utensils className="w-4 h-4 text-emerald-400" />;
      case 'stand':
        return <Footprints className="w-4 h-4 text-amber-400" />;
      case 'night_review':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="fixed top-2 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300">
      <div 
        onClick={() => setCurrentNotification(null)}
        className="pointer-events-auto max-w-sm w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 flex items-start gap-3 backdrop-blur-xl animate-in slide-in-from-top-4 duration-300 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-white truncate">
              {currentNotification.title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {currentNotification.timestamp}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
            {currentNotification.message}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentNotification(null);
          }}
          className="text-slate-400 hover:text-white p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
