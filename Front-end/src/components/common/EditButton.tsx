import React from 'react';
import styled from 'styled-components';

interface EditButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
  label?: string;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick, disabled, title, style, label = "Modifier" }) => {
  return (
    <StyledWrapper style={style}>
      <button 
        className="noselect edit-button" 
        onClick={onClick} 
        disabled={disabled}
        title={title}
        type="button"
      >
        <span className="text">{label}</span>
        <span className="icon">
          <svg className="edit-svgIcon" viewBox="0 0 512 512">
            <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
          </svg>
        </span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: inline-block;

  .edit-button {
    width: 150px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    background: rgb(20, 20, 20);
    border: none;
    border-radius: 5px;
    box-shadow: 1px 1px 3px rgba(0,0,0,0.15);
    position: relative;
    overflow: hidden;
  }

  .edit-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.6;
  }
  
  .edit-button:disabled .icon {
    border-left: 1px solid #aaa;
  }

  .edit-button, .edit-button span {
    transition: 200ms;
  }

  .edit-button .text {
    transform: translateX(20px);
    color: white;
    font-weight: bold;
    width: 100%;
    text-align: left;
    padding-left: 15px;
    opacity: 1;
  }

  .edit-button .icon {
    position: absolute;
    border-left: 1px solid rgb(50, 50, 50); /* Darker border for black button */
    right: 0;
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .edit-button svg {
    width: 17px;
    fill: #eee;
  }

  /* Hover state similar to Delete Button */
  .edit-button:hover:not(:disabled) {
    background: rgb(20, 20, 20); /* Keep base color or slightly lighter? Let's tick to design or go blue? Sticking to black/dark theme */
  }

  /* Optional: Make it blue on hover? Or just animate like delete?
     The delete makes text transparent and icon expands. 
  */

  .edit-button:hover:not(:disabled) .text {
    color: transparent;
  }

  .edit-button:hover:not(:disabled) .icon {
    width: 150px;
    border-left: none;
    transform: translateX(0);
    background: #1e90ff; /* Changed to Blue */
  }
  
  /* If we want the WHOLE button to change color on hover like DeleteButton */
  .edit-button:hover:not(:disabled) {
     /* background: rgb(255, 69, 69); Use the hover color from previous design */
     background: rgb(40,40,40);
  }

  .edit-button:hover:not(:disabled) .icon {
     background: #1e90ff; /* Changed to Blue */
  }

  .edit-button:focus {
    outline: none;
  }

  .edit-button:active:not(:disabled) .icon svg {
    transform: scale(0.8);
  }`;

export default EditButton;
