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
    return (
      <div ref={ref} className={`card-base overflow-hidden border-none shadow-bcp-card ${className}`}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50/80 dark:bg-dark-bg-soft/80 backdrop-blur-sm border-b border-gray-100 dark:border-dark-border">
              <tr>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`px-6 py-5 font-bold text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors ${
                      col.sortable ? 'cursor-pointer hover:text-bcp-orange group' : ''
                    } ${col.width || ''}`}
                    onClick={() => col.sortable && onSort?.(col.key)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronUp size={10} className={`${sortBy === col.key && sortOrder === 'asc' ? 'text-bcp-orange' : 'text-gray-300'}`} />
                          <ChevronDown size={10} className={`${sortBy === col.key && sortOrder === 'desc' ? 'text-bcp-orange' : 'text-gray-300'}`} />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="px-6 py-5 font-bold text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
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
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                      <Inbox size={48} className="text-gray-400" />
                      <p className="font-bold text-gray-500">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={String(row[keyField])} className="hover:bg-orange-50/30 dark:hover:bg-bcp-orange/5 transition-colors group">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}
                      </td>
                    ))}
                    {actions && <td className="px-6 py-4 text-right"><div className="inline-flex justify-end">{actions(row)}</div></td>}
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

