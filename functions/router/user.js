import express from "express";
import { db, adminApp, storage } from "../util/admin.js"
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, setDoc} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Busboy from "busboy";
import dotenv  from "dotenv";
import { FBAuth } from "../util/token.js";

dotenv.config();

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

// add user details
userRouter.post('/update', FBAuth, async(req,res)=>{
  // there will be the input validation for production
  const docRef = doc(db, "users", req.user.handle);
  
  try{
    const updatedDoc = await updateDoc(docRef, req.body);
    return res.json({message: 'user details updated sccuessfuly'});
    // return res.json(updatedDoc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: err.code});
  }
});

// get user details
userRouter.get('/', FBAuth, async(req,res)=>{
  // there will be the input validation for production
  let userData = {};
  const userRef = doc(db, "users", req.user.handle);
  
  try{
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      userData.credencials = userSnap.data();
      
      const q = await query(collection(db, "users"), where("userId", "==", req.user.handle));
      const querySnap = await getDocs(q);
      userData.likes = [];
      querySnap.forEach(doc =>{
        userData.likes.push(doc.data());
      });
      return res.json(userData)
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: err.code});
  }
});


// upload avatar image and tie the image to collection "users"
userRouter.post('/avatar', FBAuth, async (req, res)=>{
  const busboy = new Busboy({ headers: req.headers });

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    //console.log(fieldname, file, filename, encoding, mimetype);
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }
    // my.image.png => ['my', 'image', 'png']
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    const timestamp = new Date().getTime();
    const imageFileName = filename.split(".")[0] + "_"+ timestamp + "." + imageExtension;

    file.on('data', data => {
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      const storageRef = ref(storage, `/images/${imageFileName}`);
      const uploadTask = uploadBytes(storageRef, data, {contentType : mimetype})
        .then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            const docRef = doc(db, "users", req.user.handle);
            updateDoc(docRef, {imageUrl: url})
              .then(()=>{
                return res.status(200).json({message: 'image updated successfuly'});
              })
          })
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: "something went wrong" });
        });
    });  
  });
  busboy.end(req.rawBody);
});

export default userRouter;