import mongoose from "mongoose"


/* 
Permet de se connecter à la base de donnée et renvoi un message de confirmation ou un message d'erreur
*/
const connectDb = async () => {
    try {
        await mongoose.connect('mongodb+srv://chems-gh:Teach.yamiyami6804@cluster0.gwbhcsf.mongodb.net/?retryWrites=true&w=majority',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
        console.log('Connexion à MongoDB réussie !')
    } catch (error) {
        console.log('Connexion à MongoDB échouée !')
    }
}

export default connectDb