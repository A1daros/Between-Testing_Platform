import type { Teacher } from '../types/landing';
import mira from '../assets/teachers/mira.webp';
import vita from '../assets/teachers/vita.webp';

export const teachers: Teacher[] = [
  {
    id: 1,
    name: 'Mira',
    role: 'Founding Teacher & Head of Education',
    experience: '4+ років досвіду',
    specialties: 'НМТ / Підготовка до вступу / Teens',
    grade: '',
    imgSrc: mira,
  },
  {
    id: 2,
    name: 'Vita',
    role: 'Senior English Tutor',
    experience: '3+ роки досвіду',
    specialties: 'Kids & Junior groups / Speaking Clubs',
    grade: '',
    imgSrc: vita,
  },
];
