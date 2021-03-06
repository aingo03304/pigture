import React from 'react';
import { Animated, StyleSheet, StatusBar, Platform, View, Dimensions, Slider } from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoPixi from 'expo-pixi';
import { Icon } from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PhoneAngle from './camera.accel';

import {
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  State,
  TouchableOpacity,
} from 'react-native-gesture-handler';

export class CameraPage extends React.Component {
  panRef = React.createRef();
  rotationRef = React.createRef();
  pinchRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      hasCameraPermission: null,
      hasCameraRollPermission: null,
      ratios: [],
      type: Camera.Constants.Type.back,
      flash: "off",
      focus: "on",
      zoom: 0,
      showSketch: false,

      ratio: "16:9",
      currentRatio: [16, 9],

      image_uri: '',
      image_height: 0,
      image_width: 0,
    }

    /* Pinching */
    this._baseScale = new Animated.Value(1);
    this._pinchScale = new Animated.Value(1);
    this._scale = Animated.multiply(this._baseScale, this._pinchScale);
    this._lastScale = 1;
    this._onPinchGestureEvent = Animated.event(
      [{ nativeEvent: { scale: this._pinchScale } }],
      { useNativeDriver: true }
    );

    /* Rotation */
    this._rotate = new Animated.Value(0);
    this._rotateStr = this._rotate.interpolate({
      inputRange: [-100, 100],
      outputRange: ['-100rad', '100rad'],
    });
    this._lastRotate = 0;
    this._onRotateGestureEvent = Animated.event(
      [{ nativeEvent: { rotation: this._rotate } }],
      { useNativeDriver: true }
    );

    /* Translation */
    this._translateX = new Animated.Value(0);
    this._translateY = new Animated.Value(0);
    this._lastOffset = { x: 0, y: 0 };
    this._onPanGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: this._translateX, translationY: this._translateY }}],
      { useNativeDriver: true }
    );
  }

  _initScaleRotateTranslation() {
    
    /* Pinching */
    this._baseScale = new Animated.Value(1);
    this._pinchScale = new Animated.Value(1);
    this._scale = Animated.multiply(this._baseScale, this._pinchScale);
    this._lastScale = 1;

    /* Rotation */
    this._rotate = new Animated.Value(0);
    this._rotateStr = this._rotate.interpolate({
      inputRange: [-100, 100],
      outputRange: ['-100rad', '100rad'],
    });
    this._lastRotate = 0;

    /* Translation */
    this._translateX = new Animated.Value(0);
    this._translateY = new Animated.Value(0);
    this._lastOffset = { x: 0, y: 0 };
  }

  _onRotateHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastRotate += event.nativeEvent.rotation;
      this._rotate.setOffset(this._lastRotate);
      this._rotate.setValue(0);
    }
  };
  _onPinchHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastScale *= event.nativeEvent.scale;
      this._baseScale.setValue(this._lastScale);
      this._pinchScale.setValue(1);
    }
  };

  _onPanGestureStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastOffset.x += event.nativeEvent.translationX;
      this._lastOffset.y += event.nativeEvent.translationY;
      this._translateX.setOffset(this._lastOffset.x);
      this._translateX.setValue(0);
      this._translateY.setOffset(this._lastOffset.y);
      this._translateY.setValue(0);
    }
  };

  _toggleSketch() {
    this.setState({
      showSketch: this.state.showSketch === true ? false : true
    });
  }

  _toggleSketchIcon() {
    if (this.state.showSketch) {
      return 'ios-brush'
    } else {
      return 'ios-image'
    }
  }

  _toggleCamera() {
    this.setState({
      type: this.state.type === Camera.Constants.Type.back ?
        Camera.Constants.Type.front : Camera.Constants.Type.back
    });
  }

  _toggleFlash() {
    const order = {
      "on": "torch",
      "off": "on",
      "torch": "off"
    };

    this.setState({
      flash: order[this.state.flash]
    });
  };

  _toggleFlashIcon() {
    if (this.state.flash === "on") {
      return "ios-flash";
    } else if (this.state.flash === "off") {
      return "ios-flash-off";
    } else {
      return "ios-flashlight";
    }
  }

  _toggleFocus() {
    const order = {
      'on': 'off',
      'off': 'on'
    }
    this.setState({
      focus: order[this.state.focus]
    });
  }

  _toggleFocusIcon() {
    if (this.state.focus === 'on') {
      return "AF";
    } else {
      return "MF";
    }
  }

  _setZoom(val) {
    this.setState({
      zoom: val
    });
  }

  initCamera(ref) {
    this.camera = ref;
  }

  async _snapPhoto() {
    if (this.camera) {
      const options = { quality : 1, base64: true, fixOrientation: true, exif: true };
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

  async _snapPhotoTemp() {
    if (this.camera) {
      const options = { quality : 1, base64: true, fixOrientation: true, exif: true };
      await this.camera.takePictureAsync(options)
      .then(photo => {
        photo.exif.Orientation = 1;
        this.setState({ image_uri: photo.uri });
      })
      .catch(error => {
        console.error(error);
      })
    }
  }

  async _pickImage() {
    this._initScaleRotateTranslation()
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });

    if (!result.cancelled) {
      console.log(result.height);
      console.log(result.width);
      this.setState({
        image_uri: result.uri,
        image_height: result.height,
        image_width: result.width
      });
    }
  }

  async _getRatio() {
    const ratios = await this.camera.getSupportedRatiosAsync()
    .then((ratios) => {
      this.setState({ ratios: ratios });
    })
  }

  async componentDidMount() {
    let { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
    
    status = await Permissions.askAsync(Permissions.CAMERA_ROLL).status;
    this.setState({ hasCameraRollPermission: status === 'granted' });
  }

  renderHeader() {
    return (
      <View style={styles.headerItem}>
        <TouchableOpacity>
          <Icon
            onPress={ this._toggleFlash.bind(this) }
            style={{ color: 'white', fontWeight: 'bold' }}
            name={ this._toggleFlashIcon.bind(this)() }
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.phoneAngle}
          onPress={this._snapPhotoTemp.bind(this)}
        >
          <PhoneAngle/>
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon
            onPress={this._toggleSketch.bind(this)}
            style={{ color: 'white', fontWeight: 'bold' }}
            name={ this._toggleSketchIcon.bind(this)() }
          />
        </TouchableOpacity>
      </View>
    );
  }

  renderFooter() {
    return (
      <View>
        <View
          style={styles.slider}
        >
          <Slider
            minimumValue={0}
            maximumValue={1}
            thumbTintColor="white"
            minimumTrackImage="white"
            maximumTrackTintColor="white"
            onValueChange={this._setZoom.bind(this)}
          />
        </View>

        <View style={styles.footerItem}>
          <Icon 
            onPress={this._pickImage.bind(this)}
            name="ios-images"
            style={{color: 'white', fontSize: 36}}
          />
          <TouchableOpacity
            onPress={this._snapPhoto.bind(this)}
            style={{alignItems: 'center'}}
          >
            <MaterialCommunityIcons 
              name="circle-outline"
              style={{color: 'white', fontSize: 100}}
            />
          </TouchableOpacity>
          <Icon 
            onPress={this._toggleCamera.bind(this)}
            name="ios-reverse-camera" 
            style={{color: 'white', fontSize: 36}} 
          />
        </View>
      </View>
    );
  }

  renderCamera() {
    const height = Platform.select({
      ios: Dimensions.get('window').height,
      android: Dimensions.get('window').height - StatusBar.currentHeight
    });
    const width = Dimensions.get('window').width;
    const cameraHeight = width * this.state.currentRatio[0] / this.state.currentRatio[1]
    const cameraWidth =  width

    return (
      <Camera
        style={[
          styles.onScreenCenter,
          {
            height: cameraHeight,
            width: cameraWidth,
          }
        ]}
        type={this.state.type}
        ref= { (ref) => {this.initCamera(ref)} }
        ratio={this.state.ratio}
        zoom={this.state.zoom}
        flashMode={this.state.flash}
        autoFocus={this.state.focus}
      />
    )
  }

  renderSketch() {
    return (
      <ExpoPixi.Sketch 
        style={styles.pinchableImage}
        strokeColor="0xffffff"
        strokeWidth={10}
        strokeAlpha={1}
      />
    );
  };

  renderBackgroundImage() {
    const height = Platform.select({
      ios: Dimensions.get('window').height,
      android: Dimensions.get('window').height - StatusBar.currentHeight
    });
    const width = Dimensions.get('window').width;
    const cameraHeight = width * this.state.currentRatio[0] / this.state.currentRatio[1]
    const cameraWidth =  width
    
    return (
      <Animated.Image
        style={[
          styles.pinchableImage,
          {
            transform: [
              { perspective: 200 },
              { scale: this._scale },
              { rotate: this._rotateStr },
              { translateX: this._translateX },
              { translateY: this._translateY }
            ],
            height: cameraHeight,
            width: cameraWidth
          }
        ]}
        source={{uri: this.state.image_uri}}
      />
    );
  };

  render() {
    return (
      <PanGestureHandler
        ref={this.panRef}
        onGestureEvent={this._onPanGestureEvent}
        onHandlerStateChange={this._onPanGestureStateChange}
        minDist={10}
        minPointers={2}
        maxPointers={2}
        avgTouches>
        <Animated.View style={styles.wrapper}>
          <RotationGestureHandler
            ref={this.rotationRef}
            simultaneousHandlers={this.pinchRef}
            onGestureEvent={this._onRotateGestureEvent}
            onHandlerStateChange={this._onRotateHandlerStateChange}>
            <Animated.View style={styles.wrapper}>
              <PinchGestureHandler
                ref={this.pinchRef}
                simultaneousHandlers={this.rotationRef}
                onGestureEvent={this._onPinchGestureEvent}
                onHandlerStateChange={this._onPinchHandlerStateChange}>
                <Animated.View 
                  style={styles.container}
                  collapsable={false}
                >
                  {this.renderCamera()}
                  {this.state.image_uri !== '' && this.renderBackgroundImage()}
                  {this.state.showSketch && this.renderSketch()}
                  {this.renderHeader()}
                  {this.renderFooter()}
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </RotationGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

export default CameraPage;

const styles = StyleSheet.create({
  sliderView: {
    height: 32,
    opacity: 0.3
  },
  onScreenCenter: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0
  },
  container: {
    backgroundColor: 'black',
    flex: 1,
    justifyContent: 'space-between'
  },
  pinchableImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    opacity: 0.3,
  },
  wrapper: {
    flex: 1,
  },
  headerItem: {
    height: 32,
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-around'
  },
  footerItem: {
    backgroundColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 15,
    alignItems: 'flex-end'
  },
  phoneAngle: {
    height: 32,
    width: 32,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 100/2,
    overflow: 'hidden'
  }
});
