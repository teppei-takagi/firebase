import { firebaseApp } from "./firebase.js";

import { getFirestore} from "firebase/firestore";
import admin from 'firebase-admin';

const adminApp = admin.initializeApp();

const db = getFirestore();

export {adminApp, db}