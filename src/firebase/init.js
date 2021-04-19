import firebase from "firebase";
import firestore from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAR2Mh9xbDwWaFmV03F9rBXEC-Z7Dk8UTs",
  authDomain: "i-image-4a18f.firebaseapp.com",
  databaseURL: "https://i-image-4a18f-default-rtdb.firebaseio.com",
  projectId: "i-image-4a18f",
  storageBucket: "i-image-4a18f.appspot.com",
  messagingSenderId: "488479612025",
  appId: "1:488479612025:web:6109515529d16cb79908a8",
  measurementId: "G-47GGP8HW0X"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);

//export firestore database
export default firebaseApp.firestore();
