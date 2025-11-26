import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  for (const c of cols) {
    await db.dropCollection(c.name);
    console.log("Dropped", c.name);
  }
  process.exit(0);
};

run().catch(e => { console.error(e); process.exit(1); });
