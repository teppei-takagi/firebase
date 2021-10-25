import express from "express";
import { db } from "../util/admin.js"
import { FBAuth } from "../util/token.js";
import { doc, query, where, orderBy, limit, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";

const screamRouter = express.Router();

screamRouter.get('/', FBAuth, async (req, res)=>{
  let screams=[];
  const querySnapshot = await getDocs(collection(db, "screams"));
  querySnapshot.forEach((doc) => {
    screams.push(doc.data());
  });
  return res.json(screams);
});

screamRouter.post('/', FBAuth, async (req, res)=>{
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };

  try{
    const docRef = await addDoc(collection(db, "screams"), newScream);
    return res.json({message: `document ${docRef.id} created`});
  }catch(err) {
    console.error(err);
    return res.status(500).json({error: "something wrong"});
  }
});

// get a scream
screamRouter.get('/:screamId', async (req, res) => {
  let screamData ={};
  try{
    const docRef = doc(db, "screams", req.params.screamId);
    const screamSnap = await getDoc(docRef);
    if(!screamSnap.exists()) {
      return res.status(404).json({error: "scream not found"})
    }
    screamData = screamSnap.data();
    screamData.screamId = screamSnap.id;
    const q = await query(collection(db, "comments"), where("screamId", "==", req.params.screamId), orderBy("createdAt", "desc"));
    const querySnap = await getDocs(q);

    screamData.comments = []
    querySnap.forEach((doc) => {
      screamData.comments.push(doc.data());
    });
    return res.json(screamData);

  }catch(err) {
    console.error(err);
    return res.status(500).json({error: err.code});
  }

});

// delete scream 
screamRouter.delete('/:screamId', FBAuth, async (req, res) => {
  try{
    const screamRef = await doc(db, "screams", req.params.screamId);
    const screamDoc = await getDoc(screamRef);
    if(!screamDoc.exists()){
      return res.status(404).json({error: "scream not found"})
    }

    if(screamDoc.data().userHandle !== req.user.handle) {
      return res.status(403).json({error: "unauthorized"})
    } else {
      await deleteDoc(screamRef);
      res.json({message: "scream deleted successfuly"})
    }

  }catch(err) {
    console.error(err);
    return res.status(500).json({error: "something wrong"});
  }
});

// like a scream
screamRouter.get('/:screamId/like', FBAuth, async (req, res) => {
  // why dont we store like in each scream? becuase prevent a document from getting bigger.
  
  // check scream exists?
  try{
    const screamRef = await doc(db, "screams", req.params.screamId);
    const screamDoc = await getDoc(screamRef);
    if (!screamDoc.exists()){
      return res.status(404).json({error: 'Scream not found'});
    }
    // check like exists?
    const q =  query(collection(db, "likes"), where('userHandle', '==', req.user.handle), where('screamId', '==', req.params.screamId), limit(1));
    const likeDocs = await getDocs(q);
    const likeDoc = likeDocs.docs[0];
    console.log(likeDocs.docs.length)
    if (likeDocs.docs.length === 0){
      // addDoc in like collection.
      // tid to a scream using screamId. user using handle.
      const newLike = {
        screamId: req.params.screamId,
        userHandle: req.user.handle
      };
      const newLikeDoc = await addDoc(collection(db, "likes"), newLike);

      // count up like count in scream
      const updatedlikeCount = screamDoc.data().likeCount + 1;
      await updateDoc(screamRef, {likeCount: updatedlikeCount});
      const updatedScream = await getDoc(screamRef);
      return res.json(updatedScream.data());
    }else{
      return res.status(400).json({message: "already like the scream"})
    }
  }catch(err) {
    console.error(err);
    return res.status(500).json({error: "something wrong"});
  }
});

// unlike a scream
screamRouter.get('/:screamId/unlike', FBAuth, async (req, res) => {
  try{
    const screamRef = await doc(db, "screams", req.params.screamId);
    const screamDoc = await getDoc(screamRef);
    if (!screamDoc.exists()){
      return res.status(404).json({error: 'Scream not found'});
    }

    // check like exists?
    const q =  query(collection(db, "likes"), where('userHandle', '==', req.user.handle), where('screamId', '==', req.params.screamId), limit(1));
    const likeDocs = await getDocs(q);
    if (likeDocs.docs.length === 0){
      return res.status(400).json({message: "scream not liked"})
    }else{
      // addDoc in like collection.
      // tid to a scream using screamId. user using handle.
      likeDocs.forEach(data=>{
        deleteDoc(doc(db, "likes", data.id));
      });

      // count down like count in scream
      const updatedlikeCount = screamDoc.data().likeCount - 1;
      await updateDoc(screamRef, {likeCount: updatedlikeCount});
      const updatedScream = await getDoc(screamRef);
      return res.json(updatedScream.data());
    }

  }catch(err) {
    console.error(err);
    return res.status(500).json({error: "something wrong"});
  }

});
// comment on a scream
screamRouter.post('/:screamId/comment', FBAuth, async (req, res) => {
  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };


  try{
    const screamRef = doc(db, "screams", req.params.screamId);
    const screamSnap = await getDoc(screamRef);
    if(!screamSnap.exists()) {
      return res.status(404).json({error: "scream not found"})
    }

    const docRef = await addDoc(collection(db, "comments"), newComment);
    return res.json({message: `document ${docRef.id} created`});
  }catch(err) {
    console.error(err);
    return res.status(500).json({error: err.code});
  }
});

export default screamRouter;