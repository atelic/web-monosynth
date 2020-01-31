import React from "react";
import Pizzicato from "pizzicato";
import Slider from "rc-slider";
import { NOTE_FREQ_MAP } from "./constants";

import "rc-slider/assets/index.css";
import "./synth.css";

const WAVE_OPTIONS_DEFAULT = {
  type: "sine",
  release: 0.6
};

class Synth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      octave: 3,
      distortionGain: 0,
      filterFreq: 22000,
      waveShape: "sine",
      lowpassFilter: new Pizzicato.Effects.LowPassFilter({ frequency: 22000 }),
      distortion: new Pizzicato.Effects.Distortion({
        gain: 0.3,
        type: "distortion"
      }) // null
    };
    this.wave = new Pizzicato.Sound({
      source: "wave",
      frequency: 440,
      options: WAVE_OPTIONS_DEFAULT
    });
  }

  handleKeyDown(event) {
    if (Object.keys(NOTE_FREQ_MAP).indexOf(event.keyCode.toString()) !== -1) {
      console.log(this.state.octave);
      this.wave.frequency = NOTE_FREQ_MAP[event.keyCode][this.state.octave];
      console.log(this.wave);
      this.wave.play();
    }
    if (event.keyCode === 90) {
      // Z key pushes the octave down
      const newOct = this.state.octave - 1;
      if (newOct >= 0) {
        this.setState({ octave: this.state.octave - 1 });
      }
    }
    if (event.keyCode === 88) {
      // X key pushes the octave up
      const newOct = this.state.octave + 1;
      if (newOct <= 5) {
        this.setState({ octave: newOct });
      }
    }
  }

  handleKeyUp(event) {
    if (Object.keys(NOTE_FREQ_MAP).indexOf(event.keyCode.toString()) !== -1) {
      this.wave.stop();
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  lowpass = freq => {
    this.setState({
      lowpassFilter: new Pizzicato.Effects.LowPassFilter({ frequency: freq })
    });
    console.log(this.state);
  };

  distort = gain => {
    console.log(gain);
    if (gain === 0) {
      // this.wave.removeEffect(this.state.distortion);
      this.setState({ distortion: null });
    } else {
      this.setState({ distortion: new Pizzicato.Effects.Distortion({ gain }) });
    }
  };

  volume = vol => {
    this.wave.volume = vol;
  };

  attack = a => {
    this.wave.attack = a;
  };

  release = r => {
    this.wave.release = r;
  };

  render() {
    const handleWaveChange = event => {
      console.log(event.target.value);
      this.wave = new Pizzicato.Sound({
        source: "wave",
        options: { type: event.target.value, release: 0.6 }
      });
    };

    return (
      <div className="App">
        <h3>Play using your keyboard! Change octave with Z and X</h3>
        <div className="master">
          <h2>Master:</h2>
          <div className="master-wave">
            <label htmlFor="wave-select">Waveform:</label>
            <br />
            <select
              id="wave-select"
              onChange={handleWaveChange}
              value={this.waveShape}
            >
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="sawtooth">Sawtooth</option>
            </select>
          </div>
          <div className="master-volume">
            Volume
            <Slider
              max={1}
              min={0}
              step={0.01}
              defaultValue={1}
              onChange={a => this.volume(a)}
            />
          </div>
          <div className="master-attack">
            Attack
            <Slider
              max={10}
              min={0}
              step={0.01}
              defaultValue={0.04}
              onChange={a => this.attack(a)}
            />
          </div>
          <div className="master-release">
            Release
            <Slider
              max={10}
              min={0}
              step={0.01}
              defaultValue={0.04}
              onChange={a => this.release(a)}
            />
          </div>
        </div>

        <div className="filters">
          <h2>Filters:</h2>
          <div className="filters-lowpass">
            Low pass filter:
            <Slider
              max={22050}
              min={10}
              defaultValue={this.state.filterFreq}
              onChange={a => this.lowpass(a)}
            />
          </div>
          <div className="filters-highpass">
            High pass filter:
            <Slider
              max={22050}
              min={10}
              defaultValue={10}
              // onChange={a => highPass(a)}
            />
          </div>
        </div>

        <div className="reverb">
          <h2>Reverb</h2>
        </div>
        <div className="scope">
          Oscilliscope or something will go here? Maybe a keyboard
          visualization?
        </div>
        <div className="delay">
          <h2>Delay</h2>
        </div>

        <div className="distortion">
          <h2>Distortion</h2>
          Gain:
          <Slider
            max={1}
            min={0}
            step={0.01}
            defaultValue={this.state.distortionGain}
            onChange={a => this.distort(a)}
          />
        </div>
      </div>
    );
  }
}

export default Synth;
