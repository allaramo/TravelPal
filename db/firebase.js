import firebase from "firebase";
//database configuration
const firebaseConfig = {
    apiKey: "AIzaSyDqCY-5QzLZhkRa6uv08-J8k2Kh3y0qSHg",
    authDomain: "travelpaldb.firebaseapp.com",
    databaseURL: "https://travelpaldb.firebaseio.com",
    projectId: "travelpaldb",
    storageBucket: "travelpaldb.appspot.com",
    messagingSenderId: "113414890040",
    appId: "1:113414890040:web:e58efd0973d7cfcfccbccd"
  };
  // Initialize Firebase
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (error) {
    alert('Error',error);
  } 
  export default firebase;