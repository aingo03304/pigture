import React from 'react';
import { Text, View, Button } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';

export default class CameraScreen extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted'});
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <Text>Something got wrong!</Text>;;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return(
        <View style={{ flex: 1 }}>
          <Camera style={{ flex: 1 }} type={this.state.type}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                alignItems: 'flex-end',
                flexDirection: 'row',
              }}>
              <Button
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back 
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back
                  })
                }}
                title="Flip"
                color="#000000"
                accessibilityLabel="Press to filp camera"/>
              <AccelerometerSensor />
            </View>
          </Camera>
        </View>
      );
    }
  }
}
