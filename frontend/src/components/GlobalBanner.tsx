// src/components/GlobalBanner.tsx

import React from 'react';

interface GlobalBannerProps {
  message: string;
  onClose: () => void;
}

const GlobalBanner: React.FC<GlobalBannerProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      background: '#f8d7da',
      color: '#842029',
      padding: '1rem',
      textAlign: 'center',
      zIndex: 1000,
    }}>
      {message}
      <button
        onClick={onClose}
        style={{
          marginLeft: '1rem',
          background: 'transparent',
          border: 'none',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
};

export default GlobalBanner;
