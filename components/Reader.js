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
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
const { width, height: height_ } = Dimensions.get('screen');

const MangaReader = () => {
  const viewRef = useAnimatedRef();
  const [images, setImages] = useState([]);
  const maxHeight = useSharedValue(0);
  const transitionY = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);

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
    .onBegin(() => {
      // to prevent glitchy behavior
      cancelAnimation(transitionY);
      // tracks previous location
      offsetY.value = transitionY.value;
    })
    .onUpdate(({ translationY }) => {
      // checks for content boundaries
      if (translationY < 0) {
        transitionY.value =
          translationY + offsetY.value < -maxHeight.value
            ? -maxHeight.value
            : translationY + offsetY.value;
      } else {
        transitionY.value =
          translationY + offsetY.value > 0 ? 0 : translationY + offsetY.value;
      }
    })
    .onEnd(({ velocityY }) => {
      // 'scroll' animation.
      transitionY.value = withDecay({
        velocity: velocityY,
        deceleration: 0.9997,
        clamp: [-maxHeight.value, 0],
      });
    });

  const pinch = Gesture.Pinch().onUpdate(({ scale: scale_ }) => {
    scale.value = scale_;
  });
  // !!! not sure if 'Simultaneous' needed
  const gesture = Gesture.Race(pinch, pan, Gesture.Simultaneous(pinch, pan));

  const style = useAnimatedStyle(() => ({
    width: scale.value * width,
    transform: [{ translateY: transitionY.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={{
          alignItems: 'center',
        }}
      >
        <Animated.View
          ref={viewRef}
          // idk which of those faster and better (ui or js)
          onLayout={(event) => {
            // recalculates maxHeight, for boundaries
            // - height_ (screen height) is for not letting scroll overlow
            maxHeight.value = event.nativeEvent.layout.height - height_;

            // runOnUI(() => {
            //   'worklet';
            //   let height = measure(viewRef).height;
            //   if (!height) return;
            //   maxHeight.value = height - height_;
            // })();
          }}
          style={([{ position: 'absolute' }], style)}
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
