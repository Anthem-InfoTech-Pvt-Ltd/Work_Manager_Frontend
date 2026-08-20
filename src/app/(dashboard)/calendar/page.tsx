'use client';

import { useEffect, useState } from 'react';
import { formatDateIndian } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import { projectsApi, boardsApi, tasksApi, adminApi, dashboardApi } from '@/lib/api';
import { getCachedData, setCachedData } from '@/lib/cache';

interface Event {
  id: number;
  title: string;
  date: string;
  project: string;
  color: string;
  priority: string;
}

export default function CalendarPage() {
  const { user, workspaceId } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [initialDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [realEvents, setRealEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const loadEvents = async () => {
    const isSuperAdmin = user?.roles?.includes('Super Admin');
    if (!isSuperAdmin && !workspaceId) return;

    const cacheKey = `calendar_events_${user?.id}_${workspaceId}`;
    const cachedEvents = getCachedData<Event[]>(cacheKey, 60000);

    if (cachedEvents) {
      setRealEvents(cachedEvents);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await dashboardApi.getCalendarEvents();
      const eventsList = res.data.data || [];
      setRealEvents(eventsList);
      setCachedData(cacheKey, eventsList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user, workspaceId]);

  const events = [...realEvents];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();
  // Get start day offset (0 = Sunday, 1 = Monday, etc.)
  const startDayOffset = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderDays = () => {
    const dayElements = [];
    
    // Add empty spacer cells for the previous month's offset
    for (let i = 0; i < startDayOffset; i++) {
      dayElements.push(
        <div key={`offset-${i}`} style={{
          minHeight: 110,
          minWidth: 0,
          border: '1px solid var(--border)',
          background: 'rgba(22, 22, 31, 0.2)',
          opacity: 0.3
        }} />
      );
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateString);

      dayElements.push(
        <div key={day} style={{
          minHeight: 110,
          minWidth: 0,
          border: '1px solid var(--border)',
          padding: '10px',
          background: 'var(--bg-card)',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'none';
        }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>{day}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, width: '100%', overflow: 'hidden' }}>
            {dayEvents.map(e => (
              <div
                key={e.id}
                onClick={(evt) => {
                  evt.stopPropagation();
                  setSelectedEvent(e);
                }}
                style={{
                  background: `${e.color}22`,
                  color: e.color,
                  fontSize: 10,
                  padding: '3px 8px',
                  borderRadius: 6,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  borderLeft: `3px solid ${e.color}`,
                  transition: 'opacity 0.2s',
                  width: '100%',
                }}
                onMouseEnter={ev => ev.currentTarget.style.opacity = '0.8'}
                onMouseLeave={ev => ev.currentTarget.style.opacity = '1'}
              >
                {e.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return dayElements;
  };

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1400, margin: '0 auto' }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Calendar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Schedule, track task deadlines, and monitor project milestones.
          </p>
        </div>
        
        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary btn-icon" onClick={prevMonth}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h3 style={{ fontSize: 16, fontWeight: 700, minWidth: 150, textAlign: 'center' }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button className="btn btn-secondary btn-icon" onClick={nextMonth}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date())} style={{ marginLeft: 8 }}>
            Today
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Main Grid */}
        <div className="card" style={{ padding: 24 }}>
          {/* Days of week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 10, marginBottom: 12, textAlign: 'center' }}>
            {daysOfWeek.map(d => (
              <div key={d} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', minWidth: 0 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 10 }}>
            {renderDays()}
          </div>
        </div>

        {/* Sidebar details */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, flexShrink: 0 }}>Upcoming Events</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              {(() => {
                const currentMonthEvents = events.filter(e => {
                  const [y, m] = e.date.split('-').map(Number);
                  return y === year && (m - 1) === month;
                });
                
                if (currentMonthEvents.length === 0) {
                  return (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                      No upcoming events for this month.
                    </p>
                  );
                }

                return currentMonthEvents.map(e => (
                  <div key={e.id}
                    onClick={() => setSelectedEvent(e)}
                    style={{
                      padding: 14,
                      background: 'var(--bg-secondary)',
                      border: `1px solid ${selectedEvent?.id === e.id ? e.color : 'var(--border)'}`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={el => el.currentTarget.style.borderColor = e.color}
                    onMouseLeave={el => { if (selectedEvent?.id !== e.id) el.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{e.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span>📅 {formatDateIndian(e.date)}</span>
                      <span>•</span>
                      <span style={{ color: e.color }}>{e.project}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Event Detail Modal */}
      {selectedEvent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="card fade-in"
            style={{
              width: '100%',
              maxWidth: 450,
              padding: 28,
              borderLeft: `4px solid ${selectedEvent.color}`,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700 }}>Event Details</h4>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  background: 'var(--bg-hover)',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 18,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>
              {selectedEvent.title}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Date:</span>
                <span style={{ fontWeight: 600 }}>{formatDateIndian(selectedEvent.date)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Project:</span>
                <span style={{ fontWeight: 600, color: selectedEvent.color }}>{selectedEvent.project}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Priority:</span>
                <span className={`badge badge-priority-${selectedEvent.priority}`}>{selectedEvent.priority}</span>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
