import { Injectable } from '@nestjs/common';

export interface CsvExportColumn {
  key: string;
  label?: string;
}

export interface CsvExportInput<T extends Record<string, unknown> = Record<string, unknown>> {
  rows: T[];
  columns?: CsvExportColumn[];
  filename?: string;
  includeBom?: boolean;
}

export interface CsvExportResult {
  filename: string;
  contentType: string;
  text: string;
  buffer: Buffer;
  rowCount: number;
}

@Injectable()
export class CsvExportService {
  exportRows<T extends Record<string, unknown>>(input: CsvExportInput<T>): CsvExportResult {
    const columns = this.resolveColumns(input.rows, input.columns);
    const header = columns.map((column) => this.escapeCell(column.label ?? column.key)).join(',');
    const rows = input.rows.map((row) =>
      columns
        .map((column) => this.escapeCell(this.stringifyValue(row[column.key])))
        .join(','),
    );
    const body = [header, ...rows].join('\n');
    const text = input.includeBom ? `\ufeff${body}` : body;

    return {
      filename: input.filename ?? `export-${Date.now()}.csv`,
      contentType: 'text/csv; charset=utf-8',
      text,
      buffer: Buffer.from(text, 'utf8'),
      rowCount: input.rows.length,
    };
  }

  private resolveColumns<T extends Record<string, unknown>>(
    rows: T[],
    columns?: CsvExportColumn[],
  ): CsvExportColumn[] {
    if (columns && columns.length > 0) {
      return columns;
    }

    const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
    return keys.map((key) => ({ key }));
  }

  private stringifyValue(value: unknown) {
    if (value === undefined || value === null) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private escapeCell(value: string) {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }
}
