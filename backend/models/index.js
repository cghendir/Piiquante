import mongoose from "mongoose"


/* 
Permet de se connecter à la base de donnée et renvoi un message de confirmation ou un message d'erreur
*/
const connectDb = async () => {

    const mongoUrl = process.env.MONGO_URL

    try {
        await mongoose.connect(mongoUrl)
        console.log('Connexion à MongoDB réussie !')
    } catch (error) {
        console.log(error)
        console.log('Connexion à MongoDB échouée !')
    }
}

export default connectDb