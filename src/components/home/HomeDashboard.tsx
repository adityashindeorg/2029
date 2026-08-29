import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRelationship } from '../../hooks/useRelationship';
import { useAuth } from '../../hooks/useAuth';
import { getMilestones } from '../../services/milestoneService';
import { getDiaryEntries } from '../../services/diaryService';
import { getMeetings } from '../../services/meetingService';
import { Milestone } from '../../types/milestone';
import { Meeting } from '../../types/meeting';
import { DiaryEntry } from '../../types/diary';

export const HomeDashboard: React.FC = () => {
  const { relationship, loading, error } = useRelationship();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [latestMilestone, setLatestMilestone] = useState<Milestone | null>(null);
  const [recents, setRecents] = useState<DiaryEntry[]>([]);
  const [nextMeeting, setNextMeeting] = useState<Meeting | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const milestones = await getMilestones();
        if (milestones.length > 0) {
          // Find closest milestone or wedding milestone
          setLatestMilestone(milestones[milestones.length - 1]);
        }

        const diaries = await getDiaryEntries();
        setRecents(diaries.slice(0, 4));

        const meetings = await getMeetings();
        const upcoming = meetings.filter((m) => !m.completed);
        if (upcoming.length > 0) {
          setNextMeeting(upcoming[0]);
        }
      } catch (err) {
        console.error('Failed to load dashboard highlights:', err);
      }
    };
    loadData();
  }, []);

  const calculateTimeElapsed = (dateStr?: string) => {
    const defaultDate = '2020-04-28';
    const targetStr = dateStr || defaultDate;
    const formatted = targetStr.includes('T') ? targetStr : `${targetStr}T00:00:00`;
    const start = new Date(formatted);
    const validStart = isNaN(start.getTime()) ? new Date(`${defaultDate}T00:00:00`) : start;
    const diffMs = Math.max(0, currentTime.getTime() - validStart.getTime());
    
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return { days, hours, minutes, seconds };
  };

  const calculateTimeRemaining = (dateStr?: string) => {
    const defaultDate = '2029-12-31';
    const targetStr = dateStr || defaultDate;
    const formatted = targetStr.includes('T') ? targetStr : `${targetStr}T00:00:00`;
    const target = new Date(formatted);
    const validTarget = isNaN(target.getTime()) ? new Date(`${defaultDate}T00:00:00`) : target;
    const diffMs = validTarget.getTime() - currentTime.getTime();
    
    if (diffMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return { days, hours, minutes, seconds };
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const name = user?.displayName || user?.name || (user?.email?.includes('partner2') ? 'Janhvi' : 'Aditya');
    if (hour < 12) return `Good morning, ${name}.`;
    if (hour < 18) return `Good afternoon, ${name}.`;
    return `Good evening, ${name}.`;
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray)' }}>
        <p className="onb-tagline">Opening Aditya &amp; Janhvi's space...</p>
      </div>
    );
  }

  const elapsed = calculateTimeElapsed(relationship?.startDate);
  const remaining = calculateTimeRemaining(relationship?.marriageDate);

  return (
    <div>
      {/* Top App Bar */}
      <div className="app-topbar">
        <div>
          <div className="meta">
            <span className="dot" />
            Aditya &amp; Janhvi · Since April 28, 2020
          </div>
          <div className="greeting">{getGreeting()}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            <div className="counter-pill">
              <span className="ui-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
                </svg>
              </span>
              <span>
                <b>{elapsed.days.toLocaleString()}d</b> {String(elapsed.hours).padStart(2, '0')}h {String(elapsed.minutes).padStart(2, '0')}m {String(elapsed.seconds).padStart(2, '0')}s
              </span>
              &nbsp;of love
            </div>
            <div className="counter-pill">
              <span className="ui-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
              <span>
                <b>{remaining.days.toLocaleString()}d</b> {String(remaining.hours).padStart(2, '0')}h {String(remaining.minutes).padStart(2, '0')}m {String(remaining.seconds).padStart(2, '0')}s
              </span>
              &nbsp;to 2029 wedding
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ margin: '16px 20px', color: '#ff8f9c', background: 'rgba(179,18,45,0.18)', borderRadius: '12px', padding: '12px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Prompt Card */}
      <div className="section-pad">
        <div className="prompt-card">
          <div className="q">What do you want to remember about today?</div>
          <button className="btn btn-primary" onClick={() => navigate('/diary?action=create')}>
            Write today's diary
          </button>
        </div>
      </div>

      {/* Childhood Memory & Journey Teaser */}
      <div className="sec-head">
        <span className="eyebrow">Our Story (2010 → 2029)</span>
        <span className="link" onClick={() => navigate('/milestones')}>
          View Timeline
        </span>
      </div>
      <div className="otd-card" onClick={() => navigate('/milestones')}>
        <div className="otd-icon" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
          <span style={{ fontSize: '20px' }}>🦜</span>
        </div>
        <div>
          <div className="t">Since Childhood (2010)</div>
          <div className="x">"When Adi first drew a parrot for Janhvi... to marrying in 2029."</div>
        </div>
      </div>

      {/* Upcoming Meeting / Date Highlight */}
      <div className="sec-head">
        <span className="eyebrow">Next Upcoming Date</span>
        <span className="link" onClick={() => navigate('/meetings')}>
          View all
        </span>
      </div>
      {nextMeeting ? (
        <div className="otd-card" onClick={() => navigate('/meetings')}>
          <div className="otd-icon">
            <span className="ui-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
          </div>
          <div>
            <div className="t">{nextMeeting.date} {nextMeeting.time ? `@ ${nextMeeting.time}` : ''}</div>
            <div className="x">"{nextMeeting.title}" {nextMeeting.location ? `at ${nextMeeting.location}` : ''}</div>
          </div>
        </div>
      ) : (
        <div className="otd-card" onClick={() => navigate('/meetings')}>
          <div className="otd-icon">
            <span className="ui-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
          </div>
          <div>
            <div className="t">No upcoming meeting</div>
            <div className="x">Tap to schedule your next date or dinner together.</div>
          </div>
        </div>
      )}

      {/* Latest Milestone Highlight */}
      {latestMilestone && (
        <>
          <div className="sec-head">
            <span className="eyebrow">Featured Milestone</span>
            <span className="link" onClick={() => navigate('/milestones')}>
              Full Timeline
            </span>
          </div>
          <div className="otd-card" onClick={() => navigate('/milestones')}>
            <div className="otd-icon" style={{ borderColor: 'var(--crimson-bright)', color: 'var(--crimson-bright)' }}>
              <span className="ui-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
                </svg>
              </span>
            </div>
            <div>
              <div className="t">{latestMilestone.date}</div>
              <div className="x">"{latestMilestone.title}"</div>
            </div>
          </div>
        </>
      )}

      {/* Recent Diary Entries */}
      <div className="sec-head">
        <span className="eyebrow">Recent Memories</span>
        <span className="link" onClick={() => navigate('/diary')}>
          See all
        </span>
      </div>

      {recents.length > 0 ? (
        recents.map((entry) => (
          <div key={entry.id} className="diary-card" onClick={() => navigate(`/diary?read=${entry.id}`)}>
            <div className="row1">
              <span className="badge badge-shared">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                  <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
                </svg>
                Memory
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gray-dim)', fontWeight: 700 }}>{entry.date}</span>
            </div>
            <div className="title">{entry.title}</div>
            <div className="excerpt">{entry.content}</div>
          </div>
        ))
      ) : (
        <div className="empty-state" style={{ padding: '30px 20px' }}>
          <div className="glyph">✒</div>
          <div className="h">No memories yet.</div>
          <div className="s">Tonight could be the first page.</div>
          <button className="btn btn-primary btn-sm" style={{ margin: '0 auto' }} onClick={() => navigate('/diary?action=create')}>
            Write something
          </button>
        </div>
      )}

      <div style={{ height: '30px' }} />
    </div>
  );
};
