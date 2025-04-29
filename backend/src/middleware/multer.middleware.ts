import multer from "multer";

export const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, "./public/temp/");
    },
    filename(req, file, callback) {
        callback(null, `${Date.now()}_${file.originalname}`);
    },
});

export const upload = multer({ storage: storage });
export const formData = multer().none();
