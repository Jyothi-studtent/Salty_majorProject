import React from 'react';
import './css/modal.css';

const Modal = ({ children, onClose, message = null }) => {
  return (
    <div className="modal-overlay-general" onClick={onClose}>
      <div className="modal-content-general" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-general" onClick={onClose}>X</button>
        {/* Render message if provided, otherwise render children */}
        {message ? <p>{message}</p> : children}
      </div>
    </div>
  );
};

export default Modal;
