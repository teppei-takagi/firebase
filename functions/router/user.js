import express from "express";
import { db } from "../util/admin.js"
import { collection, getDocs, addDoc, doc, getDoc, setDoc} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
const auth = getAuth();

const userRouter = express.Router();

userRouter.post('/login', async (req, res)=>{
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

userRouter.post('/signup', async (req, res)=>{
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


export default userRouter;