export interface ColumnConfig<T> {
  label: string;
  key?: keyof T;
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: ColumnConfig<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
}
