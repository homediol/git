export const ADMIN_IMAGE_UPLOAD_LIMIT_MB = 20;
export const ADMIN_IMAGE_UPLOAD_LIMIT_BYTES = ADMIN_IMAGE_UPLOAD_LIMIT_MB * 1024 * 1024;

export function getAdminImageUploadError(file) {
    if (!file || !file.type?.startsWith('image/')) {
        return null;
    }

    if (file.size <= ADMIN_IMAGE_UPLOAD_LIMIT_BYTES) {
        return null;
    }

    return `Please upload an image that is ${ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB or smaller.`;
}
