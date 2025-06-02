const express = require("express");
const router = express.Router();
const { 
    Signup, 
    Signin, 
    Signout, 
    getUserProfile, 
    editUserProfile, 
    getUserForSidebar, 
    checkAuth
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/signup", Signup);
router.post("/signin", Signin);
router.post("/signout", Signout);
router.put("/profile", authMiddleware, editUserProfile);
router.get("/profile", authMiddleware, getUserProfile);
router.get("/sidebar", authMiddleware, getUserForSidebar);
router.post("/check", authMiddleware, checkAuth);

module.exports = router;