// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../notify-profile-status/index.ts';

vi.hoisted(() => {
  const env: Record<string, string> = {
    RESEND_API_KEY: 'resend-key',
    WEBHOOK_SECRET: 'secret',
    CONTACT_TO_EMAIL: 'school@example.test',
    SITE_URL: 'https://site.test',
  };

  Object.assign(globalThis, { Deno: { env: { get: (key: string) => env[key] } } });
});

const fetchMock = vi.fn();

const record = (fields: Record<string, unknown> = {}) => ({
  id: 'user',
  email: 'student@example.test',
  display_name: 'Student',
  status: 'pending',
  email_confirmed_at: null,
  ...fields,
});

const send = (payload: unknown, secret = 'secret') =>
  worker.fetch(
    new Request('http://function.test', {
      method: 'POST',
      headers: { 'x-webhook-secret': secret },
      body: JSON.stringify(payload),
    }),
  );

const sentEmail = () => JSON.parse(fetchMock.mock.calls[0][1].body);

describe('notify-profile-status', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  it('accepts only POST', async () => {
    const response = await worker.fetch(
      new Request('http://function.test', { method: 'GET' }),
    );

    expect(response.status).toBe(405);
  });

  it('refuses a wrong secret', async () => {
    const response = await send({}, 'wrong');

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ignores other tables', async () => {
    const response = await send({ type: 'UPDATE', table: 'results', record: record() });

    expect(await response.json()).toEqual({ ok: true, skipped: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stays silent until the email is confirmed', async () => {
    await send({
      type: 'INSERT',
      table: 'profiles',
      record: record(),
      old_record: null,
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('tells the school once the applicant confirms the email', async () => {
    await send({
      type: 'UPDATE',
      table: 'profiles',
      record: record({ email_confirmed_at: '2026-11-09' }),
      old_record: record(),
    });

    expect(sentEmail().to).toEqual(['school@example.test']);
    expect(sentEmail().subject).toContain('Нова заявка');
  });

  it('does not repeat the notice after the confirmation', async () => {
    await send({
      type: 'UPDATE',
      table: 'profiles',
      record: record({ email_confirmed_at: '2026-11-09', display_name: 'New' }),
      old_record: record({ email_confirmed_at: '2026-11-09' }),
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('tells the student about an approval with a login link', async () => {
    await send({
      type: 'UPDATE',
      table: 'profiles',
      record: record({ status: 'approved', email_confirmed_at: '2026-11-09' }),
      old_record: record({ email_confirmed_at: '2026-11-09' }),
    });

    expect(sentEmail().to).toEqual(['student@example.test']);
    expect(sentEmail().html).toContain('https://site.test/login');
  });

  it('tells the student about a rejection', async () => {
    await send({
      type: 'UPDATE',
      table: 'profiles',
      record: record({ status: 'rejected' }),
      old_record: record(),
    });

    expect(sentEmail().to).toEqual(['student@example.test']);
    expect(sentEmail().subject).toContain('відхилено');
  });

  it('sends nothing when the status did not change', async () => {
    await send({
      type: 'UPDATE',
      table: 'profiles',
      record: record({ status: 'approved', display_name: 'Renamed' }),
      old_record: record({ status: 'approved' }),
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('escapes the name in the email body', async () => {
    await send({
      type: 'UPDATE',
      table: 'profiles',
      record: record({
        status: 'approved',
        display_name: '<script>alert(1)</script>',
      }),
      old_record: record(),
    });

    expect(sentEmail().html).not.toContain('<script>');
    expect(sentEmail().html).toContain('&lt;script&gt;');
  });

  it('reports a failed send', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));

    const response = await send({
      type: 'UPDATE',
      table: 'profiles',
      record: record({ status: 'rejected' }),
      old_record: record(),
    });

    expect(response.status).toBe(502);
  });
});
