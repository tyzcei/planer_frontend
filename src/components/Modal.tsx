import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(15, 45, 77, 0.6)', 
        backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div style={{
        background: 'white', padding: '35px', borderRadius: '28px',
        width: '90%', maxWidth: '480px',
        boxShadow: '0 25px 60px rgba(167, 118, 147, 0.15)',
        position: 'relative',
        transform: 'translateY(0)',
        transition: '0.3s'
      }}>
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute', top: '22px', right: '22px', border: 'none',
            background: 'none', fontSize: '22px', cursor: 'pointer', 
            color: 'var(--color-sand)', transition: '0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-purple)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-sand)'}
        >
          ✕
        </button>
        
        <h2 style={{ 
          color: 'var(--color-purple)', 
          marginTop: 0, 
          fontSize: '24px',
          fontWeight: '700' 
        }}>
          {title}
        </h2>

        <div style={{ marginTop: '25px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;