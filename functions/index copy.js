import * as functions from "firebase-functions";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, getDoc, setDoc} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import {db} from "./util/admin.js"
import { FBAuth } from "./auth.js";

import express from "express";
import screamRouter from "./router/scream.js";
const app = express();

const firebaseConfig = {
  apiKey: "AIzaSyD1eTSc29Slm9IU_mCimsB9ia_ink2mdtY",
  authDomain: "fb-study-ce91a.firebaseapp.com",
  projectId: "fb-study-ce91a",
  storageBucket: "fb-study-ce91a.appspot.com",
  messagingSenderId: "770451974208",
  appId: "1:770451974208:web:df7806cec90682185557a5",
  measurementId: "G-LRCXZVEYEQ"
};

const firebaseApp = initializeApp(firebaseConfig);
// const db = getFirestore();
const auth = getAuth();

// app.get('/screams', FBAuth, async (req, res)=>{
//   let screams=[];
//   const querySnapshot = await getDocs(collection(db, "screams"));
//   querySnapshot.forEach((doc) => {
//     screams.push(doc.data());
//   });
//   return res.json(screams);
// });

app.use("/screams", screamRouter);

// app.post('/scream', FBAuth, async (req, res)=>{
//   const newScream = {
//     body: req.body.body,
//     userHandle: req.user.handle,
//     // createdAt: admin.firestore.Timestamp.fromDate(new Date()) 
//     createdAt: new Date().toISOString()
//   };

//   try{
//     const docRef = await addDoc(collection(db, "screams"), newScream);
//     return res.json({message: `document ${docRef.id} created`});
//   }catch(err) {
//     res.status(500).json({error: "something wrong"});
//     console.error(err);
//   }
// });

app.post('/login', async (req, res)=>{
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  try {
    const userRef = await signInWithEmailAndPassword(auth, user.email, user.password);
    const token = await userRef.user.getIdToken();
    return res.json({token});
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: err.code});
  }
});

app.post('/signup', async (req, res)=>{
  const newUser ={
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const docRef = doc(db, "users", newUser.handle);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return res.status(400).json({handle: 'this handle is taken'})
  } else {

    const userRef = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password)
    const userId = userRef.user.uid;
    const token = await userRef.user.getIdToken()

    const userCredentials = {
      email: newUser.email,
      createdAt: new Date().toISOString(),
      userId: userId
    }

    const userDoc = await setDoc(doc(db, "users", newUser.handle), userCredentials);
    const userSnap = await getDoc(doc(db, "users", newUser.handle))
    res.json({
      uid: userSnap.data().userId,
      token: token
    });
  }
});

export const api = functions.https.onRequest(app);