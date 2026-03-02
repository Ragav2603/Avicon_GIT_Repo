import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://example.supabase.co';
const supabaseKey = 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log(typeof supabase.storage.from('test').createSignedUrls);
