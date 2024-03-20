// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { collection, doc, setDoc, getDoc } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFcXgtkft3YeCWSNhXUivUnLW56h7cOtw",
  authDomain: "memorygame-func.firebaseapp.com",
  projectId: "memorygame-func",
  storageBucket: "memorygame-func.appspot.com",
  messagingSenderId: "922287565939",
  appId: "1:922287565939:web:531ade9b192e685c06ce06",
  measurementId: "G-VF1GYW9THS"
};

function MyDB() {
  let app;
  let analytics;
  let db;
  initializeDB();

  function initializeDB(){
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    // Initialize Cloud Firestore and get a reference to the service
    db = getFirestore(app);
    console.log('Firebase initiallized!', db);
  }

  //for this demo I'll keep it to the user 'visitor' for all time
  //later I can switch to a whole system of login and register stuff
  async function getGameStatus(){
    let user = null;
    const docRef = doc(db, "User", "visitor");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      user = docSnap.data();
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
    return user;
  }

  async function saveGameStatus(userData) {
    const {score, time, cards, move, difficulty} = userData;
    await setDoc(doc(this.db,"User","visitor"), {
      score:score,
      time:time,
      cards:cards,
      move:move,
      difficulty:difficulty,
    });
  }

  const me = {};
  me.db = db;
  me.analytics = analytics;
  me.getGameStatus = getGameStatus;
  me.saveGameStatus = saveGameStatus;

  return me;
}

const mydb = MyDB();
export default mydb;
