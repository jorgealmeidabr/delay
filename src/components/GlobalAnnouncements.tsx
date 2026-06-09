import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, Megaphone, X } from 'lucide-react';
import { Announcement } from '../pages/Comunicados';

export default function GlobalAnnouncements() {
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);
  const [closedIds, setClosedIds] = useState<string[]>([]);

  useEffect(() => {
    // Check localStorage for closed announcements to not annoy the user every page load
    const storedClosed = JSON.parse(localStorage.getItem('closed_announcements') || '[]');
    setClosedIds(storedClosed);

    const list: Announcement[] = JSON.parse(localStorage.getItem('system_announcements') || '[]');
    
    const now = new Date();
    
    // Filter active ones
    const active = list.filter(a => {
      const isExpired = new Date(a.expirationDate + 'T23:59:59') < now;
      const isScheduled = new Date(a.startDate + 'T00:00:00') > now;
      return !isExpired && !isScheduled;
    });
    
    setActiveAnnouncements(active);
  }, []);

  const handleClose = (id: string) => {
    const newClosed = [...closedIds, id];
    setClosedIds(newClosed);
    localStorage.setItem('closed_announcements', JSON.stringify(newClosed));
  };

  const getStyles = (priority: string) => {
    switch (priority) {
      case 'urgente': return { bg: 'bg-red-500', text: 'text-white', icon: AlertCircle };
      case 'importante': return { bg: 'bg-yellow-500', text: 'text-black', icon: Info };
      default: return { bg: 'bg-blue-500', text: 'text-white', icon: Megaphone };
    }
  };

  const visibleAnnouncements = activeAnnouncements.filter(a => !closedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="w-full z-50 sticky top-0">
      {visibleAnnouncements.map(announcement => {
        const styles = getStyles(announcement.priority);
        const Icon = styles.icon;
        
        return (
          <div key={announcement.id} className={`${styles.bg} ${styles.text} px-4 py-3 relative`}>
            <div className="max-w-6xl mx-auto flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="font-bold text-sm sm:text-base leading-tight">{announcement.title}</p>
                  <p className="text-xs sm:text-sm opacity-90 mt-0.5">{announcement.content}</p>
                </div>
              </div>
              <button 
                onClick={() => handleClose(announcement.id)}
                className={`p-1 hover:bg-black/10 rounded-lg transition flex-shrink-0 ${styles.text}`}
                title="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
