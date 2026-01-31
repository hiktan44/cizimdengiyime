
import { createClient } from '@supabase/supabase-js';

// User provided credentials from chat
const supabaseUrl = 'https://supabase-fasheone.apps.seymata.com';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // User MUST provide this environment variable!

if (!supabaseKey) {
    console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is required.');
    console.log('Please run the script like this:');
    console.log('SUPABASE_SERVICE_KEY=your_service_role_key node scripts/investigate_user.js');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateUser(email) {
    console.log(`🔍 Investigating user: ${email}...`);

    // 1. Get User Details
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error('❌ Error listing users:', userError.message);
        return;
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
        console.log('❌ User not found in Auth system.');
        // Check partial match
        const similar = users.users.filter(u => u.email && u.email.includes('giyim'));
        if (similar.length > 0) {
            console.log('💡 Did you mean one of these users?');
            similar.forEach(u => console.log(`   - ${u.email} (ID: ${u.id})`));
        }
        return;
    }

    console.log('✅ User Found:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Created At: ${user.created_at}`);
    console.log(`   - Last Sign In: ${user.last_sign_in_at}`);

    // 2. Get Profile Data
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('⚠️ Error fetching profile:', profileError.message);
    } else {
        console.log('✅ Profile Found:');
        console.log(`   - Credits: ${profile.credits}`);
        console.log(`   - Updated At: ${profile.updated_at}`);
    }

    // 3. Get Recent Generations (Today)
    // Calculate start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    console.log(`🔍 Checking generations since ${todayISO}...`);

    const { data: generations, error: genError } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', todayISO)
        .order('created_at', { ascending: false });

    if (genError) {
        console.error('❌ Error fetching generations:', genError.message);
        return;
    }

    if (generations && generations.length > 0) {
        console.log(`✅ Found ${generations.length} generations today:`);
        generations.forEach(g => {
            console.log(`   - [${g.created_at}] Type: ${g.type}, Credits: ${g.credits_used}`);
            console.log(`     Output: ${g.output_image_url ? 'Image URL OK' : 'No Image'}`);
            if (g.error) console.log(`     Error: ${g.error}`);
        });
    } else {
        console.log('❌ No generations found for today.');

        // Check older generations just in case
        const runResult = await supabase
            .from('generations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (runResult.data && runResult.data.length > 0) {
            console.log(`💡 Last generation was at: ${runResult.data[0].created_at}`);
        } else {
            console.log('💡 This user has NEVER generated anything.');
        }
    }

}

investigateUser('smile.giyim.ai@gmail.com');
