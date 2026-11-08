import styles from './DeleteStudent.module.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ROUTES } from '../../../../../constants/routes';
import { deleteStudent } from '../../../../../services/profile';
import { getAdminPath } from '../../../../../utils/getAdminPath';
import { Alert } from '../../../../shared/components/Alert';
import { Modal } from '../../../../shared/components/Modal';

type DeleteStudentProps = {
  studentId: string;
  studentName: string;
};

export const DeleteStudent = ({
  studentId,
  studentName,
}: DeleteStudentProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const navigate = useNavigate();

  const handleClose = () => {
    if (!isDeleting) {
      setIsConfirmOpen(false);
    }
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteStudent(studentId);
      navigate(getAdminPath(ADMIN_ROUTES.students), { replace: true });
    } catch (error) {
      console.error('Failed to delete student:', error);
      setDeleteError('Не вдалося видалити акаунт. Спробуйте ще раз.');
      setIsDeleting(false);
    }
  };

  return (
    <section className={styles.section}>
      <button
        type='button'
        className={styles.button}
        onClick={() => {
          setDeleteError('');
          setIsConfirmOpen(true);
        }}
      >
        Видалити акаунт учня
      </button>

      {isConfirmOpen && (
        <Modal labelledBy='delete-student-title' onClose={handleClose}>
          <div className={styles.confirmBox}>
            <h3 id='delete-student-title' className={styles.title}>
              Видалити акаунт: {studentName}?
            </h3>

            <p className={styles.description}>
              Акаунт, профіль, фото й незавершені спроби буде видалено назавжди.
              Результати тестів залишаться у статистиці школи, але без звʼязку з
              учнем. Цю дію не можна скасувати.
            </p>

            {deleteError && <Alert>{deleteError}</Alert>}

            <div className={styles.buttons}>
              <button
                type='button'
                className={styles.confirmButton}
                disabled={isDeleting}
                onClick={handleConfirm}
              >
                {isDeleting ? 'Видалення...' : 'Так, видалити'}
              </button>

              <button
                type='button'
                className={styles.button}
                disabled={isDeleting}
                onClick={handleClose}
              >
                Скасувати
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
