import styles from './LegalDocument.module.scss';
import type { LegalSection } from '../../../../types/landing';
import { LEGAL_UPDATED_AT } from '../../../../data/legal.data';

type LegalDocumentProps = {
  label: string;
  title: string;
  sections: LegalSection[];
};

export const LegalDocument = ({ label, title, sections }: LegalDocumentProps) => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <article className={styles.article}>
          <header className={styles.header}>
            <span className={styles.label}>{label}</span>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.updatedAt}>Редакція від {LEGAL_UPDATED_AT}</p>
          </header>

          {sections.map((section, index) => (
            <section key={section.title} className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {index + 1}. {section.title}
              </h2>

              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
};
