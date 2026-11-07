import styles from './AdminLayout.module.scss';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ADMIN_ROUTES } from '../../../constants/routes';
import { getAdminPath } from '../../../utils/getAdminPath';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { useEscapeKey } from '../../../hooks/useEscapeKey';

const NAV_ITEMS = [
  { route: ADMIN_ROUTES.overview, label: 'Огляд' },
  { route: ADMIN_ROUTES.tests, label: 'Тести' },
  { route: ADMIN_ROUTES.results, label: 'Результати' },
  { route: ADMIN_ROUTES.students, label: 'Учні' },
];

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `${styles.link} ${isActive ? styles.isActive : ''}`;

export const AdminLayout = () => {
  usePageMeta({ title: 'Адмінка', noindex: true });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  useEscapeKey(isMenuOpen, closeMenu);

  return (
    <div className={styles.wrapper}>
      <div className={styles.mobileHeader}>
        <button
          type='button'
          className={styles.modalBtn}
          onClick={() => setIsMenuOpen(true)}
          aria-label='Відкрити меню'
          aria-expanded={isMenuOpen}
          aria-controls='admin-sidebar'
        >
          <img src='/img/icons/menu.svg' alt='' />
        </button>
      </div>

      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.overlayVisible : ''}`}
        onClick={closeMenu}
      />

      <aside
        id='admin-sidebar'
        className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ''}`}
      >
        {isMenuOpen && (
          <button
            type='button'
            className={styles.modalBtn}
            onClick={closeMenu}
            aria-label='Закрити меню'
          >
            <img src='/img/icons/close.svg' alt='' />
          </button>
        )}

        <nav className={styles.nav} aria-label='Розділи адмінки'>
          {NAV_ITEMS.map(({ route, label }) => (
            <NavLink
              key={route}
              to={getAdminPath(route)}
              className={getLinkClassName}
              onClick={closeMenu}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.mainbar}>
        <Outlet />
      </div>
    </div>
  );
};
