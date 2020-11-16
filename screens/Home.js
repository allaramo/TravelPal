import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, Button } from 'react-native';
import { AppLoading } from 'expo';
import * as Location from 'expo-location';
import firebase from '../db/firebase';

import {
  useFonts,
  Ubuntu_300Light,
  Ubuntu_400Regular,
  Ubuntu_500Medium,
  Ubuntu_700Bold,
} from "@expo-google-fonts/ubuntu";

export default function App() {
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
    country: "",
    city: "",
    currency:""
  });

  const [date, setDate] = useState(new Date());

  const [weather, setWeather] = useState({
    description: "",
    temperature: 0,
    precipitation: 0,
    humidity: 0,
    wind: 0,
    icon: "https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0004_black_low_cloud.png"
  });

  const [currencyExchange,setCurrencyExchange] = useState({
    base: "",
    target: "",
    baseValue : 0.00,
    targetValue : 0.00,
    rate : 0.00,
    date : ""
  })

  const [amountExchange, setAmountExchange] = useState("1");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access gps was denied');
      } else {
        getLocation(true);
      }     
    })();
  }, []);  

  async function getLocation(updateCurrency){
    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });
    let openCageUrl = "https://api.opencagedata.com/geocode/v1/json?key=44a9f29b61514c1bb30d4781d418d6f3&q=" +
    location.coords.latitude +
    "+" +
    location.coords.longitude;
    let currencyParam;
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
        city: city,
        currency: json.results[0].annotations.currency.iso_code
      });
      getWeather(location.coords.latitude,location.coords.longitude); 
      currencyParam = json.results[0].annotations.currency.iso_code; 
      if(updateCurrency) {         
        getCurrency("USD",currencyParam,1);  
      }
    });   
  }

  function getWeather(latitude,longitude) {
    let weatherStackUrl = "http://api.weatherstack.com/current?access_key=59f7e5aea92d9b246584e72d35e0f13c&query=" +
    latitude + "," + longitude + "&units=m";
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
 
  function getCurrency(base,target,amount) {    
    let frankFurterUrl = "http://api.frankfurter.app/latest?amount="+amount+"&from="+base+"&to="+target;
    fetch(frankFurterUrl)
        .then((response) => {
          return response.json();
        })
        .then((json) => { 
          let value = json.rates[Object.keys(json.rates)[0]];
          setCurrencyExchange({
            base: base,
            target: target,
            baseValue: amount,
            targetValue: (Math.round(value * 100) / 100).toFixed(2),
            rate: (Math.round((amount/value) * 100) / 100).toFixed(2),
            date: json.date
          })
         
        });
  }

  function getNewExchange(){
    getCurrency(currencyExchange.base,currencyExchange.target,amountExchange);
  }

  function flipCurrency(){
    getCurrency(currencyExchange.target,currencyExchange.base,amountExchange);
  }

  function saveData(){
    const db = firebase.database().ref("TravelPalDB");
    const data = {
      date: date.toUTCString(),      
      location,
      weather,
      currencyExchange,
    };
    db.push(data);
    console.group("data saved");
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getLocation(false);
    }, 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);


  let [fontsLoaded] = useFonts({
    Ubuntu_300Light,
    Ubuntu_400Regular,
    Ubuntu_500Medium,
    Ubuntu_700Bold,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (      
      <View style={styles.container}>
        <View style={styles.weather}>
          <Text style={styles.title}>{location.city}, {location.country}</Text>
          <Text style={styles.subtitle}>{date.toUTCString()}</Text>
          <Text style={styles.subtitle}>{weather.description}</Text>
          <Image style={styles.weatherIcon} source={{uri:weather.icon}}/>          
          <Text style={styles.temperature}>{weather.temperature}°C</Text>
          <Text style={styles.subtitle2}>Precipitation: {weather.precipitation}% Humidity: {weather.humidity}% Wind: {weather.wind} km/h</Text>          
        </View>
        <View style={styles.currency}> 
          <View style={styles.row}>        
            <Text style={styles.subtitle3}>{currencyExchange.base}</Text>
            <Text style={styles.subtitle3}>{currencyExchange.target}</Text>
          </View>
          <View style={styles.row}>
            <TextInput style={styles.box} value={amountExchange} onChangeText={text => setAmountExchange(text)}/>
            <Button title="<- ->" onPress={flipCurrency}/>
            <Text style={styles.box}>{currencyExchange.targetValue}</Text> 
          </View>
          <View style={styles.button}>       
            <Button title="Convert" onPress={getNewExchange}/>             
          </View>        
        </View>
        <View style={styles.saveButton}>       
            <Button title="Save Data" onPress={saveData} color='#555'/>             
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weather: {
    backgroundColor: '#333',
    alignItems: 'center',
    padding: 30,
    borderRadius: 5,
    width: 300,
    marginVertical: 10,
  },
  weatherIcon: {    
    height: 50,
    width: 50,
    margin: 10,
    borderRadius: 50,
  },
  temperature: {   
    color: '#eee',   
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',    
  },
  currency: {
    backgroundColor: '#159',
    alignItems: 'center',
    padding: 30,
    borderRadius: 5,
    width: 300,
  },
  row: {    
    alignItems: 'center',    
    paddingVertical: 5,    
    flexDirection: 'row',
  },
  title: {
    fontFamily: 'Ubuntu_500Medium',
    color : '#ccc',    
    fontWeight: 'bold',
    fontSize: 20,
  },
  subtitle: {
    fontFamily: 'Ubuntu_400Regular',
    color : '#aaa',    
    fontWeight: 'bold',
    fontSize: 15,
  },
  subtitle2: {
    fontFamily: 'Ubuntu_300Light',
    color : '#aaa',
    fontWeight: 'bold',
    fontSize: 10,
    marginTop: 20,
  },
  subtitle3: {
    fontFamily: 'Ubuntu_300Light',
    color : '#eee',
    fontWeight: 'bold',
    fontSize: 20,    
    paddingHorizontal: 80,
  }, 
  box:{
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor : '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    width: 100,
    height: 30,
    padding: 5,    
    margin: 10,
    textAlign: 'right',
    color: '#333'
  },
  button:{
    width: 260,
  },
  saveButton:{
    margin: 10,
    width: 300,    
  }
});