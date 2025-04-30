import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { Document, Model, model, Schema, Types } from "mongoose";
interface IUserMethods {
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string | undefined;
    generateRefreshToken(): string | undefined;
}

interface IAdminData {
    verifyBy?: Types.ObjectId;
    verifyAt?: Date;
}

interface IUserData extends IAdminData {
    username: string;
    avatarUrl?: string;
    email: string;
    password: string;
    address?: string;
    role: "ADMIN" | "USER" | "MERCHANT";
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface UserDocument
    extends IUserData,
        Document<Types.ObjectId>,
        IUserMethods {}

const userSchema = new Schema<UserDocument, Model<UserDocument>, IUserMethods>(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            index: true,
            unique: true,
            trim: true,
        },
        avatarUrl: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            index: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: [8, "Passsword must be at least 8 character long"],
        },
        address: {
            type: String,
        },
        refreshToken: {
            type: String,
        },
        role: {
            type: String,
            enum: ["ADMIN", "USER", "MERCHANT"],
            default: "USER",
        },
    },
    {
        timestamps: true,
    }
);

// Before save we have to encrypt the password

userSchema.pre<UserDocument>("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Validate the password

userSchema.methods.comparePassword = async function (
    password: string
): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

// JWT Methods
// Genrate Access Token(short term) and refresh token(long term)
userSchema.methods.generateAccessToken = function () {
    try {
        if (!process.env.ACCESSTOKEN_KEY) {
            throw new Error("Access key not provided");
        }

        const key = process.env.ACCESSTOKEN_KEY;
        const expiresIn = (process.env.ACCESSTOKEN_EXP ||
            "1d") as SignOptions["expiresIn"];

        return jwt.sign(
            {
                _id: this._id,
                username: this.username,
            },
            key,
            {
                expiresIn: expiresIn,
            }
        );
    } catch (error) {
        console.error(`Error while generating access token errors \n ${error}`);
        return undefined;
    }
};

userSchema.methods.generateRefreshToken = function () {
    try {
        if (!process.env.REFERESHTOKEN_KEY) {
            throw new Error("Refresh key not provided");
        }
        const key = process.env.REFERESHTOKEN_KEY as string;
        const expiresIn = (process.env.REFERESHTOKEN_EXP ||
            "10d") as SignOptions["expiresIn"];
        return jwt.sign(
            {
                _id: this._id,
                username: this.username,
                email: this.email,
                role: this.role,
            },
            key,
            {
                expiresIn: expiresIn,
            }
        );
    } catch (error) {
        console.error(
            `Error while generating refresh token errors \n ${error}`
        );
        return undefined;
    }
};

const User = model("User", userSchema);

export default User;
