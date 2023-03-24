import jwt from 'jsonwebtoken'
import User from '../models/User.js'


/**
 * Authentifie toutes les requêtes des utilisateurs
 * @param {object} req 
 * @param {string} res 
 * @param {Function} next 
 * @returns {Promise}
 */

const auth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization
        if (!authorization) {
            return res.status(401).json({ message: 'utilisateur non autorisé' })
        }
        const token = authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')
        const userId = decodedToken.userId

        const user = await User.findById(userId)
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non autorisé' })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ massage: 'Utilisateur non autorisé' })
    }
}

export default auth