import type { KeyboardEvent } from 'react';
import type { TableProps } from '../../types/table';
import styles from './Table.module.scss';

export function Table<T extends { id: string | number }>({
  columns,
  rows,
  onRowClick,
  getRowLabel,
}: TableProps<T>) {
  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick?.(row);
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.headRow}>
            {columns.map((column) => (
              <th key={column.label} scope='col' className={styles.headColumn}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={styles.tbody}>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`${styles.bodyRow} ${onRowClick ? styles.clickableRow : ''}`}
              {...(onRowClick && {
                tabIndex: 0,
                'aria-label': getRowLabel?.(row),
                onClick: () => onRowClick(row),
                onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) =>
                  handleRowKeyDown(event, row),
              })}
            >
              {columns.map((column) => (
                <td key={column.label} className={styles.bodyColumn}>
                  {column.render
                    ? column.render(row)
                    : String((column.key && row[column.key]) ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
