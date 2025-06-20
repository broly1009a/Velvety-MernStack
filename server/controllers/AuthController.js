const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, roleName: user.roleName }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, roleName, phoneNumber } = req.body;
    
        // Kiểm tra email hoặc số điện thoại đã tồn tại chưa
        const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingUser) {
          return res.status(400).json({
            message: existingUser.email === email
              ? "Email already in use"
              : "Phone number already in use",
          });
        }
    
        // Hash mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Tạo mã xác thực email
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const verificationTokenCreatedAt = Date.now() + 3600000;
    
        // Tạo user
        const user = await User.create({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          roleName,
          phoneNumber,
          verified: false,
          verificationToken,
          verificationTokenCreatedAt : verificationTokenCreatedAt,
        });
    
        // Gửi email xác thực
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
    
         // Send verification email
        try {
          const verificationUrl = `${process.env.FRONT_END_URL}/verify?token=${verificationToken}`;
          await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: "Verify Your Email",
            html: `
              <h2>Welcome, ${user.firstName}!</h2>
              <p>Click the button below to verify your email:</p>
              <a href="${verificationUrl}" style="display:inline-block; padding:10px 20px; color:white; background-color:#c86c79; text-decoration:none; border-radius:5px;">
                Verify Email
              </a>
              <p>If you did not sign up, ignore this email.</p>
            `,
          });
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          return res.status(500).json({ message: "Error sending verification email. Please try again." });
        }

        res.status(201).json({ message: "User registered! Please verify your email." });
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "An error occurred during registration. Please try again later." });
      }
    };
    

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        if (!user.verified) return res.status(403).json({ message: "Please verify your email before logging in." });

        const token = generateToken(user);

        res.json({ token, user: { id: user._id, email: user.email, roleName: user.roleName, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: "No token provided" });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user || user.verified) {
      return res.status(400).json({ success: false, message: "Email already verified or invalid token." });
    }

    // Token expiration handling (Optional)
    const TOKEN_EXPIRY_TIME = 3600000; // 1 hour in milliseconds
    const tokenCreationTime = new Date(user.verificationTokenCreatedAt).getTime();
    const currentTime = new Date().getTime();
    if (currentTime - tokenCreationTime > TOKEN_EXPIRY_TIME) {
      return res.status(400).json({ success: false, message: "Verification token has expired." });
    }

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully! You can now log in." });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, message: "Verification failed. Try again." });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
    
        if (!user) return res.status(404).json({ message: "Email has not been registered." });

        // Restrict password reset to only customers
        if (user.roleName !== "Customer") {
          return res.status(403).json({ message: "Only customers are allowed to reset their password. Please contact admin for assistance." });
        }
    
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
    
        const resetUrl = `${process.env.FRONT_END_URL}/reset-password?token=${resetToken}`;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
        });
    
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: user.email,
          subject: "Password Reset Request",
          html: `
            <h2>Password Reset</h2>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; color:white; background-color:#c86c79; text-decoration:none; border-radius:5px;">
              Reset Password
            </a>
            <p>If you did not request this, please ignore this email.</p>
          `,
        });
    
        res.status(200).json({ message: "Password reset link sent to your email." });
    
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;
    
        const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() },
        });
    
        if (!user) return res.status(400).json({ message: "Invalid or expired token." });
    
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
    
        res.status(200).json({ message: "Password reset successful. You can now log in." });
    
      } catch (error) {
        res.status(500).json({ error: "Something went wrong. Try again." });
      }
    };

    exports.resendVerificationEmail = async (req, res) => {
        try {
          const { email } = req.body; // Assuming email is sent in the request body
          
          const user = await User.findOne({ email });
          if (!user) return res.status(400).json({ message: "No user found with this email" });
      
          // Check if the user is already verified
          if (user.verified) {
            return res.json({ message: "Email already verified" });
          }
      
          // Generate a new verification token
          const verificationToken = crypto.randomBytes(32).toString("hex");
          user.verificationToken = verificationToken;
          await user.save();
      
          // Send the verification email (Implementation needed)
          // sendVerificationEmail(user.email, verificationToken);
      
          res.json({ message: "Verification email has been resent. Please check your inbox." });
        } catch (error) {
          res.status(500).json({ message: "Error resending verification email", error });
        }
      };

      exports.logout = (req, res) => {
        try {
          console.log("🔹 Logout request received");
      
          // Clear the auth token cookie
          res.clearCookie("authToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "None" });
          res.clearCookie("roleName", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "None" });
          res.clearCookie("fullName", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "None" });
          res.clearCookie("userId", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "None" });
      
          console.log("🔹 authToken cookie cleared");
      
          // Destroy session (only if sessions are used)
          if (req.session) {
            req.session.destroy((err) => {
              if (err) {
                console.error("❌ Session destruction error:", err);
                return res.status(500).json({ message: "Failed to logout" });
              }
              console.log("✅ Session destroyed successfully");
              res.json({ message: "Logged out successfully" });
            });
          } else {
            console.log("⚠️ No session found");
            res.json({ message: "No session to destroy" });
          }
        } catch (error) {
          console.error("❌ Unexpected error during logout:", error);
          res.status(500).json({ message: "An error occurred during logout" });
        }
      };
      
      exports.changePassword = async (req, res) => {
        try {
          const { currentPassword, newPassword, userId } = req.body;
          const user = await User.findById(userId);
      
          if (!user) return res.status(404).json({ message: "User not found" });
      
          const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
          if (!isPasswordValid) return res.status(401).json({ message: "Current password is incorrect" });
      
          user.password = await bcrypt.hash(newPassword, 10);
          await user.save();
      
          res.json({ message: "Password changed successfully" });
        } catch (error) {
          console.error("❌ Error changing password:", error);
          res.status(500).json({ message: "An error occurred while changing password" });
        }
      };
      