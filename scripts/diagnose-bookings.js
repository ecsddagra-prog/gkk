const { Client } = require('pg');

// Connection string from mcp.json
const connectionString = 'postgresql://postgres:Dvvnl%401991@db.xowsvzjvevzpqloniwtf.supabase.co:5432/postgres';

async function diagnoseBookingIssue() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // 1. Check total bookings
        console.log('='.repeat(60));
        console.log('1. CHECKING TOTAL BOOKINGS');
        console.log('='.repeat(60));
        const { rows: totalBookings } = await client.query(`
      SELECT COUNT(*) as total FROM bookings
    `);
        console.log(`Total bookings in database: ${totalBookings[0].total}\n`);

        if (totalBookings[0].total > 0) {
            // 2. Show sample bookings
            console.log('='.repeat(60));
            console.log('2. SAMPLE BOOKINGS');
            console.log('='.repeat(60));
            const { rows: sampleBookings } = await client.query(`
        SELECT 
          id, 
          booking_number,
          user_id,
          provider_id,
          status,
          created_at
        FROM bookings 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
            console.table(sampleBookings);

            // 3. Check RLS policies
            console.log('\n' + '='.repeat(60));
            console.log('3. CHECKING RLS POLICIES ON BOOKINGS TABLE');
            console.log('='.repeat(60));
            const { rows: policies } = await client.query(`
        SELECT 
          policyname,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE tablename = 'bookings'
        ORDER BY policyname
      `);
            console.log(`Found ${policies.length} policies:\n`);
            policies.forEach(p => {
                console.log(`Policy: ${p.policyname}`);
                console.log(`  Command: ${p.cmd}`);
                console.log(`  USING: ${p.qual || 'N/A'}`);
                console.log(`  WITH CHECK: ${p.with_check || 'N/A'}`);
                console.log('');
            });

            // 4. Check if there are any regular users
            console.log('='.repeat(60));
            console.log('4. CHECKING USERS (NON-ADMIN)');
            console.log('='.repeat(60));
            const { rows: users } = await client.query(`
        SELECT 
          id,
          email,
          role,
          full_name
        FROM users 
        WHERE role = 'user'
        LIMIT 5
      `);
            console.log(`Found ${users.length} regular users:\n`);
            console.table(users);

            if (users.length > 0) {
                // 5. Test RLS for first user
                const testUser = users[0];
                console.log('\n' + '='.repeat(60));
                console.log(`5. TESTING RLS FOR USER: ${testUser.email}`);
                console.log('='.repeat(60));

                // Set role to authenticated user
                await client.query(`SET LOCAL ROLE authenticated`);
                await client.query(`SET LOCAL request.jwt.claims TO '{"sub": "${testUser.id}"}'`);

                const { rows: userBookings } = await client.query(`
          SELECT 
            id,
            booking_number,
            user_id,
            status
          FROM bookings
        `);

                console.log(`Bookings visible to user ${testUser.email}: ${userBookings.length}`);
                if (userBookings.length > 0) {
                    console.table(userBookings);
                }

                // Reset role
                await client.query(`RESET ROLE`);
            }

            // 6. Check auth.uid() function
            console.log('\n' + '='.repeat(60));
            console.log('6. CHECKING auth.uid() FUNCTION');
            console.log('='.repeat(60));
            const { rows: authCheck } = await client.query(`
        SELECT 
          proname as function_name,
          pronargs as num_args
        FROM pg_proc 
        WHERE proname = 'uid' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
      `);
            if (authCheck.length > 0) {
                console.log('✅ auth.uid() function exists');
            } else {
                console.log('❌ auth.uid() function NOT FOUND - This is the problem!');
            }

        } else {
            console.log('⚠️  No bookings found in database. The issue is not RLS, but no data exists.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('Stack:', err.stack);
        process.exit(1);
    } finally {
        await client.end();
    }
}

diagnoseBookingIssue();
