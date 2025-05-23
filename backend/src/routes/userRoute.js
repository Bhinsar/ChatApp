const express = require("express");
const router = express.Router();
const { Signup, Signin, Signout, getUser, UserProfile} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/user/signup", Signup)
router.post("/user/signin", Signin)
router.post("/user/signout", Signout)

router.put("/user/update", authMiddleware, UserProfile)
router.get("/user/get", authMiddleware, getUser)

module.exports = router;