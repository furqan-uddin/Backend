import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDNIARY_CLOUD_NAME, 
    api_key: process.env.CLOUDNIARY_API_KEY, 
    api_secret: process.env.CLOUDNIARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)  return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type :"auto"
        })
        //file has been uploaded successfully
        // console.log("file is been uploaded on cloudinary ",response.url)
        fs.unlinkSync(localFilePath)
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath)//remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}
export {uploadOnCloudinary}
