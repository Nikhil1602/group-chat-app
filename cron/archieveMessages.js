const cron = require("node-cron");
const { Op } = require("sequelize");

const Message = require("../models/message.model");
const ArchivedMessage = require("../models/archieve.model");

cron.schedule("0 0 * * *", async () => {
    console.log("⏳ Running archive job...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
        const oldMessages = await Message.findAll({
            where: {
                createdAt: {
                    [Op.lt]: sevenDaysAgo
                }
            }
        });

        if (!oldMessages.length) {
            console.log("No messages to archive");
            return;
        }

        // Move to archive
        await ArchivedMessage.bulkCreate(
            oldMessages.map(msg => msg.toJSON())
        );

        // Delete from main table
        await Message.destroy({
            where: {
                createdAt: {
                    [Op.lt]: sevenDaysAgo
                }
            }
        });

        console.log(`✅ Archived ${oldMessages.length} messages`);

    } catch (err) {
        console.log("❌ Archive error:", err);
    }
});