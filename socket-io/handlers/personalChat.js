const Message = require("../../models/message.model");
const User = require("../../models/user.model");
const Group = require("../../models/group.model");

module.exports = (io, socket) => {

    console.log("Socket user:", socket.user);

    // JOIN ROOM
    socket.on("join_room", ({ room }) => {

        if (!room) {
            console.log("❌ No room provided");
            return;
        }

        socket.join(`group_${room}`);

        console.log(`👤 User ${socket.user.id} joined ${room}`);

        socket.emit("room_joined", { room });

    });


    // SEND MESSAGE
    socket.on("new_message", async ({ room, message }) => {

        try {

            if (!room || !message) {
                console.log("❌ Missing room/message");
                return;
            }

            const senderId = socket.user.id;
            const sender = await User.findByPk(senderId, {
                attributes: ["id", "groupId", "name"]
            });

            if (!sender?.groupId || String(sender.groupId) !== String(room)) {
                console.log("❌ User not part of this room:", senderId, room);
                return;
            }

            const savedMessage = await Message.create({
                message,
                userId: senderId,
                roomId: room
            });

            io.to(`group_${room}`).emit("new_message", {
                id: savedMessage.id,
                message: savedMessage.message,
                userId: senderId,
                userName: sender.name,
                roomId: room,
                createdAt: savedMessage.createdAt
            });

        } catch (err) {
            console.log("❌ Message error:", err);
        }

    });


    // SEND MEDIA
    socket.on("send_media", async ({ room, fileUrl, fileName, mimeType }) => {
        try {
            if (!room || !fileUrl) return;

            const senderId = socket.user.id;
            const sender = await User.findByPk(senderId, {
                attributes: ["id", "groupId", "name"]
            });

            if (!sender?.groupId || String(sender.groupId) !== String(room)) {
                console.log("❌ User not part of this room:", senderId, room);
                return;
            }

            const mediaPayload = JSON.stringify({ fileUrl, fileName, mimeType });

            const savedMessage = await Message.create({
                message: mediaPayload,
                userId: senderId,
                roomId: room
            });

            io.to(`group_${room}`).emit("new_message", {
                id: savedMessage.id,
                type: "media",
                fileUrl,
                fileName,
                mimeType,
                userId: senderId,
                userName: sender.name,
                roomId: room,
                createdAt: savedMessage.createdAt
            });
        } catch (err) {
            console.log("❌ Media error:", err);
        }
    });

    socket.on("invite_to_group", async ({ targetUserId }) => {
        try {
            const inviter = await User.findByPk(socket.user.id, {
                attributes: ["id", "name", "groupId"]
            });

            if (!inviter?.groupId) return;

            const targetUser = await User.findByPk(targetUserId, {
                attributes: ["id", "name", "groupId"]
            });

            if (!targetUser || targetUser.groupId) return;

            const group = await Group.findByPk(inviter.groupId, {
                attributes: ["id", "name"]
            });

            if (!group) return;

            io.to(`user_${targetUser.id}`).emit("group_invitation", {
                groupId: group.id,
                groupName: group.name,
                invitedBy: inviter.name || "A user"
            });
        } catch (err) {
            console.log("❌ Invite error:", err);
        }
    });

    socket.on("group_joined", ({ groupId }) => {
        if (!groupId) return;
        socket.join(`group_${groupId}`);
    });

};