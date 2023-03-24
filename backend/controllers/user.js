import bcrypt from 'bcrypt'
import User from '../models/User.js'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'


/**
 * Permet à un utilisateur de crée un compte avec un e-mail et un mot de passe cripté 
 * @param {Object} req 
 * @param {String} res 
 * @param {*} next 
 * @returns {Promise}
 */

const signUp = [
    body("email").isEmail().escape(),
    body("password").isLength({ min: 3 }).escape(),
    async (req, res, next) => {
        try {
            const password = req.body.password
            const email = req.body.email

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const passwordHash = await bcrypt.hash(password, 10)
            const exist = await User.findOne({ email: email })

            if (exist) {
                return res.status(400).json({ message: "Email deja existant" })
            }

            const user = new User({
                email: email,
                password: passwordHash
            })

            await user.save()

            res.status(201).json({ massage: 'Utilisateur créé!' })
        } catch (error) {
            console.log(error)
            res.status(500).json({ massage: "Erreur survenue" })
        }
    }
]


/**
 * Permet à un utilisateur de se connecter avec son e-mail et son mot de passe
 * @param {Object} req 
 * @param {String} res 
 * @param {*} next 
 * @returns {Promise}
 */

const login = async (req, res, next) => {
    try {
        const secret = process.env.SECRET
        const password = req.body.password
        const email = req.body.email

        if (!email || !password) {
            return res.status(401).json({ massage: 'Identifiant/Mot de passe incorecte' })
        }

        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(401).json({ massage: 'Identifiant/Mot de passe incorecte' })
        }

        const passwordValid = await bcrypt.compare(password, user.password)
        if (!passwordValid) {
            return res.status(401).json({ massage: 'Identifiant/Mot de passe incorecte' })
        }
        return res.status(200).json({
            userId: user._id,
            token: jwt.sign(
                { userId: user._id },
                secret,
                { expiresIn: '24h' }
            )
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Erreur survenue" })
    }
}


export { signUp, login }