import type { Post } from '../../../../types/landing';
import { PostCard } from '../PostCard';
import styles from './PostList.module.scss';

type Props = {
  posts: Post[];
};

export const PostList: React.FC<Props> = ({ posts }) => {
  return (
    <div className={styles.container}>
      <ul className={styles.productList}>
        {posts.map((post) => (
          <li key={post.id} className={styles.listItem} data-card>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
};
