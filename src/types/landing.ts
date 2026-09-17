export interface Post {
  id: string;
  image: string;
}

export interface Program {
  id: string;
  ageGroup: string;
  title: string;
  description: string;
  formats: {
    type: string;
    lessonsCount: string;
    duration: string;
    price: string;
    isPopular?: boolean;
  }[];
}

export interface Company {
  id: number;
  title: string;
  description: string;
}

export interface Teacher {
  id: number;
  name: string;
  role: string;
  experience: string;
  specialties: string;
  imgSrc: string;
}
