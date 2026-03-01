import { createClient } from '@supabase/supabase-js';

async function test() {
  const supabase = createClient('https://example.supabase.co', 'dummy');
  const res = await supabase.storage.from('test').createSignedUrls(['a', 'b'], 60);
  console.log(res);
}
test();
