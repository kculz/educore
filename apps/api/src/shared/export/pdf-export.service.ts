import { Injectable } from '@nestjs/common';

export interface PdfExportSection {
  heading: string;
  lines: string[];
}

export interface PdfExportInput {
  title: string;
  subtitle?: string;
  sections?: PdfExportSection[];
  footer?: string;
  author?: string;
  filename?: string;
}

export interface PdfExportResult {
  filename: string;
  contentType: string;
  buffer: Buffer;
  pageCount: number;
}

@Injectable()
export class PdfExportService {
  exportDocument(input: PdfExportInput): PdfExportResult {
    const lines = this.collectLines(input);
    const wrappedLines = lines.flatMap((line) => this.wrapLine(line));
    const pages = this.chunkLines(wrappedLines.length > 0 ? wrappedLines : [''], 40);
    const buffer = this.buildPdfBuffer(pages, input);

    return {
      filename: input.filename ?? `report-${Date.now()}.pdf`,
      contentType: 'application/pdf',
      buffer,
      pageCount: pages.length,
    };
  }

  private collectLines(input: PdfExportInput) {
    const lines = [input.title];
    if (input.subtitle) {
      lines.push(input.subtitle);
    }

    lines.push('');

    for (const section of input.sections ?? []) {
      lines.push(section.heading);
      lines.push(...section.lines);
      lines.push('');
    }

    if (input.footer) {
      lines.push('');
      lines.push(input.footer);
    }

    return lines;
  }

  private chunkLines(lines: string[], size: number) {
    const chunks: string[][] = [];
    const step = Math.max(1, Math.floor(size));

    for (let index = 0; index < lines.length; index += step) {
      chunks.push(lines.slice(index, index + step));
    }

    return chunks;
  }

  private wrapLine(line: string, width = 90) {
    if (line.length <= width) {
      return [line];
    }

    const words = line.split(/\s+/);
    const wrapped: string[] = [];
    let current = '';

    for (const word of words) {
      if (!current) {
        current = word;
        continue;
      }

      const candidate = `${current} ${word}`;
      if (candidate.length <= width) {
        current = candidate;
      } else {
        wrapped.push(current);
        current = word;
      }
    }

    if (current) {
      wrapped.push(current);
    }

    return wrapped.length > 0 ? wrapped : [line];
  }

  private buildPdfBuffer(pages: string[][], input: PdfExportInput) {
    const pageObjectNumbers = pages.map((_, index) => 4 + index * 2);
    const contentObjectNumbers = pages.map((_, index) => 5 + index * 2);

    const objects = [
      {
        number: 1,
        content: '<< /Type /Catalog /Pages 2 0 R >>',
      },
      {
        number: 2,
        content: `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] /Count ${pages.length} >>`,
      },
      {
        number: 3,
        content: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      },
      ...pages.flatMap((pageLines, index) => [
        {
          number: pageObjectNumbers[index],
          content: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumbers[index]} 0 R >>`,
        },
        {
          number: contentObjectNumbers[index],
          content: this.buildContentStream(pageLines),
        },
      ]),
    ];

    const chunks: string[] = ['%PDF-1.4\n'];
    const offsets: number[] = [0];
    let cursor = Buffer.byteLength(chunks[0], 'utf8');

    for (const object of objects) {
      offsets.push(cursor);
      const objectChunk = `${object.number} 0 obj\n${object.content}\nendobj\n`;
      chunks.push(objectChunk);
      cursor += Buffer.byteLength(objectChunk, 'utf8');
    }

    const xrefOffset = cursor;
    const xrefEntries = [
      `xref\n0 ${objects.length + 1}\n`,
      '0000000000 65535 f \n',
      ...offsets.slice(1).map((offset) => `${offset.toString().padStart(10, '0')} 00000 n \n`),
    ];
    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    chunks.push(xrefEntries.join(''));
    chunks.push(trailer);
    return Buffer.from(chunks.join(''), 'utf8');
  }

  private buildContentStream(lines: string[]) {
    const safeLines = lines.length > 0 ? lines : [''];
    const commands = ['BT', '/F1 12 Tf', '14 TL', '50 780 Td'];

    safeLines.forEach((line, index) => {
      const escaped = this.escapePdfText(line);
      if (index === 0) {
        commands.push(`(${escaped}) Tj`);
        return;
      }

      commands.push('T*');
      commands.push(`(${escaped}) Tj`);
    });

    commands.push('ET');
    const body = commands.join('\n');
    return `<< /Length ${Buffer.byteLength(body, 'utf8')} >>\nstream\n${body}\nendstream`;
  }

  private escapePdfText(value: string) {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\r?\n/g, ' ');
  }
}
