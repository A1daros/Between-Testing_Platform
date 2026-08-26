import type { Post } from '../../../../types/landing';
import styles from './PostCard.module.scss';

type Props = {
  post: Post;
};

export const PostCard: React.FC<Props> = ({ post }) => {
  return (
    <article className={styles.card}>
      <div className={styles.wrapper}>
        <img src={post.image} alt={'Post image'} className={styles.img} />
      </div>
    </article>
  );
};
