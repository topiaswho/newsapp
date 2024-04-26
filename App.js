import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SavedArticles from './components/SavedArticles';
import Newsapp from './components/index';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Etusivu" component={Newsapp} />
        <Stack.Screen name="Tallennetut artikkelit" component={SavedArticles} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


