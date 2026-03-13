import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;

/**
 * Uploads an image file to Cloudinary
 * @param fileBuffer The file buffer to upload
 * @param folder The folder in Cloudinary to upload the image to
 * @returns Upload result containing secure_url and public_id
 */
export const uploadImageToCloudinary = async (
    fileBuffer: Buffer,
    folder: string = 'thrifting_ecommerce'
): Promise<{ url: string; publicId: string }> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(error);
                }

                if (!result) {
                    return reject(new Error('No result from Cloudinary upload'));
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        // End the buffer into the upload stream
        uploadStream.end(fileBuffer);
    });
};

/**
 * Deletes an image from Cloudinary
 * @param publicId The public ID of the image to delete
 * @returns Boolean indicating success
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<boolean> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return false;
    }
};
/**
 * Generates an optimized Cloudinary URL for an image
 * @param publicId The public ID of the image
 * @param options Transformation options
 * @returns The optimized URL
 */
export const getCloudinaryUrl = (publicId: string, options: any = {}): string => {
    return cloudinary.url(publicId, {
        secure: true,
        fetch_format: 'auto',
        quality: 'auto',
        ...options
    });
};
