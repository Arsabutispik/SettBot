import mongoose from "mongoose";
const { model, Schema} = mongoose
const userSchema = new Schema({
    _id: String,
    case: Number
});

export default model("caseSchema", userSchema);