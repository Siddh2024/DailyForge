import mongoose from "mongoose";

// Connect to MongoDB database using try catch block
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dailyforge";
    await mongoose.connect(mongoURI);
    console.log("Connection to MongoDB successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
