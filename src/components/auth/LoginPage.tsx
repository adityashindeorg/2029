import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { user, login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('partner1@2029.app');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!code.trim()) {
      return;
    }
    try {
      await login(identifier, code.trim());
      navigate('/', { replace: true });
    } catch (err) {
      console.error('TOTP Login failed:', err);
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="phone-frame">
      <div className="app">
        <div className="notch"></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px', textAlign: 'center' }}>
          
          <div className="onb-crest" style={{ margin: '0 auto 20px' }}>
            <span className="ui-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
              </svg>
            </span>
          </div>

          <div className="wordmark" style={{ fontSize: '32px', marginBottom: '6px' }}>2029</div>
          <div className="onb-tagline">"Aditya &amp; Janhvi"</div>
          <p className="onb-sub" style={{ marginBottom: '24px' }}>
            A private memory archive, just for the two of you.
          </p>

          {error && (
            <div style={{ color: '#ff8f9c', background: 'rgba(179,18,45,0.18)', border: '1px solid rgba(179,18,45,0.4)', borderRadius: '14px', padding: '12px', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
            
            <div className="field">
              <label style={{ textAlign: 'center', marginBottom: '2px' }}>Who is stepping inside?</label>
              <div className="partner-selector">
                <button
                  type="button"
                  className={`partner-opt ${identifier === 'partner1@2029.app' ? 'active' : ''}`}
                  onClick={() => {
                    setIdentifier('partner1@2029.app');
                    clearError();
                  }}
                >
                  <span>❤️</span> Aditya
                </button>
                <button
                  type="button"
                  className={`partner-opt ${identifier === 'partner2@2029.app' ? 'active' : ''}`}
                  onClick={() => {
                    setIdentifier('partner2@2029.app');
                    clearError();
                  }}
                >
                  <span>💖</span> Janhvi
                </button>
              </div>
            </div>

            <div className="field">
              <label style={{ textAlign: 'center' }}>6-Digit Authenticator Code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
                autoFocus
                disabled={loading}
                style={{
                  fontSize: '22px',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  fontWeight: '700',
                  padding: '16px',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || code.length !== 6}
              style={{ marginTop: '6px' }}
            >
              {loading ? 'Opening our world...' : 'Unlock Our Space'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
