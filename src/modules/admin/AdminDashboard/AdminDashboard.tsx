import { useState } from 'react';
import styles from './AdminDashboard.module.scss';
import { NavLink, Outlet } from 'react-router-dom';

export const AdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen((isOpen) => !isOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const linkIsActive = ({ isActive }: { isActive: boolean }) =>
    `${styles.link} ${isActive ? styles.isActive : ''}`.trim();

  const sidebarClassName = [styles.sidebar, isMenuOpen && styles.sidebarOpen]
    .filter(Boolean)
    .join(' ');

  const overlayClassName = [styles.overlay, isMenuOpen && styles.overlayVisible]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      <div className={styles.mobileHeader}>
        <button
          className={styles.modalBtn}
          onClick={openMenu}
          aria-label='Відкрити меню'
        >
          <img src='/img/icons/menu.svg' alt='' />
        </button>
      </div>

      <div className={overlayClassName} onClick={closeMenu} />

      <aside className={sidebarClassName}>
        {isMenuOpen && (
          <button
            className={styles.modalBtn}
            onClick={closeMenu}
            aria-label='Закрити меню'
          >
            <img src='/img/icons/close.svg' alt='' />
          </button>
        )}

        <nav className={styles.nav}>
          <NavLink
            to={`/admin/overview`}
            className={linkIsActive}
            onClick={closeMenu}
          >
            Огляд
          </NavLink>
          <NavLink
            to={`/admin/tests`}
            className={linkIsActive}
            onClick={closeMenu}
          >
            Тести
          </NavLink>
          <NavLink
            to={`/admin/results`}
            className={linkIsActive}
            onClick={closeMenu}
          >
            Результати
          </NavLink>
          <NavLink
            to={`/admin/students`}
            className={linkIsActive}
            onClick={closeMenu}
          >
            Учні
          </NavLink>
        </nav>
      </aside>

      <div className={styles.mainbar}>
        <Outlet />
      </div>
    </div>
  );
};
