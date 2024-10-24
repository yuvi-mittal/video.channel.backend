import {v2 as cloudinary} from "cloudinary"
import fs from "fs"  //file system

// basically how to upload file from our local server to cloudinary , after uploading unlink from our server 
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

  const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {  //upload on cloudinary
            resource_type: "auto"   //detect type of file by yourself 
        })
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) 
        return null;
    }
}

export {uploadOnCloudinary}
