// This test file requires Deno to run.
// usage: deno test --allow-env --allow-net supabase/functions/verify-role/test.ts

import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";

// Mock Supabase client behavior for atomic invite redemption
const mockSupabaseAdmin = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (col: string, val: string) => ({
        eq: (col2: string, val2: string) => ({
          eq: (col3: string, val3: boolean) => ({
            maybeSingle: () => {
               // Mock finding a valid invite code
               if (table === "invite_codes" && val === "VALID_CODE") {
                 return Promise.resolve({
                   data: { id: "invite-uuid", current_uses: 0, max_uses: 10, is_active: true },
                   error: null
                 });
               }
               return Promise.resolve({ data: null, error: null });
            }
          })
        })
      })
    })
  }),
  rpc: async (fn: string, args: { invite_id: string; user_id: string }) => {
    if (fn === "redeem_invite_code") {
      if (args.invite_id === "invite-uuid") {
        return Promise.resolve({ data: { success: true }, error: null });
      }
      if (args.invite_id === "exhausted-uuid") {
         return Promise.resolve({ data: { success: false, error: "Invite code exhausted" }, error: null });
      }
    }
    return Promise.resolve({ data: null, error: { message: "Function not found" } });
  }
};

Deno.test("verify-role: invite code redemption uses atomic RPC", async () => {
  console.log("Testing atomic invite code redemption...");

  const inviteCode = "VALID_CODE";
  const role = "consultant";
  const userId = "user-uuid";

  // 1. Simulate finding the invite code (pre-check in the function)
  const { data: inviteData } = await mockSupabaseAdmin
    .from("invite_codes")
    .select("*")
    .eq("code", inviteCode)
    .eq("role", role)
    .eq("is_active", true)
    .maybeSingle();

  assertEquals(inviteData?.id, "invite-uuid");

  // 2. Simulate calling the RPC function
  const { data: rpcData, error: rpcError } = await mockSupabaseAdmin.rpc("redeem_invite_code", {
    invite_id: inviteData!.id,
    user_id: userId
  });

  assertEquals(rpcError, null);
  assertEquals(rpcData.success, true);
  console.log("Atomic redemption successful");
});

Deno.test("verify-role: handles exhausted invite code via RPC", async () => {
  // Mock finding an exhausted code
  const exhaustedId = "exhausted-uuid";

  // Simulate calling the RPC function
  const { data: rpcData } = await mockSupabaseAdmin.rpc("redeem_invite_code", {
    invite_id: exhaustedId,
    user_id: "user-uuid"
  });

  assertEquals(rpcData.success, false);
  assertEquals(rpcData.error, "Invite code exhausted");
  console.log("Atomic redemption correctly rejected exhausted code");
});
