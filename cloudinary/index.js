const cloudinary = require("cloudinary").v2;

const { CloudinaryStorage } =  require("multer-storage-cloudinary");
const dotenv = require("dotenv");

// checks to see if development dependencies are required or not
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const cloudinaryParams = {
    secure: true,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

cloudinary.config(cloudinaryParams);

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "online-top-trumps",
        allowedFormats: ["png", "jpeg", "jpg"]
    }
});

module.exports = { storage, cloudinary };