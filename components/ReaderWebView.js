import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Dimensions, PixelRatio } from 'react-native';
import WebView from 'react-native-webview';
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
import * as NavigationBar from 'expo-navigation-bar';
import * as StatusBar from 'expo-status-bar';

const screenWidthInPx = screenWidth * PixelRatio.get();
const MangaReader = () => {
  const [images, setImages] = useState([]);
  useEffect(() => {
    // 'fullscreen' mode
    NavigationBar.setVisibilityAsync('hidden');
    StatusBar.setStatusBarHidden(true);
    axios
      .get('https://api.remanga.org/api/titles/chapters/41125/')
      .then((res) => {
        setImages(res.data.content.pages);
      })
      .catch((e) => console.log(e.respon));
    return () => {
      StatusBar.setStatusBarHidden(false);
    };
  }, []);

  return (
    <WebView
      decelerationRate={0.991}
      androidLayerType="hardware"
      style={{ flex: 1, backgroundColor: 'black' }}
      source={{
        html: `<body style="width: ${screenWidthInPx}px">
                ${images
                  .map(
                    (item) => `<img style="width:100%" src=${item.link}></img>`
                  )
                  .join('')}
                </body>`,
      }}
    />
  );
};
export default MangaReader;
