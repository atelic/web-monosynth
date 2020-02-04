import React from "react";

export const Key = props => {
  const { classNames, onMouseDown, onMouseUp, children, keyCode, activeKeyCode } = props;

  return (
    <div
      className={`${classNames} ${activeKeyCode === keyCode ? "active" : ""}`}
      onMouseDown={() => onMouseDown(keyCode)}
      onMouseUp={() => onMouseUp() }
    >
      {children}
    </div>
  );
};
