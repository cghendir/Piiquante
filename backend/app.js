import express from "express";
import userRoutes from "./routes/user.js"
import sauceRoutes from "./routes/sauce.js"
import auth from "./middleware/auth.js"
import cors from "cors"
import path from 'path'
import { fileURLToPath } from 'url';
import connectDb from './models/index.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

connectDb()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(cors());

app.use('/api/auth', userRoutes)
app.use('/api/sauces', auth, sauceRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))

export default app;