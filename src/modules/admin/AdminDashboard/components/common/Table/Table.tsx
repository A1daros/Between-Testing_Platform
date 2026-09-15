import type { TableProps } from '../../../../types/table.ts';
import styles from './Table.module.scss';

export function Table<T extends { id: string | number }>({
  columns,
  rows,
  onRowClick,
}: TableProps<T>) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column.label}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={onRowClick ? styles.clickableRow : undefined}
          >
            {columns.map((column, index) => {
              const defaultRender = String(row[column.key as keyof T] ?? '—');

              return (
                <td key={index}>
                  {column.render ? column.render(row) : defaultRender}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
