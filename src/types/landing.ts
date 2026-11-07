export type Post = {
  id: string;
  image: string;
  alt: string;
};

export type Company = {
  id: number;
  title: string;
  description: string;
};

export type LegalSection = {
  title: string;
  paragraphs: string[];
};
