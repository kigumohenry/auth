require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const authRouter = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const connectDb = require("./utils/db");

connectDb(process.env.MONGO_URI);

const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);

mongoose.connect(process.env.MONGO_URI);
