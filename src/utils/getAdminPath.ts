import { generatePath } from 'react-router-dom';
import { ADMIN_ROUTES, ROUTES } from '../constants/routes';

type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];

export const getAdminPath = (
  route: AdminRoute,
  params: Record<string, string | number> = {},
): string =>
  generatePath(
    `${ROUTES.admin}/${route}`,
    Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ),
  );
