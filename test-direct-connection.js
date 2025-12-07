const { Client } = require('pg');

// Using port 6543 (Supavisor Transaction Pooler) which supports IPv4
const connectionString = "postgresql://postgres.mugliulilcwmrgxepxcr:Dvvnl%401991@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

// Note: For poolers, the user often needs to be 'postgres.projectref' or similar, 
// but Supabase usually provides a specific connection string.
// Let's try the standard pooler format first if the direct one fails.
// Actually, let's try the same host but port 6543 first, as Supabase often aliases it.
// If that fails, we might need the specific pooler host.

// Let's try the direct host with port 6543 first, sometimes that works if it's just a port block? 
// No, usually pooler has a different DNS or same DNS.
// Supabase documentation says: db.project.supabase.co is the direct connection.
// aws-0-[region].pooler.supabase.com is the pooler.

// Let's try to construct the pooler URL. 
// Project ref is: mugliulilcwmrgxepxcr
// Region seems to be ap-south-1 (Mumbai) based on latency or just guessing? 
// Wait, I don't know the region. 
// But often `db.mugliulilcwmrgxepxcr.supabase.co` resolves to the direct IP.

// Let's try to use the SAME host but port 5432 again with a longer timeout, 
// AND try port 6543 on the same host (unlikely to work if it's direct only).

// BETTER STRATEGY:
// The user provided: postgresql://postgres:Dvvnl%401991@db.mugliulilcwmrgxepxcr.supabase.co:5432/postgres
// This is the DIRECT connection.

// I will try to use the Session Pooler (port 5432) if available, or Transaction Pooler (port 6543).
// Since I don't know the pooler URL, I will try to guess it or just test port 5432 again.

// Actually, let's try to ping the host first to see if it resolves?
// I can't ping.

// Let's try to use the "Supavisor" connection string format if I can guess it.
// Usually: postgres://[user].[project]:[pass]@[pooler-host]:6543/[db]
// But I don't have the pooler host.

// Let's stick to the original host but maybe check if there are other issues.
// Wait, the user said "enable Direct connection".
// Maybe they mean they want me to configure the MCP to use it? I already did.
// And it failed.

// Let's try to run the test again, maybe it was a fluke?
// And also try to use `ssl: { rejectUnauthorized: false }` which is already there.

// Let's try to debug the error code.
// The previous error was: "Connection failed: ... 5432 ..." (timeout usually).

// Let's try to use the IPv4 workaround if possible?
// No, that requires Supabase addon.

// Let's try to see if we can find the region from the project URL?
// `db.mugliulilcwmrgxepxcr.supabase.co`
// I can try to resolve it using a command? `nslookup`?

const client = new Client({
    connectionString: "postgresql://postgres:Dvvnl%401991@db.mugliulilcwmrgxepxcr.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 // 5 seconds timeout
});

async function test() {
    console.log('Testing connection to port 5432...');
    try {
        await client.connect();
        console.log('Connected successfully!');
        await client.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
        if (err.message.includes('timeout')) {
            console.log('Hint: This might be a firewall issue or IPv6 issue.');
        }
    }
}

test();
