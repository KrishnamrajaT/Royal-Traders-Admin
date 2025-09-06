// components/Card.jsx
import React from 'react';
// import './Card.css';

const Card = ({ message, onEdit, onDelete }) => {
  return (
    <div className="card">
      <div className="card-content">
        <p className="card-message">{message}</p>
      </div>
      <div className="card-actions">
        <button 
          className="btn-edit" 
          onClick={onEdit}
          aria-label="Edit message"
        >
          ✏️
        </button>
        <button 
          className="btn-delete" 
          onClick={onDelete}
          aria-label="Delete message"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default Card;