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
  const scale = useSharedValue(1);
  const prev1 = useSharedValue(1);
  const prev2 = useSharedValue(1);
  const scaleOffset = useSharedValue(1);

  useEffect(() => {
    // 'fullscreen' mode
    NavigationBar.setVisibilityAsync('hidden');
    StatusBar.setStatusBarHidden(true);

    fetch('https://api.remanga.org/api/titles/chapters/656/')
      .then((res) => res.json())
      .then((res) => setImages(res.content.pages));

    return () => {
      NavigationBar.setVisibilityAsync('visible');
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
      // checks for content boundaries
      // console.log(
      //   translationX / scale.value + offsetX.value,
      //   maxWidth.value,
      //   translationY / scale.value + offsetY.value,
      //   maxHeight.value
      // );
      if (e.translationY < 0) {
        transitionY.value =
          e.translationY / scale.value + offsetY.value < -maxHeight.value
            ? -maxHeight.value
            : e.translationY / scale.value + offsetY.value;
      } else {
        transitionY.value =
          e.translationY / scale.value + offsetY.value > 0
            ? 0
            : e.translationY / scale.value + offsetY.value;
      }

      if (e.translationX < 0) {
        transitionX.value =
          e.translationX / scale.value + offsetX.value < -maxWidth.value
            ? -maxWidth.value
            : e.translationX / scale.value + offsetX.value;
      } else {
        transitionX.value =
          e.translationX / scale.value + offsetX.value > 0
            ? 0
            : e.translationX / scale.value + offsetX.value;
      }
    })
    .onEnd((e) => {
      transitionX.value = withDecay({
        velocity: e.velocityX / scale.value,
        deceleration: 0.999,
        clamp: [-maxWidth.value, 0],
      }); // 'scroll' animation.
      transitionY.value = withDecay({
        velocity: e.velocityY / scale.value,
        deceleration: 0.9996,
        clamp: [-maxHeight.value, 0],
      }); // 'scroll' animation.
    });

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      focalX.value = withTiming(e.focalX, { duration: 128 });
      focalY.value = withTiming(e.focalY, { duration: 128 });
    })
    .onUpdate((e) => {
      scale.value = e.scale * scaleOffset.value;
    })
    .onEnd((e) => {
      scaleOffset.value = scale.value;
    });

  const gesture = Gesture.Race(pan, pinch, Gesture.Simultaneous(pinch, pan));

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: focalX.value },
      { translateY: focalY.value },
      { translateX: -viewWidth.value / 2 },
      { translateY: -viewHeight.value / 2 },
      { scale: scale.value },
      { translateX: -focalX.value },
      { translateY: -focalY.value },
      { translateX: viewWidth.value / 2 },
      { translateY: viewHeight.value / 2 },
      { translateX: transitionX.value },
      { translateY: transitionY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={{ alignItems: 'center' }}>
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
                  width: '100%',
                }}
              />
            );
          })}
        </Animated.View>
      </View>
    </GestureDetector>
  );
};
export default MangaReader;
