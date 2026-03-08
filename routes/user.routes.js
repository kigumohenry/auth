const express = require("express");

const userRoutes = express.Router();

userRoutes.get("/me", () => {});

module.exports = userRoutes;
