const mongoose = require("mongoose");

const connectDb = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    console.info("mongodb connected");
  } catch (error) {
    console.error("Database connection failed", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
