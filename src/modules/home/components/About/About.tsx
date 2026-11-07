import { Link } from 'react-router-dom';
import styles from './About.module.scss';
import { ROUTES } from '../../../../constants/routes';
import { padNumber } from '../../../../utils/padNumber';
import { SectionHeader } from '../../../shared/components/SectionHeader';

const OFFERS = [
  {
    title: 'Навчайтеся',
    description: 'Вивчайте матеріали відповідно до свого рівня.',
  },
  {
    title: 'Практикуйтеся',
    description: 'Проходьте тести й виконуйте тренувальні вправи.',
  },
  {
    title: 'Відстежуйте свій прогрес',
    description:
      'Перевіряйте результати тестування та відстежуйте свій розвиток.',
  },
  {
    title: 'Покращуйте свою англійську',
    description: 'Поступово переходьте на наступний рівень.',
  },
];

export const About = () => {
  return (
    <section className={styles.page}>
      <SectionHeader label='BETWEEN / PLATFORM' title='Що ми пропонуємо' />

      <ol className={styles.list}>
        {OFFERS.map((offer, index) => (
          <li key={offer.title} className={styles.item}>
            <span className={styles.number}>{padNumber(index + 1)}</span>
            <div className={styles.itemContent}>
              <h3 className={styles.itemTitle}>{offer.title}</h3>
              <p className={styles.itemDescription}>{offer.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className={styles.statement}>
        <h3 className={styles.statementTitle}>Вивчайте англійську з BETWEEN</h3>

        <div className={styles.statementContent}>
          <p className={styles.statementText}>
            Платформа BETWEEN допомагає вивчати англійську структуровано,
            зрозуміло й послідовно. Тут ви знайдете навчальні матеріали,
            практичні вправи та тести, які допоможуть розвивати навички й
            перевіряти знання. Просувайтеся крок за кроком і вдосконалюйте
            англійську разом із BETWEEN.
          </p>

          <Link to={ROUTES.aboutSchool} className={styles.link}>
            Про школу
          </Link>
        </div>
      </div>
    </section>
  );
};
