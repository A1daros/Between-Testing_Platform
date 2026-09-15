import type { TableProps } from '../../../../types/tableCascade';
import styles from './Table.module.scss';

export function Table<T extends { id: string | number }>({
  columns,
  rows,
  onRowClick,
}: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column.label}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        <tr>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? styles.clickableRow : undefined}
            >
              {columns.map((column, index) => (
                <td key={index}>
                  {column.render
                    ? column.render(row)
                    : String(row[column.key as keyof T] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
