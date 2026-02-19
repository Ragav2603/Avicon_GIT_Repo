import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// This script demonstrates the security vulnerability in the user_roles table policy.
// It attempts to insert a role directly into the user_roles table as an authenticated user.
//
// Vulnerability: The policy "Users can insert their own role" allows any authenticated user
// to insert any role for themselves, bypassing verification.
//
// Expected behavior (VULNERABLE): The insert succeeds.
// Expected behavior (FIXED): The insert fails with a policy violation error.

async function reproduce() {
  console.log('--- Reproduction Script for User Roles Privilege Escalation ---');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Sign up/Sign in a test user
  const email = `test-${Date.now()}@example.com`;
  const password = 'test-password-123';

  console.log(`Creating test user: ${email}`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Failed to create user:', authError.message);
    return;
  }

  const userId = authData.user?.id;
  if (!userId) {
    console.error('User created but no ID returned?');
    return;
  }

  console.log(`User created with ID: ${userId}`);

  // 2. Attempt to exploit: Insert 'airline' role directly
  // This should only be allowed via the verify-role edge function, but the insecure policy permits it directly.
  console.log('Attempting to insert "airline" role directly via client...');

  const { error: insertError } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: 'airline' // Attacker claiming to be an airline manager
    });

  if (insertError) {
    console.log('✅ INSERT FAILED (Secure):', insertError.message);
    console.log('The vulnerability is patched. Users cannot self-assign roles directly.');
  } else {
    console.log('❌ INSERT SUCCEEDED (Vulnerable)!');
    console.log('The user successfully assigned themselves the "airline" role directly.');

    // Verify by fetching
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    console.log('Assigned Role:', roleData?.role);
  }
}

// Run if credentials are provided
if (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY !== 'your-anon-key') {
  reproduce().catch(console.error);
} else {
  console.log('Skipping execution: SUPABASE_ANON_KEY not set.');
  console.log('This script serves as documentation of the vulnerability reproduction steps.');
}
