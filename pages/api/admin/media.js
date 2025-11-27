import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../../../lib/r2'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
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

        if (profile?.role !== 'superadmin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const command = new ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            Prefix: 'uploads/', // Optional: only list files in uploads folder
        })

        const response = await r2Client.send(command)

        const files = response.Contents?.map(file => ({
            key: file.Key,
            lastModified: file.LastModified,
            size: file.Size,
            url: `${R2_PUBLIC_URL}/${file.Key}`
        })) || []

        // Sort by newest first
        files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))

        res.status(200).json({ files })
    } catch (error) {
        console.error('Error listing files:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
