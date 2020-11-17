import React from 'react'
//importing libraries for the navigation
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
//importing icons library
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

//importing screens
import HomeScreen from './screens/Home';
import ListScreen from './screens/List';

export default function App() {
  //creating tab navigator with 2 screens
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
          <tabNav.Screen name="List" component={ListScreen} options={{
            tabBarLabel: 'Saved Data',
            tabBarIcon: ({color, size}) => ( 
              <MaterialCommunityIcons name="map" color={color} size={size} />
            )
          }}/>         
        </tabNav.Navigator>
      </NavigationContainer>
    </>
  );
}