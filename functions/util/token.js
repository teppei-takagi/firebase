import { adminApp as admin, db} from "./admin.js"
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export const FBAuth = async (req, res, next) =>{
  let idToken;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
    idToken = req.headers.authorization.split('Bearer ')[1];
  }else{
    console.error('no token found')
    return res.status(403).json({error: 'Unauthorized'})
  }

  try{
    const decode = await admin.auth().verifyIdToken(idToken);
    req.user = decode;
    const q = query(collection(db, "users"), where("userId", "==", req.user.uid), limit(1));
    const querySnapshot = await getDocs(q);
    req.user.handle = querySnapshot.docs[0].id;
    return next();
  }catch(err){
    console.error('Error happen while verifying token', err);
    res.status(403).json(err);
  }
}