import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2Client, R2_BUCKET_NAME } from '../../../lib/r2'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Verify admin access
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Check if user is superadmin
        const { data: profile } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        // Check if user has permission to upload
        if (!['superadmin', 'admin', 'provider'].includes(profile?.role)) {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const { filename, filetype } = req.body

        // Sanitize filename
        const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
        const key = `uploads/${Date.now()}-${cleanFilename}`

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: filetype,
        })

        const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 })

        res.status(200).json({
            uploadUrl: url,
            key,
            publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`
        })
    } catch (error) {
        console.error('Error generating upload URL:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
