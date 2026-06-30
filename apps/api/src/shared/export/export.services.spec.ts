import { CsvExportService } from './csv-export.service';
import { PdfExportService } from './pdf-export.service';

describe('Shared export services', () => {
  it('exports rows as CSV', () => {
    const service = new CsvExportService();
    const result = service.exportRows({
      rows: [
        { name: 'Miami Academy', note: 'Top "choice"' },
        { name: 'Eastern Heights College', note: 'Stable, trusted' },
      ],
    });

    expect(result.contentType).toBe('text/csv; charset=utf-8');
    expect(result.text).toContain('name,note');
    expect(result.text).toContain('"Top ""choice"""');
    expect(result.rowCount).toBe(2);
  });

  it('exports a basic PDF buffer', () => {
    const service = new PdfExportService();
    const result = service.exportDocument({
      title: 'Quarterly Report',
      subtitle: 'Phase 2 Setup',
      sections: [
        {
          heading: 'Highlights',
          lines: ['Shared services are ready.', 'Admission comes next.'],
        },
      ],
    });

    const pdfText = result.buffer.toString('utf8');
    expect(result.contentType).toBe('application/pdf');
    expect(result.pageCount).toBeGreaterThan(0);
    expect(pdfText.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfText).toContain('/Catalog');
    expect(pdfText).toContain('Quarterly Report');
  });
});

