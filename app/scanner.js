import { Link } from "expo-router";
import { Camera, CameraType } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Scanner = () => {
  const [type, setType] = useState(CameraType.back);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const cameraRef = useRef();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  const onCameraReady = () => setIsCameraReady(true);

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      const data = await cameraRef.current.takePictureAsync(options);
      const source = data.uri;
      const { base64: encodedPicture } = data;
      const apiKey = 'haha';

      const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
      console.log(encodedPicture)
      const requestBody = {
        requests: [
          {
            image: {
              content: encodedPicture.split("data:image/png;base64,").join("")
            },
            features: [
              {
                type: 'TEXT_DETECTION'
              }
            ]
          }
        ]
      };

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
        .then(response => response.json())
        .then(data => {
          // Extract the text content from the response
          const textContent = data.responses[0].textAnnotations[0].description;

          // Use the text content as needed
          console.log(`Text content: ${textContent}`);
        })
        .catch(error => console.error(error));

      if (source) {
        await cameraRef.current.pausePreview();
        // setIsPreview(true);
        // console.log("picture source", source);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        type={type}
        onCameraReady={onCameraReady}
        style={styles.camera}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={toggleCameraType}
          >
            <Text style={styles.text}>Flip Camera</Text>
            <Link href="/" style={styles.text}>Get back</Link>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!isCameraReady}
            onPress={takePicture}
            style={styles.capture}
          >
            <Text style={styles.text}>Scan!</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Scanner;