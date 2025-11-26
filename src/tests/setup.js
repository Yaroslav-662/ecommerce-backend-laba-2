import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectTestDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

export const closeTestDB = async () => {
  await mongoose.connection.close();
};
