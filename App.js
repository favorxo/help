import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { NavigationContainer } from '@react-navigation/native';
import { Dimensions, View } from 'react-native';
import PanPinchView, { ZoomableView } from './components/ReaderWebView';
import MangaReader from './components/ReaderWebView';

const Stack = createStackNavigator();
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const App = () => {
  // const [images, setImages] = useState([]);
  // useEffect(() => {
  //   // 'fullscreen' mode
  //   NavigationBar.setVisibilityAsync('hidden');
  //   StatusBar.setStatusBarHidden(true);

  //   axios
  //     .get('https://api.remanga.org/api/titles/chapters/81125/')
  //     .then((res) => {
  //       setImages(res.data.content.pages);
  //     })
  //     .catch((e) => console.log(e.respon));

  //   return () => {
  //     StatusBar.setStatusBarHidden(false);
  //   };
  // }, []);
  // if (!images) return <View></View>;
  // let wid = images.reduce((i, a) => i.width + a, 0);
  // let hei = images.reduce((i, a) => i.height + a, 0);
  // console.log(wid, hei);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="">
        <Stack.Screen
          component={MangaReader}
          name="MangaReader"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
