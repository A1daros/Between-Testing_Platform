import { useCallback, useEffect, useState } from 'react';
import styles from './PictureSlider.module.scss';
import { BANNERS } from '../../../../data/banners.data';
import { padNumber } from '../../../../utils/padNumber';

const AUTOPLAY_DELAY = 6000;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const PictureSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = BANNERS.length;

  const goTo = useCallback(
    (index: number) =>
      setCurrentIndex((index + totalSlides) % totalSlides),
    [totalSlides],
  );

  useEffect(() => {
    if (isPaused || totalSlides < 2 || prefersReducedMotion()) {
      return;
    }

    const timer = setTimeout(() => goTo(currentIndex + 1), AUTOPLAY_DELAY);

    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, totalSlides, goTo]);

  if (totalSlides === 0) {
    return null;
  }

  const banner = BANNERS[currentIndex];

  return (
    <section
      className={styles.slider}
      aria-roledescription='carousel'
      aria-label='Банери школи'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className={styles.slide}>
        <img
          key={banner.id}
          fetchPriority='high'
          src={banner.src}
          alt={banner.alt}
          className={styles.slideImage}
        />
      </div>

      {totalSlides > 1 && (
        <div className={styles.controls}>
          <span className={styles.counter}>
            {padNumber(currentIndex + 1)} / {padNumber(totalSlides)}
          </span>

          <div className={styles.dots}>
            {BANNERS.map((item, index) => (
              <button
                key={item.id}
                type='button'
                className={`${styles.dot} ${currentIndex === index ? styles.dotActive : ''}`}
                onClick={() => goTo(index)}
                aria-label={`Перейти до слайда ${index + 1}`}
                aria-current={currentIndex === index}
              />
            ))}
          </div>

          <div className={styles.arrows}>
            <button
              type='button'
              className={styles.arrow}
              onClick={() => goTo(currentIndex - 1)}
              aria-label='Попередній слайд'
            >
              ←
            </button>
            <button
              type='button'
              className={styles.arrow}
              onClick={() => goTo(currentIndex + 1)}
              aria-label='Наступний слайд'
            >
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
