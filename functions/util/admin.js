import { firebaseApp } from "./firebase.js";

import { getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";

import admin from 'firebase-admin';

const adminApp = admin.initializeApp();

const db = getFirestore();

const storage = getStorage();

export {adminApp, db, storage}