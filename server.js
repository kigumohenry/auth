require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { ZodError } = require("zod");

const authRouter = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const connectDb = require("./utils/db");

connectDb(process.env.MONGO_URI);

const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => {
      msg: e.message;
    });

    return res
      .status(400)
      .json({ msg: "Validation error", errors: formattedErrors });
  }

  //other errors
  console.error(err);

  res.status(500).json({ msg: "Internal server error" });
});

mongoose.connect(process.env.MONGO_URI);
