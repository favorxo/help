import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MangaReader from './components/Reader';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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
