import sauceModel from '../models/Sauce.js'
import fs from "fs"

/**
 * Permet de remplacer l'ancienne image par la nouvelle que l'utilisateur aura chargé
 * @param {string} file 
 */
const deleteImage = (file) => {
    try {
        const fileName = file.split('/images/')[1]
        fs.unlink("images/" + fileName, () => { })
    } catch (error) { console.log(error) }
}

/**
 * Permet de récupérer toute les sauces du serveur
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Express.NextFunction} next 
 * @returns {Promise<Object[]>}
 */
const findSauce = async (req, res, next) => {
    try {
        const sauces = await sauceModel.find()
        res.json(sauces)
    } catch (error) {
        return res.status(500).json({ massage: "Erreur survenue" })
    }
}


/**
 * Permet de récupérer une sauce par son Id
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Express.NextFunction} next
 * @returns {Promise<Object>}
 */
const findSauceById = async (req, res, next) => {
    try {
        const sauce = await sauceModel.findOne({ _id: req.params.id })
        res.json(sauce)
    } catch (error) {
        return res.status(500).json({ massage: "Erreur survenue" })
    }
}


/**
 * Permet de créer un sauce
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Express.NextFunction} next
 * @returns {Promise<Object[]>}
 */
const createSauce = async (req, res, next) => {
    try {
        const sauceObject = JSON.parse(req.body.sauce)

        const sauce = new sauceModel({
            userId: req.user._id.toString(),
            name: sauceObject.name,
            manufacturer: sauceObject.manufacturer,
            description: sauceObject.description,
            mainPepper: sauceObject.mainPepper,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            heat: sauceObject.heat,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: [],
        })

        await sauce.save()

        res.status(201).json({ message: "Sauce ajoutée" })
    } catch (error) {
        return res.status(500).json({ massage: "Erreur survenue" })
    }
}


/**
 * Permet de supprimer une sauce
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Express.NextFunction} next
 * @returns {Promise<Object>}
 */
const deleteSauce = async (req, res, next) => {
    try {
        const sauceId = req.params.id
        const sauce = await sauceModel.findOne({ _id: sauceId });

        if (!sauce) {
            return res.json({ message: "Sauce supprimé" });
        }

        if (sauce.userId !== req.user._id.toString()) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé a modifier la sauce" })
        }
        await sauceModel.deleteOne({ _id: sauceId })

        deleteImage(sauce.imageUrl)

        return res.json({ message: "Sauce supprimé" })
    } catch (error) {
        console.log(error)
        return res.status(500).json();
    }
};


/**
 * Permet de vérifier si une sauce existe et si elle appartient à l'utilisateur et si tout est correct de la modifier
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Express.NextFunction} next
 * @returns {Promise<Object>}
 */
const modifySauce = async (req, res, next) => {

    try {
        const sauceId = req.params.id
        let sauceObject = {}
        let data = {}

        const sauce = await sauceModel.findOne({ _id: sauceId });
        if (!sauce) {
            return res.status(404).json({ message: "Sauce introuvable" })
        }
        if (sauce.userId !== req.user._id.toString()) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé a modifier la sauce" })
        }
        if (req.file) {
            deleteImage(sauce.imageUrl)
            data = JSON.parse(req.body.sauce)
            sauceObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } else {
            data = req.body
        }
        sauceObject = {
            ...sauceObject,
            name: data.name,
            manufacturer: data.manufacturer,
            description: data.description,
            mainPepper: data.mainPepper,
            heat: data.heat,
        }

        await sauceModel.updateOne({ _id: sauceId }, sauceObject)


        res.status(200).json({ message: "sauce modifié" })

    } catch (error) {
        return res.status(500).json({ massage: "Erreur survenue" })
    }
}


/**
 * Permet de vérifier si la sauce existe et de mettre ou de retirer un like ou un disliker que l'utilisateur aura mis
 *@param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Express.NextFunction} next
 * @returns {Promise<Object>}
 */
const sauceLiked = async (req, res, next) => {
    try {
        const like = req.body.like;
        const userId = req.user._id.toString()
        const sauceId = req.params.id;

        const sauce = await sauceModel.findOne({ _id: sauceId })
        if (!sauce) {
            return res.status(404).json({ message: "Sauce introuvable" })
        }

        if (like == 1) {
            if (!sauce.usersLiked.includes(userId)) {
                await sauceModel.updateOne(
                    { _id: req.params.id },
                    { $push: { usersLiked: userId }, $inc: { likes: +1 } }
                );
            }
            if (sauce.usersDisliked.includes(userId)) {
                await sauceModel.updateOne(
                    { _id: req.params.id },
                    { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
                );
            }
            return res.json({ message: "Sauce liké !" })
        } else if (like == 0) {
            if (sauce.usersLiked.includes(userId)) {
                await sauceModel.updateOne(
                    { _id: req.params.id },
                    { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
                );
            }

            if (sauce.usersDisliked.includes(userId)) {
                await sauceModel.updateOne(
                    { _id: req.params.id },
                    { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
                );
            }
            return res.json({ message: "Cette sauce ne vous intéresse plus !" })
        } else if (like == -1) {
            if (!sauce.usersDisliked.includes(userId)) {
                await sauceModel.updateOne(
                    { _id: req.params.id },
                    { $push: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 } }
                );
            }
            if (sauce.usersLiked.includes(userId)) {
                await sauceModel.updateOne(
                    { _id: req.params.id },
                    { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
                );
            }
            return res.json({ message: "Vous n'amez pas cette sauce" })
        }
        return res.json()
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Erreur survenue" })
    }
}


export { createSauce, findSauce, findSauceById, deleteSauce, modifySauce, sauceLiked }