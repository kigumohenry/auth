const checkPerm = (perm, userRole) => {
  if (perm === userRole) {
    return;
  } else {
    const err = new Error("Forbidden;access denied.");
    err.statusCode = 403;
    throw err;
  }
};

module.exports = checkPerm;
