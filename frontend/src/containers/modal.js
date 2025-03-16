import React from 'react';
import './css/modal.css';

const Modal = ({ children, onClose, message = null }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>X</button>
        {/* Render message if provided, otherwise render children */}
        {message ? <p>{message}</p> : children}
      </div>
    </div>
  );
};

export default Modal;
