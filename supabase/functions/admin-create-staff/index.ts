import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.116.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const specialtyOptions = new Set(["weight", "hair", "sex"]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanName(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Authentication required." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: "Server configuration is incomplete." }, 500);

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerData, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !callerData.user) return json({ error: "Your admin session is no longer valid." }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", callerData.user.id)
    .single();

  if (profileError || callerProfile?.role !== "admin") {
    return json({ error: "Only Suga.Health administrators can create staff accounts." }, 403);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const role = payload.role === "pharmacist" ? "pharmacist" : payload.role === "doctor" ? "doctor" : null;
  const name = cleanName(payload.name);
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const age = Number(payload.age);
  const requestedSpecialties = Array.isArray(payload.specialties)
    ? [...new Set(payload.specialties.map(String).filter((item) => specialtyOptions.has(item)))]
    : [];

  if (!role) return json({ error: "Choose a valid staff role." }, 400);
  if (name.length < 2 || name.length > 100) return json({ error: "Enter a valid name." }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Enter a valid email address." }, 400);
  if (!Number.isInteger(age) || age < 18 || age > 100) return json({ error: "Age must be between 18 and 100." }, 400);
  if (password.length < 8) return json({ error: "Password must contain at least 8 characters." }, 400);
  if (role === "doctor" && requestedSpecialties.length === 0) {
    return json({ error: "Select at least one treatment field for the doctor." }, 400);
  }

  const nameParts = name.split(" ");
  const firstName = nameParts.shift() || name;
  const lastName = nameParts.join(" ") || null;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, first_name: firstName, last_name: lastName },
    app_metadata: { role },
  });

  if (createError || !created.user) {
    const duplicate = createError?.message?.toLowerCase().includes("already");
    return json(
      { error: duplicate ? "An account already exists with this email address." : (createError?.message || "Unable to create the staff account.") },
      duplicate ? 409 : 400,
    );
  }

  const userId = created.user.id;

  const { error: updateProfileError } = await adminClient
    .from("profiles")
    .update({ email, display_name: name, first_name: firstName, last_name: lastName, role })
    .eq("id", userId);

  if (updateProfileError) {
    await adminClient.auth.admin.deleteUser(userId);
    return json({ error: "The login was created but the staff profile could not be prepared. No account was kept." }, 500);
  }

  const specialties = role === "doctor" ? requestedSpecialties : [];
  const { error: staffError } = await adminClient
    .from("staff_profiles")
    .upsert({
      id: userId,
      email,
      role,
      active: true,
      onboarding_status: "completed",
      first_name: firstName,
      last_name: lastName,
      initials: initials || null,
      age,
      specialties,
    }, { onConflict: "id" });

  if (staffError) {
    await adminClient.auth.admin.deleteUser(userId);
    return json({ error: "The login was created but the staff profile could not be saved. No account was kept." }, 500);
  }

  return json({
    staff: {
      id: userId,
      email,
      role,
      active: true,
      onboarding_status: "completed",
      first_name: firstName,
      last_name: lastName,
      age,
      specialties,
      created_at: created.user.created_at,
    },
  }, 201);
});
