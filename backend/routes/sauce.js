import express from "express";
import * as sauce from "../controllers/sauce.js"
import multer from '../middleware/multer-config.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.get('/', auth, sauce.findSauce)
router.get('/:id', auth, sauce.findSauceById)
router.post('/', auth, multer, sauce.createSauce)
router.put('/:id', auth, multer, sauce.modifySauce)
router.delete('/:id', auth, sauce.deleteSauce)
router.post('/:id/like', auth, multer, sauce.sauceLiked)

export default router