import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default class AccelerometerSensor extends React.Component {
  state = {
    accelerometerData: {},
  };

  componentDidMount() {
    this._subscribe();
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  _interval = () => {
    Accelerometer.setUpdateInterval(500);
  }

  _subscribe = () => {
    this._subscription = Accelerometer.addListener(accelerometerData => {
      this.setState({ accelerometerData });
    });
  };

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  render() {
    let { x, y, z } = this.state.accelerometerData;
    return (
      <View style={styles.sensor}>
        <Text>x: {x} y: {y} z: {z}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  sensor: {
    height: 30
  }
})