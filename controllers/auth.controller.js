const User = require("../models/user.model");
const Group = require("../models/group.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// ------------------
// SIGNUP
// ------------------
exports.signup = async (req, res) => {

    try {

        const { name, email, phone, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const existingPhone = await User.findOne({ where: { phone } });
        if (existingPhone) {
            return res.status(400).json({ message: "Phone already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            phone,
            password: hashedPassword
        });

        res.json({ message: "Signup successful" });

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

};

// ------------------
// LOGIN
// ------------------
exports.login = async (req, res) => {

    try {

        const { identifier, password } = req.body;

        const user = await User.findOne({
            where: {
                [require("sequelize").Op.or]: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "1h"
        });

        // ✅ STORE TOKEN IN COOKIE
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // set true in production (https)
            sameSite: "lax"
        });

        res.json({ token: token, message: "Login successful" });

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

};

// ------------------
// LOGOUT
// ------------------
exports.logout = async (req, res) => {

    try {

        res.clearCookie("token", {
            httpOnly: true,
            secure: false, // true in production (HTTPS)
            sameSite: "lax"
        });

        return res.json({ message: "Logout successful" });

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

}

// ------------------
// GET USER BY EMAIL
// ------------------
exports.getUserByEmail = async (req, res) => {

    try {

        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({
            where: { email },
            attributes: ["id", "name", "email"] // never expose password/phone unless needed
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);

    } catch (err) {

        res.status(500).json({ message: "Server error" });

    }

};

// ------------------
// GET CURRENT USER
// ------------------
exports.getMe = async (req, res) => {

    try {

        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: ["id", "name", "email", "groupId"],
            include: [
                {
                    model: Group,
                    attributes: ["id", "name", "createdBy"]
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);

    } catch (err) {

        res.status(500).json({ message: "Server error" });

    }

};

// ------------------
// GET UNGROUPED USERS
// ------------------

exports.getUngroupedUsers = async (req, res) => {

    try {

        const users = await User.findAll({
            where: {
                groupId: null
            },
            attributes: ["id", "name", "email"]
        });

        res.json(users);

    } catch (err) {

        res.status(500).json({ message: "Server error" });

    }

};