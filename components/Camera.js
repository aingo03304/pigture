import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { Header, Icon } from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PhoneRotation from './PhoneRotation';

export default class CameraComponent extends React.Component {
  state = {
    hasCameraPermission: null,
    hasCameraRollPermission: null,
    ratio: "16:9",
    type: Camera.Constants.Type.back,
    flash: "off",
    focus: "on",
    image_uri: null,
  };

  async componentDidMount() {
    let { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted'});

    status = await Permissions.askAsync(Permissions.CAMERA_ROLL).status;
    this.setState({ hasCameraRollPermission: status === 'granted'});
  }

  async _snapPhoto() {
    if (this.camera) {
      const options = { quality: 1, base64: true, fixOrientation: true, exif: true };
      await this.camera.takePictureAsync(options)
      .then(photo => {
        photo.exif.Orientation = 1;
        MediaLibrary.createAssetAsync(photo.uri);
      })
      .catch(error => {
        console.error(error);
      });
    }
  }

  async _getRatio() {
    const ratios = await this.camera.getSupportedRatiosAsync()
    .then((ratios) => {
      this.setState({ ratio: ratios[0] })
    });
  }

  async _pickImage(updateImageUri) {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });

    if (!result.cancelled) {
      updateImageUri(result.uri, result.height, result.width);
    }
  }

  _toggleFlash () {
    const order = {
      'on': 'off',
      'off': 'torch',
      'torch': 'on'
    }
    this.setState({
      flash: order[this.state.flash]
    })
  }

  _toggleFlashIcon () {
    if (this.state.flash === 'on') {
      return 'ios-flash'
    } else if (this.state.flash === 'off') {
      return 'ios-flash-off'
    } else {
      return 'ios-flashlight'
    }
  }

  _toggleFocus () {
    const order = {
      'on': 'off',
      'off': 'on'
    }
    this.setState({
      focus: order[this.state.focus]
    });
  }

  _toggleFocusText () {
    if (this.state.focus === 'on') {
      return "AF";
    } else {
      return "MF";
    }
  }
  
  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return(
        <View style={{ 
          flex: 1
        }}>
          <Camera style={{ flex: 1, justifyContent: 'space-between' }} type={this.state.type}
            ref= { (ref) => {this.camera = ref } }
            ratio="16:9"
            flashMode={this.state.flash}
            autoFocus={this.state.focus}
          >
            <Header
              transparent
            >
              <View style={styles.headerItem}>
                <TouchableOpacity onPress={ this._toggleFlash.bind(this) }>
                  <Icon 
                    name={ this._toggleFlashIcon.bind(this)() }
                    style={{ color: 'white', fontWeight: 'bold' }}
                  />
                </TouchableOpacity>
                
                <View style={styles.phoneRotation}>
                  <PhoneRotation style={{ zIndex: 0 }}/>
                </View>
                <View>
                  <TouchableOpacity onPress= { this._toggleFocus.bind(this) }>
                    <Text style={{ color: 'white', fontSize: 24, }}>{ this._toggleFocusText.bind(this)() }</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Header>

            <View style={styles.footerItem}>
              <Icon onPress={() => {this._pickImage(this.props.updateImageUri)}}
                name="ios-images" style={{ color: 'white', fontSize: 36 }} 
              />
              <TouchableOpacity style={{ alignItems: 'center' }} onPress={ this._snapPhoto.bind(this) }>
                <MaterialCommunityIcons name="circle-outline" style={{ color: 'white', fontSize: 100 }}/>
              </TouchableOpacity>
              <Icon onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back ?
                      Camera.Constants.Type.front : Camera.Constants.Type.back
                  })
                }}
                name="ios-reverse-camera" style={{ color: 'white', fontSize: 36 }} />
            </View>
          </Camera>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  headerItem: {
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'space-around'
  },
  footerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 15,
    alignItems: 'flex-end'
  },
  phoneRotation: {
    height: 32, 
    width: 32, 
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 100/2,
    overflow: 'hidden'
  }
})
