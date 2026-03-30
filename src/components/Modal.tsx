import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0, 31, 92, 0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', padding: '30px', borderRadius: '24px',
        width: '100%', maxWidth: '450px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px', border: 'none',
          background: 'none', fontSize: '20px', cursor: 'pointer', color: '#ccc'
        }}>✕</button>
        
        <h2 style={{ color: 'var(--primary-blue)', marginTop: 0 }}>{title}</h2>
        <div style={{ marginTop: '20px' }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;