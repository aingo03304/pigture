import React from 'react';
import { StyleSheet, Text, View, Platform, StatusBar } from 'react-native';

import { Container, Header } from 'native-base';

import CameraPage from './Components/CameraPage'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      android: {
        marginTop: StatusBar.currentHeight
      }
    })
  },
  slideDefault: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff0000'
  },
  text: {
    color: 'black',
    fontSize: 30,
    fontWeight: 'bold'
  }
});


export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container style={ styles.container }>
        <CameraPage />
      </Container>
    );
  };
};
