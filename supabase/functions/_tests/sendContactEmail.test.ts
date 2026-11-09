// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../send-contact-email/index.ts';
import { limit } from './stubs/ratelimit';

vi.hoisted(() => {
  const env: Record<string, string> = {
    RESEND_API_KEY: 'resend-key',
    UPSTASH_REDIS_REST_URL: 'http://redis.test',
    UPSTASH_REDIS_REST_TOKEN: 'redis-token',
    CONTACT_TO_EMAIL: 'school@example.test',
  };

  Object.assign(globalThis, { Deno: { env: { get: (key: string) => env[key] } } });
});

const ORIGIN = 'https://between-testing-platform.vercel.app';
const fetchMock = vi.fn();

const body = {
  firstName: 'Ivan',
  lastName: 'Koval',
  email: 'ivan@example.test',
  message: 'Hello',
  website: '',
};

const send = (payload: unknown = body, origin = ORIGIN) =>
  worker.fetch(
    new Request('http://function.test', {
      method: 'POST',
      headers: { origin, 'x-forwarded-for': '1.1.1.1, 2.2.2.2' },
      body: JSON.stringify(payload),
    }),
  );

describe('send-contact-email', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    limit.mockResolvedValue({ success: true, limit: 5, reset: 0, remaining: 4 });
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  it('allows CORS only for known origins', async () => {
    expect(
      (await send()).headers.get('Access-Control-Allow-Origin'),
    ).toBe(ORIGIN);
    expect(
      (await send(body, 'https://evil.test')).headers.get(
        'Access-Control-Allow-Origin',
      ),
    ).toBe('');
  });

  it('accepts only POST', async () => {
    const response = await worker.fetch(
      new Request('http://function.test', { method: 'GET' }),
    );

    expect(response.status).toBe(405);
  });

  it('limits by the last forwarded address', async () => {
    await send();

    expect(limit).toHaveBeenCalledWith('2.2.2.2');
  });

  it('stops at the rate limit before sending', async () => {
    limit.mockResolvedValue({ success: false, limit: 5, reset: 0, remaining: 0 });

    const response = await send();

    expect(response.status).toBe(429);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('pretends success for a filled honeypot', async () => {
    const response = await send({ ...body, website: 'spam.example' });

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ['a missing name', { firstName: ' ' }],
    ['a bad email', { email: 'not-an-email' }],
    ['an empty message', { message: '' }],
    ['a long name', { firstName: 'x'.repeat(101) }],
    ['a long message', { message: 'x'.repeat(5001) }],
  ])('refuses %s', async (_name, fields) => {
    const response = await send({ ...body, ...fields });

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the message to the school with a reply address', async () => {
    const response = await send();
    const email = JSON.parse(fetchMock.mock.calls[0][1].body);

    expect(response.status).toBe(200);
    expect(email.to).toEqual(['school@example.test']);
    expect(email.reply_to).toBe('ivan@example.test');
  });

  it('escapes user text in the email body', async () => {
    await send({ ...body, message: '<img src=x onerror=alert(1)>' });

    const email = JSON.parse(fetchMock.mock.calls[0][1].body);

    expect(email.html).not.toContain('<img');
    expect(email.html).toContain('&lt;img');
  });

  it('reports a failed send', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));

    expect((await send()).status).toBe(502);
  });

  it('answers with a Ukrainian error when something breaks', async () => {
    limit.mockRejectedValue(new Error('redis down'));

    const response = await send();

    expect(response.status).toBe(500);
    expect((await response.json()).error).toBe(
      'Сталася помилка. Спробуйте ще раз пізніше.',
    );
  });
});
