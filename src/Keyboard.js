import React from "react";
import Key from "./Key";

export class Keyboard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="keyboard">
        <Key
          classNames="div1 white-key"
          keyCode={65}
          activeKeyCode={this.props.activeKeyCode}
        >
          C
        </Key>
        <div className="div2 white-key"> D </div>
        <div className="div3 white-key"> E </div>
        <div className="div4 white-key"> F </div>
        <div className="div5 white-key"> G </div>
        <div className="div6 white-key"> A </div>
        <div className="div7 white-key"> B </div>
        <div className="div8 white-key"> C </div>
        <div className="div9 white-key"> D </div>
        <div className="div10 black-key"> C# </div>
        <div className="div11 black-key"> D# </div>
        <div className="div12 black-key"> F# </div>
        <div className="div13 black-key"> G# </div>
        <div className="div14 black-key"> A# </div>
        <div className="div15 black-key"> C# </div>
      </div>
    );
  }
}
