import { Document, model, ObjectId, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { userZodtype } from "../schemas/user.schema";

interface IUser extends Document, userZodtype {
    _id: ObjectId;
    comparePassword: Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        avatarUrl: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        address: {
            type: String,
        },
        refreshToken: {
            type: String,
        },
        role: {
            type: String,
            enum: ["ADMIN", "USER", "MERCHANTS"],
            default: "USER",
        },
    },
    {
        timestamps: true,
    }
);

// Before save we have to encrypt the password

userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) next();
    this.password = await bcrypt.hash(this.password, 10);
});

// Validate the password

userSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

const User = model("User", userSchema);

export default User;
