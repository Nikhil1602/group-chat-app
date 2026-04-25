const Group = require("../models/group.model");
const User = require("../models/user.model");

exports.listGroups = async (_req, res) => {

    try {

        const groups = await Group.findAll({
            order: [["createdAt", "DESC"]]
        });

        res.json(groups);

    } catch (err) {

        res.status(500).json({ message: "Failed to load groups" });

    }

};

exports.createGroup = async (req, res) => {

    try {

        const { name } = req.body;
        const userId = req.user.id;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group name is required" });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.groupId) {
            return res.status(400).json({ message: "You are already in a group" });
        }

        const existingGroup = await Group.findOne({ where: { name: name.trim() } });

        if (existingGroup) {
            return res.status(400).json({ message: "Group name already exists" });
        }

        const group = await Group.create({
            name: name.trim(),
            createdBy: userId
        });

        user.groupId = group.id;
        await user.save();

        res.status(201).json(group);

    } catch (err) {

        res.status(500).json({ message: "Failed to create group" });

    }

};

exports.joinGroup = async (req, res) => {

    try {

        const userId = req.user.id;
        const groupId = Number(req.params.groupId || req.body.groupId);

        if (!groupId) {
            return res.status(400).json({ message: "Group id is required" });
        }

        const [user, group] = await Promise.all([
            User.findByPk(userId),
            Group.findByPk(groupId)
        ]);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (user.groupId) {
            return res.status(400).json({ message: "You are already in a group" });
        }

        user.groupId = group.id;
        await user.save();

        res.json({ message: "Joined group successfully", group });

    } catch (err) {

        res.status(500).json({ message: "Failed to join group" });

    }
};
