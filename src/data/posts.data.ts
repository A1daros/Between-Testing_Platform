import type { Post } from '../types/landing';

import post01 from '../assets/posts/post01.webp';
import post02 from '../assets/posts/post02.webp';
import post03 from '../assets/posts/post03.webp';
import post04 from '../assets/posts/post04.webp';
import post05 from '../assets/posts/post05.webp';
import post06 from '../assets/posts/post06.webp';

export const posts: Post[] = [
  {
    id: 'case-intro',
    image: post01,
    alt: '5 case studies from Mira. Кейс 1 з 5: Наталя. Переїхати в Торонто і мовчати на роботі?',
  },
  {
    id: 'point-a',
    image: post02,
    alt: 'Точка А: Наталя опинилася в Канаді. Базова англійська була, але коли справа доходила до реальної роботи та спілкування з колегами — слова вилітали з голови. Хотілося говорити природно, а не звучати як застарілий підручник.',
  },
  {
    id: 'what-mira-did',
    image: post03,
    alt: 'Що зробила Міра?',
  },
  {
    id: 'mira-quote',
    image: post04,
    alt: 'Міра, засновниця школи: «Я повністю прибрала академічні шаблони та занурила нас у чисту практику. На уроках я давала Наталі сучасний розмовний сленг Торонто, ми багато тренували живі діалоги й прокачували саме ті навички, які потрібні їй для роботи щодня.»',
  },
  {
    id: 'point-b',
    image: post05,
    alt: 'Точка Б: Наталя дізналася сотні нових слів, які нарешті почали «спливати» в голові самі. Барʼєр зник — їй стало значно легше та впевненіше комунікувати на роботі щодня.',
  },
  {
    id: 'takeaway',
    image: post06,
    alt: 'Takeaway: мова — це простір між тобою та твоїм новим містом. You belong anywhere.',
  },
];
