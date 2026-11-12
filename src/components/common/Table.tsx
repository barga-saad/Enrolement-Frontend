import React from 'react';
import { ChevronUp, ChevronDown, Inbox } from 'lucide-react';

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  keyField: keyof T;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: keyof T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

import { useLangStore, t } from '../../utils/langStore';

export const Table = React.forwardRef<HTMLDivElement, TableProps<any>>(
  (
    {
      columns,
      data,
      actions,
      keyField,
      sortBy,
      sortOrder = 'asc',
      onSort,
      loading,
      emptyMessage = 'No data available',
      className,
    },
    ref
  ) => {
    const { lang: _lang } = useLangStore();
    return (
      <div ref={ref} className={`card-base overflow-hidden ${className}`}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="table-head">
              <tr>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`table-th whitespace-nowrap transition-colors ${
                      col.sortable ? 'cursor-pointer select-none hover:text-bcp-brown dark:hover:text-bcp-orange group' : ''
                    } ${col.width || ''}`}
                    onClick={() => col.sortable && onSort?.(col.key)}
                    aria-sort={col.sortable && sortBy === col.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <div className={`flex flex-col transition-opacity ${sortBy === col.key ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                          <ChevronUp size={10} className={`${sortBy === col.key && sortOrder === 'asc' ? 'text-bcp-orange' : 'text-gray-300'}`} />
                          <ChevronDown size={10} className={`${sortBy === col.key && sortOrder === 'desc' ? 'text-bcp-orange' : 'text-gray-300'}`} />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="table-th text-right">{t('Actions', 'Actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 dark:bg-dark-bg-soft rounded-md w-full" />
                      </td>
                    ))}
                    {actions && <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-dark-bg-soft rounded-md w-12 ml-auto" /></td>}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-bg-soft">
                        <Inbox size={26} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={String(row[keyField])} className="data-row group">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-6 py-3.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}
                      </td>
                    ))}
                    {actions && <td className="px-6 py-3.5 text-right"><div className="inline-flex justify-end">{actions(row)}</div></td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

Table.displayName = 'Table';

