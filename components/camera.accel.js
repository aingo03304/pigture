import React from 'react';
import { Text, View, StyleSheet, Animated } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default class PhoneRotation extends React.Component {
  state = {
    accelerometerData: {},
    topPosition: new Animated.Value(0),
    height: new Animated.Value(0)
  };

  componentDidMount() {
    this._subscribe();
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  _interval = () => {
    Accelerometer.setUpdateInterval(200);
  }

  _subscribe = () => {
    this._interval();
    this._subscription = Accelerometer.addListener(accelerometerData => {
      this.setState({ accelerometerData });
      this._tiltPhone();
    });
  };

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  _tiltPhone = () => {
    let { x, y } = this.state.accelerometerData;
    let angle = Math.sqrt(x * x + y * y) || 0;
    Animated.timing (
      this.state.height, {
        toValue: angle * 32,
        duration: 200,
        delay: 0,
      }
    ).start();

    Animated.timing (
      this.state.topPosition, {
        toValue: 16 - (angle * 16) - 1,
        duration: 200,
        delay: 0,
      }
    ).start();
  }

  _getStyle = () => {
    let { x, y } = this.state.accelerometerData;
    let angle = Math.sqrt(x * x + y * y) || 0;
    let color = 'white';

    if (angle >= 0.99 || angle <= 0.05) {
      color = 'red';
    }

    return {
      height: this.state.height,
      backgroundColor: color,
      top: this.state.topPosition
    }
  }

  render() {
    return (
      <Animated.View style={[styles.rectangle, this._getStyle()]} />
    )
  }
}

const styles = StyleSheet.create({
  rectangle: {
    width: 32,
    backgroundColor: 'white',
    position: 'absolute'
  }
})
