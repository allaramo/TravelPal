import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Button, ImageBackground, FlatList, Alert } from 'react-native';
import firebase from '../db/firebase';

//importing fonts
import {
    useFonts,
    Ubuntu_300Light,
    Ubuntu_400Regular,
    Ubuntu_500Medium,
    Ubuntu_700Bold,
  } from "@expo-google-fonts/ubuntu";

export default function App() {
    //state for the data in the db (practically a snapshot of all the info in a timestamp)
    const [snapshots, setSnapshots] = useState();
    //state for the background image, null by default
    const [image, setImage] = useState(null);

    //effect that stores in the state the info that is in the db
    useEffect(()=>{
        //connects to the database
        const db = firebase.database().ref("TravelPalDB");
        //gets results
        db.on('value', (results)=>{
            //gets data (each element has an unique id)
            const data = results.val();
            //creates another array to save temporally the data
            const snapshotsArray = [];
            //a counter to get the last element
            let counter = 0;
            //for each id (element) in data pushes the information
            for(let id in data){
                snapshotsArray.push({id, ... data[id]});  
                counter++;               
            }            
            //copies the temporal array to the state
            setSnapshots(snapshotsArray);           
            //gets the last image saved if there is at least one element saved 
            if(counter>0){
                setImage(snapshotsArray[counter-1].image);
            }
        });        
    },[]);   

    //function to delete one element passing its id
    function deleteData(id){
        //sends message to ask for confirmation
        Alert.alert('','Delete this element?',
        [          
          { 
            text: 'Cancel',            
            style: 'cancel'
          },
          { text: 'OK', onPress: () => {
                //if confirmed connects to the database and with the specific child
                const db = firebase.database().ref("TravelPalDB").child(id);
                //removes child element
                db.remove();
                //shows message of deletion
                Alert.alert('','Element deleted');
          } }
        ],
        { cancelable: false });
    }
   
    //uses the fonts imported
    let [fontsLoaded] = useFonts({
        Ubuntu_300Light,
        Ubuntu_400Regular,
        Ubuntu_500Medium,
        Ubuntu_700Bold,
      });

    //waits until the fonts are loaded to render
    if (!fontsLoaded) {
      return (<View style={styles.container}><Text>Loading...</Text></View>);
    } else {
        return(
            /* Code based on the following references:
            * FlatList, 2020, Docs.expo.io. [Online]
            * Available at: https://docs.expo.io/versions/latest/react-native/flatlist/
            * [Accessed 16 November 2020].           
            * React Native FlatList Deleting Items issue, 2020, Stackoverflow [Online]
            * Available at:  https://stackoverflow.com/questions/59527139/react-native-flatlist-deleting-items-issue
            * [Accessed 16 November 2020].
            */
            //sets an image background (empty by default)
            //then a container will have a flatlist
            //the flatlist will get the data fron snapshots using the id and index as the keys and rendering the items
            <ImageBackground style={styles.imageBG} source={{uri:image}}> 
                <View style={styles.container}>           
                    <FlatList
                        data={snapshots}
                        keyExtractor={({ id }, index) => index.toString()}
                        renderItem={({ item, index }) => {
                            return (
                                //for each child will create a row container with 2 columns
                                //one columns will hold the principal data and image
                                //the other will contain the weather and currency data as well the delete button
                                <View style={styles.row}>
                                    <View style={styles.column}>
                                        <Text style={styles.subtitle}>{item.date}</Text>
                                        <Text style={styles.title}>{item.location.city}</Text>
                                        <Text style={styles.title}>{item.location.country}</Text>                                
                                        <Image style={styles.image} source={{uri:item.image}}/>      
                                    </View>  
                                    <View style={styles.column}>
                                        <Image style={styles.weatherIcon} source={{uri:item.weather.icon}}/> 
                                        <Text style={styles.subtitle}>{item.weather.description}</Text>
                                        <Text style={styles.subtitle2}>Temperature: {item.weather.temperature}°C</Text>
                                        <Text style={styles.subtitle2}>Precipitation: {item.weather.precipitation}%</Text>
                                        <Text style={styles.subtitle2}>Humidity: {item.weather.humidity}%</Text>
                                        <Text style={styles.subtitle2}>Wind: {item.weather.wind} km/h</Text>
                                        <Text style={styles.subtitle2}> </Text>
                                        <Text style={styles.subtitle2}>Currency</Text>
                                        <Text style={styles.subtitle2}>{item.currencyExchange.baseValue} {item.currencyExchange.base} = {item.currencyExchange.targetValue} {item.currencyExchange.target}</Text>                             
                                        <Text style={styles.subtitle2}>Rate: {item.currencyExchange.rate}</Text>  
                                        <Text style={styles.subtitle2}> </Text>
                                        <Button title="Delete" color='#c22' onPress={()=> deleteData(item.id)}/> 
                                    </View>                                                                          
                                </View>
                            );
                        }}
                    />   
                </View>
            </ImageBackground>
        );
    }
}

//styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      row: {
        backgroundColor: '#333',
        alignItems: 'center',
        padding: 20,
        borderRadius: 5,
        width: 360,
        marginVertical: 10,
        flexDirection: 'row', 
      },
      column: {
          flexDirection: 'column',
          margin: 10,
          alignItems: 'center',
          flex: 1,
      },
      //for the text components
      title: {
        fontFamily: 'Ubuntu_500Medium',
        color : '#ccc',    
        fontWeight: 'bold',
        fontSize: 18,
        margin: 5,
      },
      subtitle: {
        fontFamily: 'Ubuntu_400Regular',
        color : '#aaa',    
        fontWeight: 'bold',
        fontSize: 13,
        margin: 5,
        textAlign: 'center',
      },
      subtitle2: {
        fontFamily: 'Ubuntu_300Light',
        color : '#aaa',
        fontWeight: 'bold',
        fontSize: 10,    
        textAlign: 'right',
      },
      weatherIcon: {    
        height: 50,
        width: 50,
        margin: 10,
        borderRadius: 50,
      },
      //for the image of each child
      image: {    
        height: 100,
        width: 100,
        margin: 10,
        borderRadius: 50,
      },  
      //for the background image
      imageBG: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',    
        alignItems: 'center',
      },    
});