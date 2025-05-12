import { v2 as cloudinary } from "cloudinary";
import { unlinkSync } from "node:fs";
import ApiError from "./ApiError";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getPublicIdByUrl = (url: string) =>
    url.split("/").pop()?.split(".")[0];

export const deleteFromLocal = (filePath: string) => unlinkSync(filePath);
export const deleteManyFromLocal = (filePaths: string[]) =>
    filePaths.forEach((file: string) => deleteFromLocal(file));

// console.log(cloudinary.config());

export const cloudinaryUpload = async (localPath: string) => {
    if (!localPath) return null;
    try {
        const uploadRes = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto",
        });
        deleteFromLocal(localPath);
        console.log("cloudinary upload res", uploadRes);
        return uploadRes;
    } catch (error) {
        console.log("cloudinary file uplaod failed", error);
        deleteFromLocal(localPath);
        return null;
    }
};

export const cloudinaryUploadMany = async (localPaths: string[]) => {
    try {
        const uploadHelper = localPaths.map((localPath: string) => {
            return cloudinary.uploader.upload(localPath, {
                resource_type: "auto",
            });
        });
        const uploadResult = await Promise.all(uploadHelper);
        deleteManyFromLocal(localPaths);
        return uploadResult.map((res) => res.secure_url);
    } catch (error) {
        console.log("Muliple cloudinary upload failed", error);
        deleteManyFromLocal(localPaths);
        return null;
    }
};

export const deleteFromCloudinary = async (publicIds: string | string[]) => {
    try {
        // only single delete
        if (typeof publicIds === "string") {
            await cloudinary.uploader.destroy(publicIds);
        } else {
            // Multiple delete
            await cloudinary.api.delete_resources(publicIds);
        }
    } catch (error) {
        // return null;
        console.log(error);
        throw new ApiError(500, "Unable to delete");
    }
};
