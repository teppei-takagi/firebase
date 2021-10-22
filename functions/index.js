import * as functions from "firebase-functions";
import { firebaseApp } from "./util/firebase.js";
import express from "express";
import screamRouter from "./router/scream.js";
import userRouter from "./router/user.js";

const app = express();

app.use("/screams", screamRouter);
app.use("/users", userRouter)

export const api = functions.https.onRequest(app);