import '@supabase/functions-js/edge-runtime.d.ts';
import { Ratelimit } from 'npm:@upstash/ratelimit';
import { Redis } from 'npm:@upstash/redis';

const allowedOrigins = [
  'https://between-testing-platform.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const REDIS_URL = Deno.env.get('UPSTASH_REDIS_REST_URL');
const REDIS_TOKEN = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

const ratelimit = new Ratelimit({
  redis: new Redis({ url: REDIS_URL, token: REDIS_TOKEN }),
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  prefix: 'contact-us',
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { name: 100, email: 254, message: 5000 };

function escapeHtml(str: string): string {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

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
    const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    if (!RESEND_API_KEY || !REDIS_URL || !REDIS_TOKEN) {
      throw new Error(
        'Missing env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN or RESEND_API_KEY',
      );
    }

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: jsonHeaders,
        status: 405,
      });
    }

    try {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ||
        'unknown';
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);
      const rateHeaders = {
        ...jsonHeaders,
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
      };

      if (!success) {
        return new Response(
          JSON.stringify({
            error: 'Забагато запитів. Спробуйте за кілька хвилин.',
          }),
          { headers: rateHeaders, status: 429 },
        );
      }

      const body = (await req.json().catch(() => null)) ?? {};
      if (str(body.website)) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: rateHeaders,
          status: 200,
        });
      }

      const firstName = str(body.firstName);
      const lastName = str(body.lastName);
      const email = str(body.email);
      const message = str(body.message);

      const valid =
        firstName &&
        lastName &&
        message &&
        firstName.length <= MAX.name &&
        lastName.length <= MAX.name &&
        email.length <= MAX.email &&
        EMAIL_RE.test(email) &&
        message.length <= MAX.message;

      if (!valid) {
        return new Response(JSON.stringify({ error: 'Invalid input' }), {
          headers: rateHeaders,
          status: 400,
        });
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Contact Form <onboarding@resend.dev>',
          to: ['toliklutai@gmail.com'],
          reply_to: email,
          subject: `Нове повідомлення від ${firstName} ${lastName}`,
          html: `
            <h2>Нове звернення через форму сайту</h2>
            <p><strong>Ім'я:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <hr/>
            <p><strong>Повідомлення:</strong></p>
            <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          `,
        }),
      });

      if (!response.ok) {
        console.error('Resend error', response.status, await response.text());
        return new Response(
          JSON.stringify({ error: 'Не вдалося надіслати лист' }),
          {
            headers: rateHeaders,
            status: 502,
          },
        );
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: rateHeaders,
        status: 200,
      });
    } catch (error) {
      console.error(error);

      return new Response(JSON.stringify({ error: 'Internal error' }), {
        headers: jsonHeaders,
        status: 500,
      });
    }
  },
};
