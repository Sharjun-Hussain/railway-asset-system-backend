import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ MongoDB Connected");
//   } catch (err) {
//     console.error("❌ Mongo Error:", err);
//     process.exit(1);
//   }
// };


export const connectDB =  async () =>{
    try{
        await mongoose.connect("mongodb+srv://root:SPZNWEe1KiTN24Wb@railwaydb.bpwv7zc.mongodb.net/")
        console.log("MongoDB COnnected")
    } catch (e){
        console.error("There is an error while connecting to the MongoDB Database ", e)
        process.exit(1);
    }
}
