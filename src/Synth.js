import React from "react";
import Pizzicato from "pizzicato";
import Slider from "rc-slider";
import { NOTE_FREQ_MAP } from "./constants";

import "rc-slider/assets/index.css";
import "./synth.css";

const WAVE_OPTIONS_DEFAULT = {
  type: "sine",
  release: 0.6,
  volume: 0.75,
};

const MIN_OCTAVE = 0;
const MAX_OCTAVE = 5;

class Synth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      octave: 3,
      distortionGain: 0,
      waveShape: "sine",
      delayValues: {
        mix: 0,
        time: 0.4,
        feedback: 0.2
      },
      effects: {
        lowpassFilter: null,
        distortion: null,
        delay: null
      }
    };
    this.wave = new Pizzicato.Sound({
      source: "wave",
      frequency: 440,
      options: WAVE_OPTIONS_DEFAULT
    });
  }

  handleKeyDown(event) {
    if (Object.keys(NOTE_FREQ_MAP).indexOf(event.keyCode.toString()) !== -1) {
      this.wave.frequency = NOTE_FREQ_MAP[event.keyCode][this.state.octave];
      this.wave.play();
    }
    if (event.keyCode === 90) {
      // Z key pushes the octave down
      const newOct = this.state.octave - 1;
      if (newOct >= MIN_OCTAVE) {
        this.setState({ octave: this.state.octave - 1 });
      }
    }
    if (event.keyCode === 88) {
      // X key pushes the octave up
      const newOct = this.state.octave + 1;
      if (newOct <= MAX_OCTAVE) {
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
    console.log("not implemented");
    // const lowpassFilter = new Pizzicato.Effects.LowPassFilter({
    //   frequency: 400,
    //   peak: 10
    // });

    // const newEffects = {...this.state.effects, lowpassFilter};
    // console.log(newEffects);
    // this.setState({
    //   effects: { ...this.state.effects, lowpassFilter }
    // });
    // console.log(this.state);
  };

  distort = gain => {
    if (gain === 0) {
      // Remove distortion effect
      this.setState({ effects: { ...this.state.effects, distortion: null }, distortionGain: 0 });
    } else {
      const distortion = new Pizzicato.Effects.Distortion({ gain });
      this.setState({ effects: { ...this.state.effects, distortion }, distortionGain: gain });
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

  delayTime = time => {
    const newDelay = new Pizzicato.Effects.Delay({
      ...this.state.delayValues,
      time
    });
    this.setState({
      effects: { ...this.state.effects, delay: newDelay },
      delayValues: { ...this.state.delayValues, time }
    });
  };

  delayFeedback = feedback => {
    const newDelay = new Pizzicato.Effects.Delay({
      ...this.state.delayValues,
      feedback
    });
    this.setState({
      effects: { ...this.state.effects, delay: newDelay },
      delayValues: { ...this.state.delayValues, feedback }
    });
  };

  delayMix = mix => {
    const newDelay = new Pizzicato.Effects.Delay({
      ...this.state.delayValues,
      mix
    });
    this.setState({
      effects: { ...this.state.effects, delay: newDelay },
      delayValues: { ...this.state.delayValues, mix }
    });
  };

  handleWaveChange = event => {
    this.wave = new Pizzicato.Sound({
      source: "wave",
      options: { type: event.target.value, release: 0.6 }
    });
    this.addEffects();
  };

  addEffects = () => {
    // Empty effects array and remove references
    this.wave.effects.length = 0;

    for (let key in this.state.effects) {
      const effect = this.state.effects[key];
      if (effect) {
        this.wave.addEffect(effect);
      }
    }
  };

  render() {
    this.addEffects();
    console.log(this.wave.effects);
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
              onChange={this.handleWaveChange}
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
          <p>(Not working)</p>
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
          <div className='delay-time'>
            Time: {this.state.delayValues.time} sec
            <Slider
              max={1}
              min={0}
              step={0.01}
              defaultValue={this.state.delayValues.time}
              onChange={a => this.delayTime(a)}
            />
          </div>
          <div className='delay-feedback'>
            Feedback: {this.state.delayValues.feedback * 100}%
            <Slider
              max={1}
              min={0}
              step={0.01}
              defaultValue={this.state.delayValues.feedback}
              onChange={a => this.delayFeedback(a)}
            />
          </div>
          <div className='delay-mix'>
            Mix: {this.state.delayValues.mix * 100}%
            <Slider
              max={1}
              min={0}
              step={0.01}
              defaultValue={this.state.delayValues.mix}
              onChange={a => this.delayMix(a)}
            />
          </div>
        </div>

        <div className="distortion">
          <h2>Distortion</h2>
          Gain: {this.state.distortionGain * 100}%
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
