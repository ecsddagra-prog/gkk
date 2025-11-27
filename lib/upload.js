import { supabase } from './supabase'

/**
 * Uploads a file to Supabase Storage
 * @param {File} file - The file object to upload
 * @param {string} bucket - The storage bucket name (default: 'service-images')
 * @param {string} path - Optional path/folder inside the bucket
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadImage = async (file, bucket = 'service-images', path = '') => {
    if (!file) throw new Error('No file provided')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = path ? `${path}/${fileName}` : fileName

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

    if (error) {
        throw error
    }

    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

    return urlData.publicUrl
}
