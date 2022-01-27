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
    .onUpdate(
      ({
        translationY,
        translationX,
        numberOfPointers,
        absoluteX,
        absoluteY,
      }) => {
        // checks for content boundaries
        // console.log(
        //   translationX / scale.value + offsetX.value,
        //   maxWidth.value,
        //   translationY / scale.value + offsetY.value,
        //   maxHeight.value
        // );
        if (translationY < 0) {
          transitionY.value =
            translationY / scale.value + offsetY.value < -maxHeight.value
              ? -maxHeight.value
              : translationY / scale.value + offsetY.value;
        } else {
          transitionY.value =
            translationY / scale.value + offsetY.value > 0
              ? 0
              : translationY / scale.value + offsetY.value;
        }

        if (translationX < 0) {
          transitionX.value =
            translationX / scale.value + offsetX.value < -maxWidth.value
              ? -maxWidth.value
              : translationX / scale.value + offsetX.value;
        } else {
          transitionX.value =
            translationX / scale.value + offsetX.value > 0
              ? 0
              : translationX / scale.value + offsetX.value;
        }
      }
    )
    .onEnd(({ velocityX, velocityY, numberOfPointers }) => {
      transitionX.value = withDecay({
        velocity: velocityX / scale.value,
        deceleration: 0.999,
        clamp: [-maxWidth.value, 0],
      }); // 'scroll' animation.
      transitionY.value = withDecay({
        velocity: velocityY / scale.value,
        deceleration: 0.9996,
        clamp: [-maxHeight.value, 0],
      }); // 'scroll' animation.
    });

  const pinch = Gesture.Pinch()
    .onStart(({ scale: scale_, focalX: focalx, focalY: focaly, velocity }) => {
      focalX.value = withTiming(focalx, { duration: 128 });
      focalY.value = withTiming(focaly, { duration: 128 });
    })
    .onUpdate(({ scale: scale_, focalX: focalx, focalY: focaly }) => {
      scale.value = scale_ * scaleOffset.value;
    })
    .onEnd(({ scale: scale_, focalX: focalx, focalY: focaly }) => {
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
