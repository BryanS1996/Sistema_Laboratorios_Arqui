const Message = require("../models/MessageModel");
const { getFactory } = require("../factories");

// We need UserDAO to resolve names/roles for the contact list
const factory = getFactory();
const userDAO = factory.createUserDAO();

async function sendMessage(req, res) {
    try {
        const { receiverId, content, contextId } = req.body;
        console.log("sendMessage Request:", { sender: req.user.id, receiverId, content });

        if (!receiverId || !content) {
            return res.status(400).json({ message: "receiverId and content are required" });
        }

        const senderId = String(req.user.id);

        const msg = await Message.create({
            senderId,
            receiverId: String(receiverId), // Ensure string
            content,
            contextId
        });
        console.log("Message created:", msg);

        return res.status(201).json(msg);
    } catch (e) {
        console.error("sendMessage Error:", e);
        return res.status(500).json({ message: e.message });
    }
}

async function getHistory(req, res) {
    try {
        const userId = String(req.user.id);
        const otherId = req.params.otherId;
        const limit = parseInt(req.query.limit) || 50;

        console.log("getHistory:", { userId, otherId });

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherId },
                { senderId: otherId, receiverId: userId }
            ]
        })
            .sort({ createdAt: 1 }) // Chronological for chat UI
            .limit(limit);

        console.log(`Found ${messages.length} messages`);

        return res.json(messages);
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}

async function markAsRead(req, res) {
    try {
        const userId = String(req.user.id); // Receiver
        const senderId = req.params.senderId;

        await Message.updateMany(
            { senderId: senderId, receiverId: userId, read: false },
            { $set: { read: true } }
        );

        return res.json({ success: true });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}

async function getChatStatus(req, res) {
    try {
        const userId = String(req.user.id);

        // Aggregate to find:
        // 1. Unread counts (where I am receiver and read=false)
        // 2. Last message timestamp (where I am sender OR receiver)

        // We need two separate aggregations or a complex one. 
        // Simpler: 
        // A. Get Unread Counts
        // B. Get Last Interaction per contact

        const unreadAgg = await Message.aggregate([
            { $match: { receiverId: userId, read: false } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } }
        ]);

        const lastMsgAgg = await Message.aggregate([
            {
                $match: {
                    $or: [{ senderId: userId }, { receiverId: userId }]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", userId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMessageAt: { $first: "$createdAt" },
                    lastContent: { $first: "$content" }
                }
            }
        ]);

        return res.json({
            unread: unreadAgg,
            lastMessages: lastMsgAgg
        });

    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}

/**
 * Returns valid contacts for the user based on their Role & Academic Load.
 */
async function getContacts(req, res) {
    try {
        const user = req.user;

        // Use the strict filtering method we just added to the DAO
        const contacts = await userDAO.findRelatedUsers(user.id, user.role);

        // Mask sensitive info (already done by the specific selectQuery but good safety)
        const safeContacts = contacts.map(u => ({
            id: u.id,
            nombre: u.nombre,
            role: u.role,
            email: u.email
        }));

        return res.json(safeContacts);

    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
}

module.exports = {
    sendMessage,
    getHistory,
    markAsRead,
    getChatStatus,
    getContacts
};
