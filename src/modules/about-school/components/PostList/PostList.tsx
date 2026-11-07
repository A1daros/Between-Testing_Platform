import type { Post } from '../../../../types/landing';
import { PostCard } from '../PostCard';
import styles from './PostList.module.scss';

type PostListProps = {
  posts: Post[];
};

export const PostList = ({ posts }: PostListProps) => {
  return (
    <ul className={styles.productList}>
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
};
