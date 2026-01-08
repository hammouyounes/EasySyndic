import React from 'react';
import styled from 'styled-components';

interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
  label?: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, disabled, title, style, label = "Supprimer" }) => {
  return (
    <StyledWrapper style={style}>
      <button 
        className="noselect delete-button" 
        onClick={onClick}
        disabled={disabled}
        title={title}
        type="button"
      >
        <span className="text">{label}</span>
        <span className="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
            <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
          </svg>
        </span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: inline-block;

  .delete-button {
   width: 150px;
   height: 40px; /* Reduced from 50px to better fit tables */
   cursor: pointer;
   display: flex;
   align-items: center;
   background: #e62222;
   border: none;
   border-radius: 5px;
   box-shadow: 1px 1px 3px rgba(0,0,0,0.15);
   position: relative;
   overflow: hidden;
  }

  .delete-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }
  
  .delete-button:disabled .icon {
    border-left: 1px solid #aaa;
  }

  .delete-button, .delete-button span {
   transition: 200ms;
  }

  .delete-button .text {
   transform: translateX(20px); /* Adjusted for French text length */
   color: white;
   font-weight: bold;
   width: 100%;
   text-align: left;
   padding-left: 15px;
  }

  .delete-button .icon {
   position: absolute;
   border-left: 1px solid #c41b1b;
   right: 0; /* Changed from translateX to right positioning for better stability */
   height: 40px;
   width: 40px;
   display: flex;
   align-items: center;
   justify-content: center;
   transform: translateX(0);
  }

  .delete-button svg {
   width: 15px;
   fill: #eee;
  }

  .delete-button:hover:not(:disabled) {
   background: #ff3636;
  }

  .delete-button:hover:not(:disabled) .text {
   color: transparent;
  }

  .delete-button:hover:not(:disabled) .icon {
   width: 150px;
   border-left: none;
   transform: translateX(0);
  }

  .delete-button:focus {
   outline: none;
  }

  .delete-button:active:not(:disabled) .icon svg {
   transform: scale(0.8);
  }`;

export default DeleteButton;
