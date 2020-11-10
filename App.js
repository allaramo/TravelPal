import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import HomeScreen from './screens/Home';
import MapScreen from './screens/Map';

export default function App() {
  const tabNav = createBottomTabNavigator()
  return(
    <>
      <NavigationContainer>
    	  <tabNav.Navigator initialRouteName="Home">
          <tabNav.Screen name="Home" component={HomeScreen} options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({color, size}) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            )
          }}/>
          <tabNav.Screen name="Map" component={MapScreen} options={{
            tabBarLabel: 'Map',
            tabBarIcon: ({color, size}) => ( 
              <MaterialCommunityIcons name="map-marker" color={color} size={size} />
            )
          }}/>         
        </tabNav.Navigator>
      </NavigationContainer>
    </>
  );
}