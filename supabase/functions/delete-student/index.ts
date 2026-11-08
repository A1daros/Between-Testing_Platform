import '@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Called from the admin panel. Deleting an auth user needs the service role
// key, which must never reach the browser. The profile is removed by cascade,
// and results stay without a link to the person (on delete set null). Avatar
// files are removed first: if that fails, the account still exists and the
// admin can retry, so no personal photo is left behind without an owner.

const allowedOrigins = [
  'https://between-testing-platform.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

const AVATAR_BUCKET = 'avatars';
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

export default {
  async fetch(req: Request) {
    const origin = req.headers.get('origin') ?? '';

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin)
        ? origin
        : '',
      'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
    };

    const json = (body: unknown, status: number) =>
      new Response(JSON.stringify(body), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status,
      });

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error('Missing env: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    try {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const token = req.headers
        .get('authorization')
        ?.replace(/^Bearer\s+/i, '');

      if (!token) {
        return json({ error: 'Unauthorized' }, 401);
      }

      const {
        data: { user: caller },
        error: callerError,
      } = await admin.auth.getUser(token);

      if (callerError || !caller) {
        return json({ error: 'Unauthorized' }, 401);
      }

      const { data: callerProfile, error: callerProfileError } = await admin
        .from('profiles')
        .select('role')
        .eq('id', caller.id)
        .maybeSingle();

      if (callerProfileError) {
        throw callerProfileError;
      }

      if (callerProfile?.role !== 'admin') {
        return json({ error: 'Forbidden' }, 403);
      }

      const body = await req.json().catch(() => null);
      const userId = body?.userId;

      if (typeof userId !== 'string' || !UUID_RE.test(userId)) {
        return json({ error: 'Invalid user id' }, 400);
      }

      const { data: target, error: targetError } = await admin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (targetError) {
        throw targetError;
      }

      if (!target) {
        return json({ error: 'Student not found' }, 404);
      }

      if (target.role !== 'student') {
        return json({ error: 'Only students can be deleted' }, 403);
      }

      const { data: files, error: listError } = await admin.storage
        .from(AVATAR_BUCKET)
        .list(userId, { limit: 1000 });

      if (listError) {
        throw listError;
      }

      if (files && files.length > 0) {
        const { error: removeError } = await admin.storage
          .from(AVATAR_BUCKET)
          .remove(files.map((file) => `${userId}/${file.name}`));

        if (removeError) {
          throw removeError;
        }
      }

      const { error: deleteError } = await admin.auth.admin.deleteUser(userId);

      if (deleteError) {
        throw deleteError;
      }

      return json({ ok: true }, 200);
    } catch (error) {
      console.error(error);

      return json({ error: 'Internal error' }, 500);
    }
  },
};
