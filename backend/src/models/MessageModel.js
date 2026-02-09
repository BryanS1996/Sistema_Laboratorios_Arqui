const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        senderId: { type: String, required: true },
        receiverId: { type: String, required: true },
        content: { type: String, required: true },
        read: { type: Boolean, default: false },
        // Context could be 'academic' or specific subjectId if needed later
        contextId: { type: String, default: null }
    },
    { timestamps: true }
);

// Indexes for fast history retrieval
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, read: 1 });

module.exports = mongoose.model("Message", MessageSchema);
