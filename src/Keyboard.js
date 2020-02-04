import React from "react";
import { Key } from "./Key";

import './keyboard.css'

export const Keyboard  = props => {
  const { activeKeyCode, onMouseDown, onMouseUp } = props;
  return (
    <div className="keyboard">
      <Key
        classNames="div1 white-key"
        keyCode={65}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        C
      </Key>
      <Key
        classNames="div2 white-key"
        keyCode={83}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        D
      </Key>
      <Key
        classNames="div3 white-key"
        keyCode={68}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        E
      </Key>
      <Key
        classNames="div4 white-key"
        keyCode={70}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        F
      </Key>
      <Key
        classNames="div5 white-key"
        keyCode={71}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        G
      </Key>
      <Key
        classNames="div6 white-key"
        keyCode={72}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        A
      </Key>
      <Key
        classNames="div7 white-key"
        keyCode={74}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        B
      </Key>
      <Key
        classNames="div8 white-key"
        keyCode={75}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        C
      </Key>
      <Key
        classNames="div9 white-key"
        keyCode={76}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        D
      </Key>
      <Key
        classNames="div10 black-key"
        keyCode={87}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        C#
      </Key>
      <Key
        classNames="div11 black-key"
        keyCode={69}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        D#
      </Key>
      <Key
        classNames="div12 black-key"
        keyCode={84}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        F#
      </Key>
      <Key
        classNames="div13 black-key"
        keyCode={89}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        G#
      </Key>
      <Key
        classNames="div14 black-key"
        keyCode={85}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        A#
      </Key>
      <Key
        classNames="div15 black-key"
        keyCode={79}
        activeKeyCode={activeKeyCode}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        C#
      </Key>
    </div>
  );
};
