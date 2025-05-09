import User from "../model/user.model";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

const merchantOnly = asyncHandler(async (req, _, next) => {
    const userId = req.user?._id;

    const isMerchant = await User.exists({
        _id: userId,
        role: "MERCHANT",
    });

    if (!isMerchant) {
        throw new ApiError(
            401,
            "Unauthorized request , you can't access the resource"
        );
    }
    next();
});

export default merchantOnly;
