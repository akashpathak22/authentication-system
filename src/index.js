

import express, { json } from 'express'
import morgan from "morgan"
import autheRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';

const app = express();


app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser())


app.use("/api/auth", autheRouter)


export default app;
