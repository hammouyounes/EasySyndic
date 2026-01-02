import React from 'react';
import { Button, type ButtonProps } from 'antd';

const DefaultButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button {...props}>
      {props.children}
    </Button>
  );
};

export default DefaultButton;