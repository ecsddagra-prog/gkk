import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { id } = req.query
    const { status, changed_by } = req.body

    if (!id || !status) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        // Get auth token from request
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' })
        }

        const token = authHeader.replace('Bearer ', '')

        // Verify the user
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // First, get the booking to check permissions
        const { data: existingBooking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('*, provider:providers!bookings_provider_id_fkey(user_id)')
            .eq('id', id)
            .single()

        if (fetchError || !existingBooking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        // Check if user is either the customer or the assigned provider
        const isCustomer = existingBooking.user_id === user.id
        const isAssignedProvider = existingBooking.provider?.user_id === user.id

        // Check if user is a registered provider (for accepting unassigned bookings)
        const { data: requestingProvider } = await supabaseAdmin
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        const isRegisteredProvider = !!requestingProvider

        // Allow if:
        // 1. Is Customer
        // 2. Is Assigned Provider
        // 3. Is Registered Provider AND Booking is Unassigned AND Status is 'confirmed' (Accepting)
        const canAcceptUnassigned = isRegisteredProvider && !existingBooking.provider_id && status === 'confirmed'

        if (!isCustomer && !isAssignedProvider && !canAcceptUnassigned) {
            return res.status(403).json({ error: 'You do not have permission to update this booking' })
        }

        // 1. Update booking status
        const updateData = { status }

        // If accepting an unassigned booking, assign it to this provider
        if (canAcceptUnassigned) {
            updateData.provider_id = requestingProvider.id
        }

        if (req.body.final_price) {
            updateData.final_price = req.body.final_price
        }
        if (req.body.payment_method) {
            updateData.payment_method = req.body.payment_method
            updateData.payment_status = 'paid'
        }

        const { data: booking, error: updateError } = await supabaseAdmin
            .from('bookings')
            .update(updateData)
            .eq('id', id)
            .select('*, user:users(id, full_name), service:services(name)')
            .single()

        if (updateError) throw updateError

        // 2. Record history (optional - won't fail if table doesn't exist)
        try {
            await supabaseAdmin
                .from('booking_status_history')
                .insert({
                    booking_id: id,
                    status,
                    changed_by: changed_by || null
                })
        } catch (historyError) {
            console.warn('Could not record status history:', historyError.message)
        }

        // 3. Send notification to user
        if (booking.user_id) {
            let message = `Your booking status has been updated to ${status}`

            switch (status) {
                case 'confirmed':
                    message = 'Your booking has been accepted by the provider!'
                    break
                case 'on_way':
                    message = 'The provider is on the way to your location.'
                    break
                case 'in_progress':
                    message = 'The provider has started the work.'
                    break
                case 'completed':
                    message = 'Your booking is completed! Please rate your experience.'
                    break
                case 'cancelled':
                    message = 'Your booking has been cancelled.'
                    break
            }

            await supabaseAdmin
                .from('notifications')
                .insert({
                    user_id: booking.user_id,
                    title: 'Booking Update',
                    message,
                    type: 'booking',
                    reference_id: id
                })
        }

        return res.status(200).json({ success: true, booking })
    } catch (error) {
        console.error('Error updating status:', error)
        return res.status(500).json({ error: error.message })
    }
}
