import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function connectDB() {
  try {
    console.log("🔎 All env keys:", Object.keys(process.env));
    console.log("🔎 DB_URI value:", process.env.DB_URI);

    const result = await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log("✅ DB Connected:", Object.keys(result.models));
  } catch (error) {
    console.error("❌ Fail to connect on DB:", error.message);
  }
}