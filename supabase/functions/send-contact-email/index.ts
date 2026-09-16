import '@supabase/functions-js/edge-runtime.d.ts';

const allowedOrigins = [
  'https://between-testing-platform.vercel.app',
  'http://localhost:5173',
];

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

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const { firstName, lastName, email, message } = await req.json();

      if (!firstName || !lastName || !email || !message) {
        return new Response(
          JSON.stringify({ error: 'All fields are required' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          },
        );
      }

      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

      if (!RESEND_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'RESEND_API_KEY is not configured' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          },
        );
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Contact Form <onboarding@resend.dev>',
          to: ['school.between@gmail.com'],
          reply_to: email,
          subject: `Нове повідомлення від ${firstName} ${lastName}`,
          html: `
            <h2>Нове звернення через форму сайту</h2>
            <p><strong>Ім'я:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr/>
            <p><strong>Повідомлення:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          `,
        }),
      });

      const result = await response.json();

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.ok ? 200 : response.status,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      return new Response(JSON.stringify({ error: message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  },
};
