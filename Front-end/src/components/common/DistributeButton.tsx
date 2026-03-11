import React from 'react';
import styled from 'styled-components';

interface DistributeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
  label?: string;
  isUndo?: boolean; // To handle the "Undo" state style
  loading?: boolean; // Show spinner during distribution
}

const DistributeButton: React.FC<DistributeButtonProps> = ({ onClick, disabled, title, style, label = "Distribuer", isUndo = false, loading = false }) => {
  return (
    <StyledWrapper style={style} $isUndo={isUndo}>
      <button 
        className={`noselect distribute-button ${isUndo ? 'undo' : ''} ${loading ? 'loading' : ''}`} 
        onClick={onClick} 
        disabled={disabled || loading}
        title={loading ? 'Distribution en cours...' : title}
        type="button"
      >
        <span className="text">{loading ? 'En cours...' : label}</span>
        <span className="icon">
           {loading ? (
              <span className="spinner" />
           ) : isUndo ? (
              // Undo Icon
               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 14L4 9L9 4" stroke="#eee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 20V13C20 11.9391 19.5786 10.9217 18.8284 10.1716C18.0783 9.42143 17.0609 9 16 9H4" stroke="#eee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
           ) : (
              // Send/Distribute Icon
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="#eee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#eee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           )}
        </span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ $isUndo: boolean }>`
  display: inline-block;

  .distribute-button {
    width: 150px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    background: ${props => props.$isUndo ? 'rgb(50, 50, 50)' : 'rgb(20, 20, 20)'}; /* Lighter grey for Undo? Or same? Keeping similar for now */
    border: none;
    border-radius: 5px;
    box-shadow: 1px 1px 3px rgba(0,0,0,0.15);
    position: relative;
    overflow: hidden;
  }

  .distribute-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.6;
  }
  
  .distribute-button:disabled .icon {
    border-left: 1px solid #aaa;
  }

  .distribute-button, .distribute-button span {
    transition: 200ms;
  }

  .distribute-button .text {
    transform: translateX(20px);
    color: white;
    font-weight: bold;
    width: 100%;
    text-align: left;
    padding-left: 15px;
    opacity: 1;
    font-size: 0.9em; /* Slightly smaller text if "Distribuer" is long */
  }

  .distribute-button .icon {
    position: absolute;
    border-left: 1px solid rgb(50, 50, 50);
    right: 0;
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .distribute-button svg {
    width: 17px;
    /* fill: #eee;  SVG uses stroke now for clearer icons, removed fill */
  }

  /* Hover state */
  .distribute-button:hover:not(:disabled) {
    background: ${props => props.$isUndo ? 'rgb(50,50,50)' : 'rgb(20, 20, 20)'};
  }

  .distribute-button:hover:not(:disabled) .text {
    color: transparent;
  }

  .distribute-button:hover:not(:disabled) .icon {
    width: 150px;
    border-left: none;
    transform: translateX(0);
    /* Colors: Undo -> Orange/Grey? Distribute -> Green/Purple? 
       User asked for similar to edit (Blue) button but didn't specify color.
       Let's use a nice Purple or Teal for Distribution to distinguish from Edit(Blue) and Delete(Red) and Add(Green).
       Let's go with a Teal/Cyan for "Send/Distribute" and maybe Orange for "Undo".
    */
    background: ${props => props.$isUndo ? '#f39c12' : '#00b894'}; 
  }

  .distribute-button:focus {
    outline: none;
  }

  .distribute-button:active:not(:disabled) .icon svg {
    transform: scale(0.8);
  }

  /* Loading spinner */
  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(238, 238, 238, 0.3);
    border-top: 2px solid #eee;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .distribute-button.loading {
    opacity: 0.8;
    cursor: wait;
  }`;

export default DistributeButton;
