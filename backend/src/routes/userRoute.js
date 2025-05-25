const express = require("express");
const router = express.Router();
const { Signup, Signin, Signout, getUser, getUserProfile, editUserProfile, getUserForSidebar} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/user/signup", Signup)
router.post("/user/signin", Signin)
router.post("/user/signout", Signout)

router.put("/user/update", authMiddleware, editUserProfile)
router.get("/user/get", authMiddleware, getUserProfile)

router.get("/get/users" , authMiddleware, getUserForSidebar)


module.exports = router;