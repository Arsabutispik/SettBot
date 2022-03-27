import mongoose from "mongoose";
const { model, Schema} = mongoose
const userSchema = new Schema({
    _id: String,
    balance: {
        type: Number,
        default: 500
    },
    win: {
        type: Number,
        default: 0
    },
    hourly: Date,
    
    daily: Date
});

export default model("userSchema", userSchema);