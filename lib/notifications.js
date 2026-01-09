import { supabaseAdmin } from './supabase'

/**
 * Sends a notification to a user.
 * 
 * @param {Object} params
 * @param {string} params.userId - The ID of the user to notify
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} [params.type='general'] - Notification type (e.g., 'booking')
 * @param {string} [params.referenceId] - ID of the related object (e.g., booking ID)
 * @returns {Promise<Object>} The created notification or error
 */
export async function sendNotification({ userId, title, message, type = 'general', referenceId }) {
    if (!supabaseAdmin) {
        console.warn('Supabase admin client not configured. Notification not sent.')
        return { error: 'Supabase admin client not configured' }
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                reference_id: referenceId
            })
            .select()
            .single()

        if (error) {
            console.error('Error sending notification:', error)
            return { error }
        }

        return { data }
    } catch (error) {
        console.error('Unexpected error sending notification:', error)
        return { error: error.message }
    }
}
