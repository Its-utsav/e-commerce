import User from "../model/user.model";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

const adminOnly = asyncHandler(async (req, _, next) => {
    const userId = req.user?._id;

    const isAdmin = await User.findOne({
        _id: userId,
        role: "ADMIN",
    });

    if (!isAdmin) {
        throw new ApiError(
            401,
            "Unauthorized request , you can't access the resource"
        );
    }
    next();
});

export default adminOnly;
