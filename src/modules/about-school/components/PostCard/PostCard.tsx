import type { Post } from '../../../../types/landing';
import styles from './PostCard.module.scss';

type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <article className={styles.card}>
      <div className={styles.wrapper}>
        <img
          src={post.image}
          alt={post.alt}
          loading='lazy'
          className={styles.img}
        />
      </div>
    </article>
  );
};
