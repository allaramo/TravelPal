import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, Button, ImageBackground, Alert } from 'react-native';
import { AppLoading } from 'expo';
import * as Location from 'expo-location';
import firebase from '../db/firebase';
import * as ImagePicker from 'expo-image-picker';

//importing fonts
import {
  useFonts,
  Ubuntu_300Light,
  Ubuntu_400Regular,
  Ubuntu_500Medium,
  Ubuntu_700Bold,
} from "@expo-google-fonts/ubuntu";

export default function App() {
  //state to store location data
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
    country: "",
    city: "",
    currency:""
  });

  //state to store current date and time stamp
  const [date, setDate] = useState(new Date());

  //state to store current weather
  const [weather, setWeather] = useState({
    description: "",
    temperature: 0,
    precipitation: 0,
    humidity: 0,
    wind: 0, 
    icon: "https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0004_black_low_cloud.png" //image provided by api
  });

  //state to store currency exchange data
  const [currencyExchange,setCurrencyExchange] = useState({
    base: "",
    target: "",
    baseValue : 0.00,
    targetValue : 0.00,
    rate : 0.00,
    date : ""
  })

  //state to store the amount needed to exchange, by default will be 1 unit
  const [amountExchange, setAmountExchange] = useState("1");

  //state that stores the uri of the image, by default will be null
  const [image, setImage] = useState(null);

  //effect used to get the location
  useEffect(() => {
    (async () => {
      //asks for permissions
      let { status } = await Location.requestPermissionsAsync();
      //if granted
      if (status !== 'granted') {
        Alert.alert('Permission to access gps was denied');
      } else {
        //goes to api function. Set to true because will get the local currency also.
        getLocation(true);
      }     
    })();
  }, []);  

  //open cage function
  async function getLocation(updateCurrency){
    //gets the location of the gps
    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });
    //open cage api url with the parameters
    let openCageUrl = "https://api.opencagedata.com/geocode/v1/json?key=44a9f29b61514c1bb30d4781d418d6f3&q=" +
    location.coords.latitude +
    "+" +
    location.coords.longitude;
    let currencyParam;
    //obtains the data
    fetch(openCageUrl)
    .then((response) => {
      return response.json();
    })
    .then((json) => { 
      //gets the city name (tries city district, town or district)         
      let city = "";
      if ("city" in json.results[0].components){
        city = json.results[0].components.city;
      } else if ("city_district" in json.results[0].components) {            
        city = json.results[0].components.city_district;
        city = city.split(" ")[0];
      } else if ("town" in json.results[0].components) {
        city = json.results[0].components.town;
      } else if ("district" in json.results[0].components) {
        city = json.results[0].components.district;
      }          
      //sets the location with all the data, gets the local currency also that will be used later in another api
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        country: json.results[0].components.country,
        city: city,
        currency: json.results[0].annotations.currency.iso_code
      });      
      //calls weather api
      getWeather(location.coords.latitude,location.coords.longitude); 
      //if the function was set to true will update the currency and call the api for exchange 1 unit of local currency to 1 usd
      currencyParam = json.results[0].annotations.currency.iso_code; 
      if(updateCurrency) {         
        getCurrency("USD",currencyParam,1);  
      }
    });   
  }

  //api to retrieve weather
  function getWeather(latitude,longitude) {
    //sets the url of the api
    let weatherStackUrl = "http://api.weatherstack.com/current?access_key=3bb8e0755627b88f8a4ebac7f1b8c44d&query=" +
    latitude + "," + longitude + "&units=m";
    //retrieves the data
    fetch(weatherStackUrl)
    .then((response)=>{
      return response.json();
    })
    .then((json) => {   
      //sets the weather information with the data collected 
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
 
  //currency exchange api
  function getCurrency(base,target,amount) {    
    //checks if coins are equal
    let equalCoins = false;
    if(base==target){
      equalCoins = true;
    }
    //sets the url of the api
    let fixerUrl = "http://data.fixer.io/api/latest?access_key=fc40583653e4d01a0acec2fcc7f9b77a&symbols=" + base + "," + target;
    //retrieves the data
    fetch(fixerUrl)
        .then((response) => {
          return response.json();
        })
        .then((json) => { 
          //gets the rates of both coins because api is based on euros
          let rateBase = Object.values(json.rates)[0];
          let rateTarget = rateBase;
          if(!equalCoins){
            rateTarget = Object.values(json.rates)[1];
          }
          setCurrencyExchange({
            base: base,
            target: target,
            baseValue: parseFloat(parseFloat(amount).toFixed(2)), //parses the amount into float            
            targetValue: parseFloat((parseFloat(amount)/rateBase*rateTarget).toFixed(2)), //converts the coin using both rates
            rate: parseFloat((rateTarget / rateBase).toFixed(2)), //calculates the rate of the final coin
            date: json.date
          })
         
        });
  }

  //funtion to call the currency exchange api
  function getNewExchange(){
    getCurrency(currencyExchange.base,currencyExchange.target,amountExchange);
  }

  //function to call the currency exchange api with the currencies flipped (base coin is now target coin)
  function flipCurrency(){
    getCurrency(currencyExchange.target,currencyExchange.base,amountExchange);
  }

  /* Code based on the following reference:
  * Picking an Image, 2020, Docs.expo.io. [Online]
  * Available at: https://docs.expo.io/tutorial/image-picker/
  * [Accessed 16 November 2020].
  */
 //function to pick an image from the gallery
  async function changeImage(){
    //asking for permissions
    let permission = await ImagePicker.requestCameraRollPermissionsAsync();
    if(permission.granted===false){
      //if permission not granted will show a message
      alert("Permission to access camera roll is required");
      return;
    }

    //opens the picker and saves the image
    let picker = await ImagePicker.launchImageLibraryAsync();
    
    //if the picker was cancelled returns, else saves the state with the uri of the image
    if(picker.cancelled===true) {
      return;
    } else {
      setImage(picker.uri);
    }   
  }

  /* Code based on the following reference:
  *  Daily Web Coding (2020). Crud operation with react and firebase realtime database. [Video Online]
  *  Available from: https://www.youtube.com/watch?v=v0TKYSkZ2tI
  *  [Accessed 16 November 2020]
  */
  function saveData(){
    //getting the database
    const db = firebase.database().ref("TravelPalDB");
    //setting the object to store
    const data = {
      date: date.toUTCString(), //gets and updated time    
      location, //all location object and elements
      weather, //all weather object and elements
      currencyExchange, //all currency exchange object and elements
      image: image ? image : weather.icon, //image chosen. if image not found uses the same as the weather icon
    };
    //saves data to firebase
    db.push(data);
    //save message
    Alert.alert('','Data Saved');    
  }

  //effect with interval of time to update the time
  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  //uses the fonts imported
  let [fontsLoaded] = useFonts({
    Ubuntu_300Light,
    Ubuntu_400Regular,
    Ubuntu_500Medium,
    Ubuntu_700Bold,
  });

  //waits until the fonts are loaded to render
  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (  
      //sets an image background (empty by default)
      //then a container will have two subcontainers and two buttons
      //one subcontainer is for the weahter functionality and the other for the currency exchange
      //one buttons allows to choose an image and the other to save all the data
      <ImageBackground style={styles.image} source={{uri:image}}>     
        <View style={styles.container}> 
          <View style={styles.weather}>
            <Text style={styles.title}>{location.city}</Text>
            <Text style={styles.title}>{location.country}</Text>
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
          <View style={styles.buttons}>    
              <Button title="Choose Image" onPress={changeImage} color='#555'/>   
          </View>
          <View style={styles.buttons}>      
              <Button title="Save Data" onPress={saveData} color='#0c9'/>             
          </View>        
        </View>
      </ImageBackground> 
    );
  }
}

//stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  //first subcontainer
  weather: {
    backgroundColor: '#333',
    alignItems: 'center',
    padding: 30,
    borderRadius: 5,
    width: 300,
    marginVertical: 10,
  },
  //image of the actual weather
  weatherIcon: {    
    height: 50,
    width: 50,
    margin: 10,
    borderRadius: 50,
  },
  //temperature text
  temperature: {   
    color: '#eee',   
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',    
  },
  //second subcontainer
  currency: {
    backgroundColor: '#159',
    alignItems: 'center',
    padding: 30,
    borderRadius: 5,
    width: 300,
  },
  //aligns elements in a row
  row: {    
    alignItems: 'center',    
    paddingVertical: 5,    
    flexDirection: 'row',
  },
  //group of titles and subtitles for the text components
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
  //for the base and target currency exchange
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
  //for the convert button
  button:{
    width: 260,
  },
  //for the save data and choose image buttons
  buttons:{
    margin: 10,
    width: 300,    
  },
  //for the background image
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',    
    alignItems: 'center',
  },
});