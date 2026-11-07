import type { ReactNode } from 'react';

export type ColumnConfig<T> = {
  label: string;
  key?: keyof T;
  render?: (row: T) => ReactNode;
};

export type TableProps<T> = {
  columns: ColumnConfig<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  getRowLabel?: (row: T) => string;
};
