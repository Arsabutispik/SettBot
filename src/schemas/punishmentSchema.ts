import mongoose, { Schema } from "mongoose";

const reqString = {
    type: String,
    required: true
}

const schema = new Schema({
    userId: reqString,
    staffId: reqString,
    reason: reqString,
    expires: Date,
    type: {
        type: String,
        required: true,
        enum: ["ban", "mute"]
    }
}, {
    timestamps: true
})

export default mongoose.model("schema", schema)