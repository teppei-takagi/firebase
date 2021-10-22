import express from "express";
import { db } from "../util/admin.js"
import { FBAuth } from "../util/token.js";
import { collection, getDocs, addDoc } from "firebase/firestore";

const screamRouter = express.Router();

screamRouter.get('/', FBAuth, async (req, res)=>{
  let screams=[];
  const querySnapshot = await getDocs(collection(db, "screams"));
  querySnapshot.forEach((doc) => {
    screams.push(doc.data());
  });
  return res.json(screams);
});

screamRouter.post('/new', FBAuth, async (req, res)=>{
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString()
  };

  try{
    const docRef = await addDoc(collection(db, "screams"), newScream);
    return res.json({message: `document ${docRef.id} created`});
  }catch(err) {
    res.status(500).json({error: "something wrong"});
    console.error(err);
  }
});

export default screamRouter;