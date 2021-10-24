import express from "express";
import { db } from "../util/admin.js"
import { collection, getDocs, addDoc, doc, getDoc, setDoc} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Busboy from "busboy";
import path from "path";
import os from "os";
import fs from "fs";

const storage = getStorage();

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

userRouter.post('/upload', async (req, res)=>{

  const busboy = new Busboy({ headers: req.headers });

  let imageToBeUploaded = {};
  let imageFileName;
  // String for image token
  // let generatedToken = uuid();

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(file);
    console.log(filename);
    console.log(encoding);
    console.log(mimetype);

    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }
    const metadata = {
      contentType: mimetype
    };

    // my.image.png => ['my', 'image', 'png']
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    const timestamp = new Date().getTime();
    const imageFileName = filename.split(".")[0] + "_"+ timestamp + "." + imageExtension;

    // 32756238461724837.png
    // imageFileName = `${Math.round(
    //   Math.random() * 1000000000000
    // ).toString()}.${imageExtension}`;
    
    const filepath = path.join(os.tmpdir(), imageFileName);

    console.log(imageFileName)
    console.log(filepath)

    // const storageRef = ref(storage, 'images/' + imageFileName);
    // uploadBytes(storageRef, file).then((snapshot) => {
    //   console.log('Uploaded a blob or file!');
    // });
    // const uploadTask = uploadBytesResumable(storageRef, file);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));

    const storageRef = ref(storage, 'images/' + imageFileName);
    uploadBytes(storageRef, filepath).then((snapshot) => {
      console.log('Uploaded a blob or file!');
    });

    // uploadTask.on('state_changed',
    //   (snapshot) => {
    //     // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    //     const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //     console.log('Upload is ' + progress + '% done');
    //     console.log("test")
    //   }, 
    //   (err) => { 
    //     console.log(err);
    //     res.json(err.code);
    //   },
    //   () => {
    //     console.log("comp")
    //     // Upload completed successfully, now we can get the download URL
    //     getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
    //       console.log('File available at', downloadURL);
    //     });
    //   }
    // );
  });
  // busboy.on("finish", () => {
  //   const storageRef = ref(storage, 'images/' + imageFileName);
  //   uploadBytes(storageRef, imageToBeUploaded.filepath).then((snapshot) => {
  //     console.log('Uploaded a blob or file!');
  //   });
    
  //     // admin
  //     // .storage()
  //     // .bucket()
  //     // .upload(imageToBeUploaded.filepath, {
  //     //   resumable: false,
  //     //   metadata: {
  //     //     metadata: {
  //     //       contentType: imageToBeUploaded.mimetype,
  //     //       //Generate token to be appended to imageUrl
  //     //     },
  //     //   },
  //     // })
  //     // .then(() => {
  //     //   // Append token to url
  //     //   const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
  //     //   return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
  //     // })
  //     // .then(() => {
  //     //   return res.json({ message: "image uploaded successfully" });
  //     // })
  //     // .catch((err) => {
  //     //   console.error(err);
  //     //   return res.status(500).json({ error: "something went wrong" });
  //     // });
  // });
  busboy.end(req.rawBody);
});

export default userRouter;