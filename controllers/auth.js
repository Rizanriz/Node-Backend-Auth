const Customer = require("../models/userModel");
const bcrypt = require("bcrypt");
const generateTokenAndSetCookie = require("../utils/generateToken");

const signup = async (req, res) => {
    const { email, phone, password, role } = req.body;
    try {
        const existingUser = await Customer.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(200).json({ success: true, message: "user already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const verificationToken = String(Math.floor(100000 + Math.random() * 400000));
        const expirationTime = new Date().getTime() + 60 * 60 * 1000; // expiration time
        console.log("otp :" ,verificationToken);

        const newUser = new Customer({
            email,
            phone,
            password: hashPassword,
            verificationToken,
            verificationTokenExpiration: expirationTime,
            role,
        });

        generateTokenAndSetCookie(res, newUser._id);
        await newUser.save();

        return res.status(200).json({
            success: true,
            message: "user created successfully",
            newUser,
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
    const { email, phone, password } = req.body;
    try {
        const customer = await Customer.findOne({ $or: [{ email }, { phone }] });
        if (!customer) {
            return res.status(400).json({ success: false, message: "user does not exist" });
        }

        const hashedPassword = await bcrypt.compare(password, customer.password);
        if (!hashedPassword) {
            return res.status(400).json({ success: false, message: "Invalid password" });
        }

        generateTokenAndSetCookie(res, customer._id);
        return res.status(200).json({ success: true, message: "user logged in successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { email, verificationToken } = req.body;
    try {
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(400).json({ success: false, message: "user does not exist" });
        }

        if (customer.verificationToken !== verificationToken) {
            return res.status(400).json({ success: false, message: "Invalid verification token" });
        }

        if (customer.verificationTokenExpiration < new Date().getTime()) {
            await Customer.findOneAndDelete({ email });
            return res.status(400).json({ success: false, message: "Verification token has expired" });
        }

        customer.isVerified = true;
        await customer.save();

        generateTokenAndSetCookie(res, customer._id);
        return res.status(200).json({ success: true, message: "user verified successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(400).json({ success: false, message: "user does not exist" });
        }

        const newVerificationToken = String(Math.floor(100000 + Math.random() * 400000));
        const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 1 hour expiration time

        customer.verificationToken = newVerificationToken;
        customer.verificationTokenExpiration = expirationTime;
        await customer.save();

        console.log(`New verification otp: ${newVerificationToken}`);

        return res.status(200).json({
            success: true,
            message: "new verification token sent",
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { signup, login, verifyOtp, resendOtp };