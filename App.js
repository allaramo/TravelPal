import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
    country: "",
    city: ""
  });

  const [weather, setWeather] = useState({
    description: "",
    temperature: 0,
    precipitation: 0,
    humidity: 0,
    wind: 0,
    icon: ""
  });


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access gps was denied');
      }

      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });
      let openCageUrl = "https://api.opencagedata.com/geocode/v1/json?key=44a9f29b61514c1bb30d4781d418d6f3&q=" +
      location.coords.latitude +
      "+" +
      location.coords.longitude;
      fetch(openCageUrl)
        .then((response) => {
          return response.json();
        })
        .then((json) => {          
          let city = "";
          if ("city_district" in json.results[0].components) {            
            city = json.results[0].components.city_district;
            city = city.split(" ")[0];
          } else if ("town" in json.results[0].components) {
            city = json.results[0].components.town;
          } else if ("district" in json.results[0].components) {
            city = json.results[0].components.district;
          }
          setLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            country: json.results[0].components.country,
            city: city
          });
          getWeather(location.coords.latitude,location.coords.longitude);  
        });     
    })();
  }, []);  

  function getWeather(latitude,longitude) {
    let weatherStackUrl = "http://api.weatherstack.com/current?access_key=59f7e5aea92d9b246584e72d35e0f13c&query=" +
    latitude + "," + longitude + "&units=m";
    console.log(weatherStackUrl);
    fetch(weatherStackUrl)
    .then((response)=>{
      return response.json();
    })
    .then((json) => {      
      setWeather({
        description: json.current.weather_descriptions[0],
        temperature: json.current.temperature,
        precipitation: json.current.precip,
        humidity: json.current.humidity,
        wind: json.current.wind_speed,
        icon: json.current.weather_icons[0]
      });
    });
  }
 



  return (
    <View style={styles.container}>
      <Text>{location.latitude}</Text>
      <Text>{location.longitude}</Text>
      <Text>{location.country}</Text>
      <Text>{location.city}</Text>
      <Text>{weather.description}</Text>
      <Text>{weather.temperature}</Text>
      <Text>{weather.precipitation}</Text>
      <Text>{weather.humidity}</Text>
      <Text>{weather.wind}</Text>
      <Text>{weather.icon}</Text>
      <Image source={{uri:weather.icon}} style={{ width: 100, height: 100 }}/>
    </View>
  );
}
 //
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
