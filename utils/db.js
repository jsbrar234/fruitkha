const mongoose = require("mongoose");
const URL = process.env.MONGO_URL;

const connectDb = async () => {
    try {
        await mongoose.connect('mongodb+srv://jsbrar07427:brar1616@cluster0.0eyp9qg.mongodb.net/mernStack?retryWrites=true&w=majority&appName=Cluster0');
        console.log("DATABASE CONNECTION SUCCESSFULL")
    } catch (error) {
        console.error("DATABASE CONNECTION FAILED", error);
        process.exit(0)
    }
}

module.exports = connectDb