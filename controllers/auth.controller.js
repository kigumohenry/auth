const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("../models/User");
const sendEmail = require("../utils/emails");

const registerSchema = require("../validation/auth.validator");
const loginSchema = require("../validation/auth.validator");
const generateToken = require("../utils/token.util");
const { jwt } = require("zod");

exports.register = async (req, res, next) => {
  try {
    const { email, name, password } = registerSchema.parse(req.body);

    //check if user with this email exists

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const user = User.create({
      email,
      name,
      password,
      emailVerificationToken,
      emailVerificationTokenExpires: Date.now() + 60 * 60 * 1000,
    });
    const token = generateToken(user._id, user.role);

    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: `<h3>Verification email<h3><p>${emailVerificationToken}<p>`,
    });

    res.status(201).json({
      msg: "User created successfully,verify your email",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        error:
          "User with the provided email does not exist.Verify and try again",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!user.emailIsVerified) {
      return res.status(403).json({ msg: "Please verify your email first" });
    }
    const refreshToken = generateToken({
      id: user._id,
      role: user.role,
      type: "refresh",
    });

    const accessToken = generateToken({
      id: user._id,
      role: user.role,
      type: "access",
    });

    user.refreshToken = refreshToken;
    user.save();

    res.status(200).json({
      message: "Login successful",
      refreshToken,
      accessToken,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: "Refresh token missing.Please provide one.",
      });
    }

    const { id } = await jwt.verify(refreshToken, process.env.SECRET_KEY);

    const user = await User.findOne({ id });

    if (!user || refreshToken !== user.refreshToken) {
      res.status(401).json({ error: "Invalid token" });
    }

    const token = generateToken({
      id: user._id,
      role: user.role,
      type: "access",
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Invalid token." });
  }
};

const verifyEmail = async (req, res, next) => {
  const token = req.query.token;

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.emailIsVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    user.save();
    res.json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify email,please try again." });
  }
};

const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.refreshToken = undefined;
    user.save();
    res.json({ msg: "Logged out successfully." });
  } catch (error) {
    console.error(error);
    re.status(500).json({ error: "Logout failed,try again." });
  }
};
