import React from 'react';
import styled from 'styled-components';

interface AddButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
  label?: string;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, disabled, title, style, label = "Ajouter" }) => {
  return (
    <StyledWrapper style={style}>
      <button 
        className="noselect add-button" 
        onClick={onClick} 
        disabled={disabled}
        title={title}
        type="button"
      >
        <span className="text">{label}</span>
        <span className="icon">
          <span className="buttonSpan">+</span>
        </span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: inline-block;

  .add-button {
    width: 150px;
    height: 40px; /* Reduced to 40px to match other buttons */
    cursor: pointer;
    display: flex;
    align-items: center;
    background: #00a600;
    border: none;
    border-radius: 5px;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
  }

  .add-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.6;
  }

  .add-button,
  .add-button span {
    transition: 200ms;
  }

  .add-button .text {
    transform: translateX(35px);
    color: white;
    font-weight: bold;
    width: 100%;
    text-align: left;
    padding-left: 0;
  }

  .add-button .icon {
    position: absolute;
    border-left: 1px solid #007300;
    right: 0;
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .add-button:hover:not(:disabled) {
    background: #00a600;
  }

  .add-button:active:not(:disabled) {
    background: #00cc00;
  }

  .add-button:hover:not(:disabled) .text {
    color: transparent;
  }

  .add-button:hover:not(:disabled) .icon {
    width: 150px;
    border-left: none;
    transform: translateX(0);
  }

  .add-button:focus {
    outline: none;
  }

  .buttonSpan {
    color: white;
    font-size: 30px;
    /* margin: 150px; Removed to fix centering */
    line-height: 1; /* Helps vertical alignment */
  }`;

export default AddButton;
