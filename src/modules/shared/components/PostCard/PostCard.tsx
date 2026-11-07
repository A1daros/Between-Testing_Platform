import type { Post } from '../../../../types/landing';
import styles from './PostCard.module.scss';

type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <article className={styles.card}>
      <div className={styles.wrapper}>
        <img src={post.image} alt={'Post image'} className={styles.img} />
      </div>
    </article>
  );
};
