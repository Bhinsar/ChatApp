const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../helper/utils");
const cloudinary = require("../helper/cloudinary");

exports.Signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        warning: true,
        message: "All fields are required",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        warning: true,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        warning: true,
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hashSync(password, 10);
    const newUser = new User({
      email,
      password: hashPassword,
      name,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          id: newUser._id,
          email,
          name,
        },
      });
    }
  } catch (err) {
    console.log("Error signup", err);
    res.status(500).json({
      error: true,
      message: "Error signup",
    });
  }
};

exports.Signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        warning: true,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        warning: true,
        message: "User does not exist",
      });
    }
    const isMatch = await bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        warning: true,
        message: "Invalid credentials",
      });
    }

    generateToken(user._id, res);
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        id: user._id,
        email,
        name: user.name,
      },
    });
  } catch (err) {
    console.log("Error signin", err);
    res.status(500).json({
      error: true,
      message: "Error signin",
    });
  }
};

exports.Signout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      maxAge: 0,
    });
    return res.status(200).json({
      success: true,
      message: "User Signout out successfully",
    });
  } catch (err) {
    console.log("Error signout", err);
    res.status(500).json({
      error: true,
      message: "Error signout",
    });
  }
};

exports.editUserProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) {
      return res.status(400).json({
        warning: true,
        message: "All fields are required",
      });
    }
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(400).json({
        warning: true,
        message: "User does not exist",
      });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    if (uploadResponse) {
      user.profilePic = uploadResponse.secure_url;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: user,
    });
  } catch (err) {
    console.log("Error user profile", err);
    res.status(500).json({
      error: true,
      message: "Error user profile",
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(400).json({
        warning: true,
        message: "User does not exist",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    console.log("Error user", err);
    res.status(500).json({
      error: true,
      message: "Error user",
    });
  }
};

exports.getUserForSidebar = async (req, res) => {
  try {
    const authUserId = req.user._id;

    // Aggregate users with their latest message
    const users = await User.aggregate([
      // Step 1: Exclude the authenticated user
      { $match: { _id: { $ne: authUserId } } },

      // Step 2: Lookup messages where the user is either sender or receiver
      {
        $lookup: {
          from: 'messages', // The name of the Message collection in MongoDB
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $and: [{ $eq: ['$senderId', '$$userId'] }, { $eq: ['$receiverId', authUserId] }] },
                    { $and: [{ $eq: ['$senderId', authUserId] }, { $eq: ['$receiverId', '$$userId'] }] },
                  ],
                },
              },
            },
            // Sort messages by createdAt in descending order to get the latest
            { $sort: { createdAt: -1 } },
            // Limit to 1 to get only the most recent message
            { $limit: 1 },
            // Project only the createdAt field
            { $project: { createdAt: 1 } },
          ],
          as: 'latestMessage',
        },
      },

      // Step 3: Unwind latestMessage (optional, since we expect 0 or 1 message)
      { $unwind: { path: '$latestMessage', preserveNullAndEmptyArrays: true } },

      // Step 4: Sort users by latestMessage.createdAt (descending, nulls last)
      {
        $sort: {
          'latestMessage.createdAt': -1,
          _id: 1, // Secondary sort by _id for consistent ordering of users with no messages
        },
      },

      // Step 5: Exclude password field
      { $project: { password: 0 } },
    ]);

    // Check if users were found
    if (!users || users.length === 0) {
      return res.status(404).json({
        warning: true,
        message: 'No users found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      error: true,
      message: 'Error fetching users',
    });
  }
};

exports.checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
