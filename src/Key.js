import React from "react";

export const Key = props => {
  const { classNames, onClick, children, keyCode, activeKeyCode } = props;

  return (
    <div
      className={`${classNames} ${activeKeyCode === keyCode ? "active" : ""}`}
      onClick={onClick(keyCode)}
    >
      {children}
    </div>
  );
};
