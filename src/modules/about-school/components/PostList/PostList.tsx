import type { Post } from '../../../../types/landing';
import { PostCard } from '../PostCard';
import styles from './PostList.module.scss';

type PostListProps = {
  posts: Post[];
};

export const PostList = ({ posts }: PostListProps) => {
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
