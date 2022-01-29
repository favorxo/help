import React, { useEffect, useState } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import * as StatusBar from 'expo-status-bar';
import { Dimensions, Image, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  measure,
  runOnUI,
  useDerivedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const MangaReader = () => {
  const viewRef = useAnimatedRef();
  const [images, setImages] = useState([]);

  const viewWidth = useSharedValue(0);
  const viewHeight = useSharedValue(0);

  const transitionX = useSharedValue(0);
  const transitionY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const focalOffsetX = useSharedValue(0);
  const focalOffsetY = useSharedValue(0);
  const offsetOriginX = useSharedValue(0);
  const offsetOriginY = useSharedValue(0);
  const scale = useSharedValue(1);
  const scaleOffset = useSharedValue(1);
  const maxWidth = useDerivedValue(
    () => viewWidth.value - screenWidth,
    [viewWidth.value, scale.value]
  );
  const maxHeight = useDerivedValue(
    () => viewHeight.value - screenHeight,
    [viewHeight.value, scale.value]
  );
  useEffect(() => {
    // 'fullscreen' mode
    NavigationBar.setVisibilityAsync('hidden');
    StatusBar.setStatusBarHidden(true);

    axios
      .get('https://api.remanga.org/api/titles/chapters/81125/')
      .then((res) => {
        setImages(res.data.content.pages);
      })
      .catch((e) => console.log(e.respon));

    return () => {
      StatusBar.setStatusBarHidden(false);
    };
  }, []);

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      cancelAnimation(transitionX);
      cancelAnimation(transitionY); // to prevent glitchy behavior
      offsetX.value = transitionX.value;
      offsetY.value = transitionY.value; // tracks previous location
    })
    .onUpdate((e) => {
      transitionX.value = e.translationX + offsetX.value;
      transitionY.value = e.translationY + offsetY.value;
    })
    .onEnd((e) => {
      transitionX.value = withDecay({
        velocity: e.velocityX / scale.value,
        deceleration: 0.999,
        // clamp: [-maxWidth.value, 0],
      }); // 'scroll' animation.
      transitionY.value = withDecay({
        velocity: e.velocityY / scale.value,
        deceleration: 0.9992,
        // clamp: [-maxHeight.value, 0],
      }); // 'scroll' animation.
    });

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      // TODO: Fix pinch starting from scale.value != 1
      scaleOffset.value = scale.value;
      focalOffsetX.value = focalX.value;
      focalOffsetY.value = focalY.value;
      focalX.value = e.focalX;
      focalY.value = e.focalY;
    })
    .onUpdate((e) => {
      scale.value = e.scale * scaleOffset.value;
    });

  const gesture = Gesture.Simultaneous(pinch, pan);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: -viewWidth.value / 2 + focalX.value },
      { translateY: -viewHeight.value / 2 + focalY.value },
      { translateX: transitionX.value },
      { translateY: transitionY.value },
      { scale: scale.value },
      { translateX: viewWidth.value / 2 - focalX.value },
      { translateY: viewHeight.value / 2 - focalY.value },
    ],
  }));
  return (
    <View style={{ backgroundColor: 'black' }}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          ref={viewRef}
          onLayout={(event) => {
            // recalculates maxHeight, for boundaries
            viewWidth.value = event.nativeEvent.layout.width;
            viewHeight.value = event.nativeEvent.layout.height;
          }}
          style={style}
        >
          {images.map((item) => {
            return (
              <FastImage
                resizeMode="contain"
                key={item.id}
                source={{ uri: item.link }}
                style={{
                  aspectRatio: item.width / item.height,
                }}
              />
            );
          })}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
export default MangaReader;
