const User = require("../models/User");
const {
  updateRoleSchema,
  updateUserProfileSchema,
} = require("../validation/user.validator");
const checkPerm = require("../utils/checkPerm");

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        error: "User associated with the provided credentials does not exist",
      });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { prevCursor, nextCursor, search, role, isVerified } = req.query;

    const query = {};
    const pageSize = 10;
    let users;

    //searching by name or email
    if (search) {
      query.$or = [
        { name: { $reqex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    //filtering by role or isVerified
    if (role) {
      query.role = role;
    }
    if (isVerified) query.isVerified = isVerified;

    //PAGINATION

    if (nextCursor) {
      query._id = { $gt: cursor };
      users = await User.find(query)
        .skip(1)
        .sort({ _id: "descending" })
        .limit(pageSize);
    } else if (prevCursor) {
      query._id = { $lt: cursor };
      users = await User.find(query)
        .skip(1)
        .sort({ _id: "descending" }.limit(pageSize));
    } else {
      users = (await User.find(query)).sort({ _id: "desc" }).limit(pageSize);
    }

    let hasNext = false;
    let hasPrev = false;

    const firstUser = users.at(0);
    const lastUser = users.at(-1);

    if (firstUser) {
      const previous = await User.findOne({
        ...query,
        _id: { $gt: firstUser._id },
      });
      hasPrev = Boolean(previous);
    }
    if (lastUser) {
      const next = await User.findOne({ ...query, _id: { $lt: lastUser._id } });
      hasNext = Boolean(next);
    }

    res.json({
      users,
      hasNext,
      hasPrev,
      nextCursor: hasNext ? lastUser._id : null,
      prevCursor: hasPrev ? firstUser._id : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name } = updateUserProfileSchema.parse(req.body);
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { name } },
      { runValidators: true },
    );

    if (!user) {
      return res.status(404).json("User not found.");
    }

    res.json({ msg: "Profile updated successfully.", user });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    checkPerm("admin");
    const { role } = updateRoleSchema.parse(req.body);
    const id = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { runValidators: true },
    );
    if (!updatedUser) {
      return res.status(404).json({
        error:
          "User associated with the provided credentials does not exist.Verify and try again",
      });
    }
    res.json({ msg: "User role updated successfully", updatedUser });
  } catch (error) {
    next(error);
  }
};
