import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRelationship } from '../../hooks/useRelationship';

export const Layout: React.FC = () => {
  const { logout, user } = useAuth();
  const { relationship, updateRelationshipDetails, loading: relLoading } = useRelationship();
  const location = useLocation();
  const navigate = useNavigate();

  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [isEditingRel, setIsEditingRel] = useState(false);
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [startDate, setStartDate] = useState('');
  const [marriageDate, setMarriageDate] = useState('');

  const openSpaceModal = () => {
    if (relationship) {
      setPartner1Name(relationship.partner1Name);
      setPartner2Name(relationship.partner2Name);
      setStartDate(relationship.startDate);
      setMarriageDate(relationship.marriageDate || '2029-12-31');
    }
    setIsEditingRel(false);
    setShowSpaceModal(true);
  };

  const handleSaveRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateRelationshipDetails({
        partner1Name,
        partner2Name,
        startDate,
        marriageDate,
      });
      setIsEditingRel(false);
    } catch (err) {
      console.error('Failed to update relationship:', err);
    }
  };

  const calculateDaysTogether = () => {
    if (!relationship?.startDate) return 0;
    const start = new Date(relationship.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleFabClick = () => {
    if (location.pathname === '/diary') {
      const event = new CustomEvent('open-diary-editor');
      window.dispatchEvent(event);
    } else if (location.pathname === '/milestones') {
      const event = new CustomEvent('open-milestone-editor');
      window.dispatchEvent(event);
    } else if (location.pathname === '/meetings') {
      const event = new CustomEvent('open-meeting-editor');
      window.dispatchEvent(event);
    } else if (location.pathname === '/plans') {
      const event = new CustomEvent('open-plan-editor');
      window.dispatchEvent(event);
    } else {
      navigate('/diary?action=create');
    }
  };

  return (
    <div className="phone-frame">
      <div className="app">
        <div className="notch"></div>

        <div className="main-app active">
          {/* Main scrollable body */}
          <div className="tab-panels">
            <div className="tab-panel active">
              <Outlet />
            </div>
          </div>

          {/* Floating Action Button */}
          <button className="fab" id="fabWrite" onClick={handleFabClick} title="Add Entry">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
          </button>

          {/* Velvet Bottom Navigation */}
          <nav className="bottom-nav">
            <NavLink to="/" end className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l9-8 9 8" />
                <path d="M5 10v10h14V10" />
              </svg>
              <span>Home</span>
            </NavLink>

            <NavLink to="/diary" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5" />
                <path d="M4 4.5v16A2.5 2.5 0 0 0 6.5 23H20" />
              </svg>
              <span>Journal</span>
            </NavLink>

            <NavLink to="/milestones" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7.5-4.7-10-9.3C.4 8 2.3 4 6.3 4c2.1 0 3.7 1.4 5.7 3.9C13.9 5.4 15.5 4 17.7 4c4 0 5.9 4 4.3 7.7C19.5 16.3 12 21 12 21z" />
              </svg>
              <span>Moments</span>
            </NavLink>

            <NavLink to="/meetings" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Meetings</span>
            </NavLink>

            <NavLink to="/plans" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Plans</span>
            </NavLink>

            <button type="button" className={`nav-btn ${showSpaceModal ? 'active' : ''}`} onClick={openSpaceModal}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
              </svg>
              <span>Space</span>
            </button>
          </nav>
        </div>

        {/* Backdrop for Space Sheet */}
        <div
          className={`sheet-backdrop ${showSpaceModal ? 'show' : ''}`}
          onClick={() => setShowSpaceModal(false)}
        />

        {/* Space Sheet Modal */}
        <div className={`sheet ${showSpaceModal ? 'show' : ''}`}>
          <div className="sheet-grab" />
          <div className="sheet-head">
            <span className="eyebrow">Our Space</span>
            <button className="icon-btn" onClick={() => setShowSpaceModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="sheet-body">
            {!isEditingRel ? (
              <>
                <div className="space-hero" style={{ margin: '10px 0 20px' }}>
                  <div className="heart">
                    <span className="ui-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
                      </svg>
                    </span>
                  </div>
                  <div className="name">
                    {relationship?.partner1Name} &amp; {relationship?.partner2Name}
                  </div>
                  <div className="since">Together since {relationship?.startDate}</div>
                  <div className="stats">
                    <div className="stat">
                      <b>{calculateDaysTogether()}</b>
                      <span>Days Together</span>
                    </div>
                    <div className="stat">
                      <b>2029</b>
                      <span>Target Year</span>
                    </div>
                  </div>
                </div>

                <div className="list-group" style={{ margin: '0 0 20px' }}>
                  <div className="list-row" onClick={() => setIsEditingRel(true)}>
                    <div className="ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                    <div className="lbl">Edit Partner Names &amp; Dates</div>
                    <div className="chev">›</div>
                  </div>

                  <div className="list-row">
                    <div className="ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                        <rect x="5" y="10" width="14" height="10" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                    </div>
                    <div className="lbl">
                      Logged in as {user?.displayName || user?.name || user?.email}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="danger-btn"
                  style={{ width: '100%', margin: '0 0 10px' }}
                  onClick={() => {
                    setShowSpaceModal(false);
                    logout();
                  }}
                >
                  Lock Journal &amp; Log Out
                </button>
              </>
            ) : (
              <form onSubmit={handleSaveRelationship} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                <div className="field">
                  <label>Partner 1 Name</label>
                  <input
                    type="text"
                    value={partner1Name}
                    onChange={(e) => setPartner1Name(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Partner 2 Name</label>
                  <input
                    type="text"
                    value={partner2Name}
                    onChange={(e) => setPartner2Name(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Relationship Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Marriage / Target Date</label>
                  <input
                    type="date"
                    value={marriageDate}
                    onChange={(e) => setMarriageDate(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => setIsEditingRel(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={relLoading}
                  >
                    {relLoading ? 'Saving...' : 'Save Space'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
