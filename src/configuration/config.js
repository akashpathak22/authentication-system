import dotenv from "dotenv"
dotenv.config()

   // 1. Validate that the MongoDB URI is provided in configuration
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in your environment variables (.env)");
    }
   // 1. Validate that the jwt secret is provided in configuration
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in your environment variables (.env)");
    }
    

const config ={

  MONGO_URI : process.env.MONGO_URI,
  JWT_SECRET : process.env.JWT_SECRET,


}


export default config;