// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../delete-student/index.ts';
import { createClient } from './stubs/supabaseJs';

vi.hoisted(() => {
  const env: Record<string, string> = {
    SUPABASE_URL: 'http://supabase.test',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
  };

  Object.assign(globalThis, { Deno: { env: { get: (key: string) => env[key] } } });
});

const STUDENT_ID = 'bbbbbbbb-0000-4000-8000-000000000001';
const ORIGIN = 'https://between-testing-platform.vercel.app';

const getUser = vi.fn();
const maybeSingle = vi.fn();
const list = vi.fn();
const remove = vi.fn();
const deleteUser = vi.fn();

const request = (body: unknown = { userId: STUDENT_ID }, token = 'token') =>
  new Request('http://function.test', {
    method: 'POST',
    headers: {
      origin: ORIGIN,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

describe('delete-student', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    createClient.mockReturnValue({
      auth: { getUser, admin: { deleteUser } },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
      storage: { from: () => ({ list, remove }) },
    });

    getUser.mockResolvedValue({ data: { user: { id: 'admin' } }, error: null });
    maybeSingle
      .mockResolvedValueOnce({ data: { role: 'admin' }, error: null })
      .mockResolvedValueOnce({ data: { role: 'student' }, error: null });
    list.mockResolvedValue({ data: [{ name: 'a.png' }], error: null });
    remove.mockResolvedValue({ error: null });
    deleteUser.mockResolvedValue({ error: null });
  });

  it('answers CORS only for known origins', async () => {
    const options = (origin: string) =>
      worker.fetch(
        new Request('http://function.test', {
          method: 'OPTIONS',
          headers: { origin },
        }),
      );

    expect(
      (await options(ORIGIN)).headers.get('Access-Control-Allow-Origin'),
    ).toBe(ORIGIN);
    expect(
      (await options('https://evil.test')).headers.get(
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

  it('refuses a request without a token', async () => {
    const response = await worker.fetch(request(undefined, ''));

    expect(response.status).toBe(401);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('refuses an invalid token', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: new Error('bad') });

    const response = await worker.fetch(request());

    expect(response.status).toBe(401);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('refuses a caller who is not an admin', async () => {
    maybeSingle.mockReset();
    maybeSingle.mockResolvedValue({ data: { role: 'student' }, error: null });

    const response = await worker.fetch(request());

    expect(response.status).toBe(403);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it.each([{ userId: 'not-a-uuid' }, { userId: 5 }, {}])(
    'refuses the invalid body %j',
    async (body) => {
      const response = await worker.fetch(request(body));

      expect(response.status).toBe(400);
      expect(deleteUser).not.toHaveBeenCalled();
    },
  );

  it('reports a missing student', async () => {
    maybeSingle.mockReset();
    maybeSingle
      .mockResolvedValueOnce({ data: { role: 'admin' }, error: null })
      .mockResolvedValueOnce({ data: null, error: null });

    const response = await worker.fetch(request());

    expect(response.status).toBe(404);
  });

  it('never deletes another admin', async () => {
    maybeSingle.mockReset();
    maybeSingle.mockResolvedValue({ data: { role: 'admin' }, error: null });

    const response = await worker.fetch(request());

    expect(response.status).toBe(403);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('removes the avatar, then the account', async () => {
    const response = await worker.fetch(request());

    expect(response.status).toBe(200);
    expect(remove).toHaveBeenCalledWith([`${STUDENT_ID}/a.png`]);
    expect(deleteUser).toHaveBeenCalledWith(STUDENT_ID);
    expect(remove.mock.invocationCallOrder[0]).toBeLessThan(
      deleteUser.mock.invocationCallOrder[0],
    );
  });

  it('skips storage when there is no avatar', async () => {
    list.mockResolvedValue({ data: [], error: null });

    const response = await worker.fetch(request());

    expect(response.status).toBe(200);
    expect(remove).not.toHaveBeenCalled();
  });

  it('keeps the account when the avatar cannot be removed', async () => {
    remove.mockResolvedValue({ error: new Error('storage') });

    const response = await worker.fetch(request());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Internal error' });
    expect(deleteUser).not.toHaveBeenCalled();
  });
});
