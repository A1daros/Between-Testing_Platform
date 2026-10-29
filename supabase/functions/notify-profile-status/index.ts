import '@supabase/functions-js/edge-runtime.d.ts';

// Called by a Database Webhook on public.profiles (INSERT, UPDATE):
// - a new pending profile notifies the admin about a new application;
// - a status change to approved/rejected notifies the student.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET');
const CONTACT_TO_EMAIL = Deno.env.get('CONTACT_TO_EMAIL');
const SITE_URL = Deno.env.get('SITE_URL');
const NOTIFY_FROM_EMAIL =
  Deno.env.get('NOTIFY_FROM_EMAIL') ?? 'BETWEEN <onboarding@resend.dev>';

type ProfileRecord = {
  id: string;
  email: string | null;
  display_name: string | null;
  status: string | null;
};

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: ProfileRecord | null;
  old_record: ProfileRecord | null;
};

type Email = {
  to: string;
  subject: string;
  html: string;
};

function escapeHtml(str: string): string {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });

function buildEmail(payload: WebhookPayload): Email | null {
  const { type, record, old_record } = payload;

  if (!record) {
    return null;
  }

  const name = escapeHtml(record.display_name ?? record.email ?? '');
  const loginUrl = `${SITE_URL}/login`;

  if (type === 'INSERT' && record.status === 'pending') {
    if (!CONTACT_TO_EMAIL) {
      return null;
    }

    return {
      to: CONTACT_TO_EMAIL,
      subject: `Нова заявка на реєстрацію: ${record.display_name ?? record.email}`,
      html: `
        <h2>Нова заявка на реєстрацію</h2>
        <p><strong>Ім'я:</strong> ${name}</p>
        <p><strong>Email:</strong> ${escapeHtml(record.email ?? '')}</p>
        <p>Схвалити або відхилити заявку можна в адмінці, розділ «Учні».</p>
      `,
    };
  }

  if (
    type !== 'UPDATE' ||
    !record.email ||
    record.status === old_record?.status
  ) {
    return null;
  }

  if (record.status === 'approved') {
    return {
      to: record.email,
      subject: 'Ваш акаунт BETWEEN схвалено',
      html: `
        <h2>Вітаємо, ${name}!</h2>
        <p>Ваш акаунт схвалено. Тепер вам доступні тести та результати.</p>
        <p><a href="${loginUrl}">Увійти на сайт</a></p>
      `,
    };
  }

  if (record.status === 'rejected') {
    return {
      to: record.email,
      subject: 'Заявку на реєстрацію в BETWEEN відхилено',
      html: `
        <h2>Вітаємо, ${name}.</h2>
        <p>На жаль, вашу заявку на реєстрацію відхилено.</p>
        <p>Якщо це помилка, зв'яжіться зі школою.</p>
      `,
    };
  }

  return null;
}

export default {
  async fetch(req: Request) {
    if (!RESEND_API_KEY || !WEBHOOK_SECRET || !SITE_URL) {
      throw new Error('Missing env: RESEND_API_KEY, WEBHOOK_SECRET or SITE_URL');
    }

    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
      return json({ error: 'Unauthorized' }, 401);
    }

    try {
      const payload = (await req.json()) as WebhookPayload;

      if (payload.table !== 'profiles') {
        return json({ ok: true, skipped: true }, 200);
      }

      const email = buildEmail(payload);

      if (!email) {
        return json({ ok: true, skipped: true }, 200);
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: NOTIFY_FROM_EMAIL,
          to: [email.to],
          subject: email.subject,
          html: email.html,
        }),
      });

      if (!response.ok) {
        console.error('Resend error', response.status, await response.text());
        return json({ error: 'Failed to send email' }, 502);
      }

      return json({ ok: true }, 200);
    } catch (error) {
      console.error(error);

      return json({ error: 'Internal error' }, 500);
    }
  },
};
