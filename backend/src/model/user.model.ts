import bcrypt from "bcrypt";
import { Document, Model, model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
interface IUserMethods {
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string | undefined;
    generateRefreshToken(): string | undefined;
}

interface IUserData {
    username: string;
    avatarUrl?: string;
    email: string;
    password: string;
    address?: string;
    role: "ADMIN" | "USER" | "MERCHANTS";
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
            enum: ["ADMIN", "USER", "MERCHANTS"],
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
        return jwt.sign(
            {
                _id: this._id,
                username: this.username,
            },
            process.env.ACCESSTOKEN_KEY as string,
            {
                expiresIn: parseInt(process.env.ACCESSTOKEN_EXP!, 10) || "1D",
            }
        );
    } catch (error) {
        console.log(`Error while generating access token errors \n ${error}`);
        return undefined;
    }
};

userSchema.methods.generateRefreshToken = function () {
    try {
        return jwt.sign(
            {
                _id: this._id,
                username: this.username,
                email: this.email,
                role: this.role,
            },
            process.env.REFERESHTOKEN_KEY as string,
            {
                expiresIn:
                    parseInt(process.env.REFERESHTOKEN_EXP!, 10) || "10D",
            }
        );
    } catch (error) {
        console.log(`Error while generating refresh token errors \n ${error}`);
        return undefined;
    }
};

const User = model("User", userSchema);

export default User;
