import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

cloudinary.config({
    cloud_name: 'dsvil0utb',
    api_key: '264659589742164',
    api_secret: 'jUU1eAV0HNlKp9QlCJncKf6Bu4Q'
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        console.log("uploaded Data on Cloudinary:- ", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed..>>>
        console.log("uploading failed on Cloudinary:-", error);
        return null;
    }
}