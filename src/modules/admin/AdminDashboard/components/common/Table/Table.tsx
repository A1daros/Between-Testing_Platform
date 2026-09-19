import type { TableProps } from '../../../../types/table.ts';
import styles from './Table.module.scss';

export function Table<T extends { id: string | number }>({
  columns,
  rows,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.headRow}>
            {columns.map((column, index) => (
              <th key={index} className={styles.headColumn}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={styles.tbody}>
          {rows.map((row) => {
            const rowClassName =
              `${styles.bodyRow} ${onRowClick ? styles.clickableRow : ''}`.trim();

            return (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={rowClassName}
              >
                {columns.map((column, index) => {
                  const defaultRender = String(
                    row[column.key as keyof T] ?? '—',
                  );

                  return (
                    <td key={index} className={styles.bodyColumn}>
                      {column.render ? column.render(row) : defaultRender}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
