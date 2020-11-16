import { StatusBar } from 'expo-status-bar';
import { database } from 'firebase';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Button, SafeAreaView, FlatList } from 'react-native';
import firebase from '../db/firebase';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export default function App() {

    const [snapshots, setSnapshots] = useState();

    useEffect(()=>{
        const db = firebase.database().ref("TravelPalDB");
        db.on('value', (results)=>{
            const data = results.val();
            const snapshots = [];
            for(let id in data){
                snapshots.push({id, ... data[id]}); 
            }
            setSnapshots(snapshots);           
        });        
    },[]);

    function deleteData(id){
        const db = firebase.database().ref("TravelPalDB").child(id);
        db.remove();
    }

    return(           
        <SafeAreaView style={styles.container}>
            <FlatList
                data={snapshots}
                keyExtractor={({ id }, index) => index.toString()}
                renderItem={({ item, index }) => {
                    return (
                        <View style={styles.row}>
                            <View style={styles.column}>
                                <Image style={styles.weatherIcon} source={{uri:item.weather.icon}}/> 
                                <Text style={styles.subtitle}>{item.weather.description}</Text>
                                <Text style={styles.subtitle2}>Temperature: {item.weather.temperature}°C</Text>
                                <Text style={styles.subtitle2}>Precipitation: {item.weather.precipitation}%</Text>
                                <Text style={styles.subtitle2}>Humidity: {item.weather.humidity}%</Text>
                                <Text style={styles.subtitle2}>Wind: {item.weather.wind} km/h</Text>
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.subtitle}>{item.date}</Text>
                                <Text style={styles.title}>{item.location.city}</Text>
                                <Text style={styles.title}>{item.location.country}</Text>
                                <Text style={styles.subtitle}>{item.currencyExchange.baseValue} {item.currencyExchange.base} = {item.currencyExchange.targetValue} {item.currencyExchange.target}</Text>                             
                                <Text style={styles.subtitle}>Rate: {item.currencyExchange.rate}</Text>  
                            </View>
                            <View style={styles.column}>
                                <Button title="Delete" color='#f44' onPress={()=> deleteData(item.id)}/>         
                            </View>                                            
                        </View>
                    );
                }}
            /> 
        </SafeAreaView> 
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      row: {
        backgroundColor: '#333',
        alignItems: 'center',
        padding: 30,
        borderRadius: 5,
        width: 500,
        marginVertical: 10,
        flexDirection: 'row', 
      },
      column: {
          flexDirection: 'column',
          margin: 10,
      },
      title: {
        fontFamily: 'Ubuntu_500Medium',
        color : '#ccc',    
        fontWeight: 'bold',
        fontSize: 20,
        margin: 5,
      },
      subtitle: {
        fontFamily: 'Ubuntu_400Regular',
        color : '#aaa',    
        fontWeight: 'bold',
        fontSize: 15,
        margin: 5,
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
});