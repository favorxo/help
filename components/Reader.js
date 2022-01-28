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
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const MangaReader = () => {
  const viewRef = useAnimatedRef();
  const [images, setImages] = useState([]);

  const viewWidth = useSharedValue(0);
  const viewHeight = useSharedValue(0);
  const maxWidth = useDerivedValue(
    () => viewWidth.value - screenWidth,
    [viewWidth.value]
  );
  const maxHeight = useDerivedValue(
    () => viewHeight.value - screenHeight,
    [viewHeight.value]
  );

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

  useEffect(() => {
    // 'fullscreen' mode
    NavigationBar.setVisibilityAsync('hidden');
    StatusBar.setStatusBarHidden(true);

    fetch('https://api.remanga.org/api/titles/chapters/81271/')
      .then((res) => res.json())
      .then((res) => setImages(res.content.pages));

    return () => {};
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
      if (e.numberOfPointers >= 2) {
        console.log('absolutes:', e.absoluteX, e.absoluteY);
      }
      transitionX.value = e.translationX / scale.value + offsetX.value;
      transitionY.value = e.translationY / scale.value + offsetY.value;
    })
    .onEnd((e) => {
      transitionX.value = withDecay({
        velocity: e.velocityX / scale.value,
        deceleration: 0.999,
        // clamp: [-maxWidth.value, 0],
      }); // 'scroll' animation.
      transitionY.value = withDecay({
        velocity: e.velocityY / scale.value,
        deceleration: 0.9996,
        // clamp: [-maxHeight.value, 0],
      }); // 'scroll' animation.
    });

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      // focalOffsetX.value = focalX.value;
      // focalOffsetY.value = focalY.value;
      scaleOffset.value = scale.value;
      focalX.value = withTiming(e.focalX, { duration: 128 });
      focalY.value = withTiming(e.focalY, { duration: 128 });
    })
    .onUpdate((e) => {
      scale.value = e.scale * scaleOffset.value;
      focalX.value = e.focalX;
      focalY.value = e.focalY;
    });

  const gesture = Gesture.Simultaneous(pinch, pan);
  console.log(screenWidth);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: -focalX.value },
      { translateY: -focalY.value },
      { translateX: -viewWidth.value / 2 },
      { translateY: -viewHeight.value / 2 },
      { scale: scale.value },
      { translateX: viewWidth.value / 2 },
      { translateY: viewHeight.value / 2 },
      { translateX: focalX.value },
      { translateY: focalY.value },
      { translateX: transitionX.value },
      { translateY: transitionY.value },
    ],
  }));
  return (
    <View style={{ backgroundColor: 'red' }}>
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
              <Image
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
