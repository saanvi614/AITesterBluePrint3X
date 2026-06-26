import ExcelJS from 'exceljs';
import path from 'path';
import { ContentRow, ContentStatus, EXCEL_COLUMNS } from './types';

const EXCEL_PATH = path.join(process.cwd(), 'content_calendar.xlsx');

const HEADERS = [
  'Date', 'Topic', 'LinkedIn POST', 'Medium Article', 'IG Script',
  'YT Script', 'Dev.to Article', 'Status', 'LinkedIn Image',
  'Medium Image', 'IG Image', 'Last Updated', 'Updated By', 'Error Message',
];

class Mutex {
  private _locked = false;
  private _queue: Array<() => void> = [];

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const tryAcquire = () => {
        if (!this._locked) {
          this._locked = true;
          resolve(() => this._release());
        } else {
          this._queue.push(tryAcquire);
        }
      };
      tryAcquire();
    });
  }

  private _release() {
    this._locked = false;
    const next = this._queue.shift();
    if (next) next();
  }
}

const writeMutex = new Mutex();

function rowToObject(row: ExcelJS.Row): ContentRow | null {
  const date = row.getCell(1).value;
  const topic = row.getCell(2).value;
  if (!date || !topic) return null;

  return {
    date:          String(date instanceof Date ? date.toISOString().slice(0, 10) : date ?? ''),
    topic:         String(topic ?? ''),
    linkedinPost:  String(row.getCell(3).value ?? ''),
    mediumArticle: String(row.getCell(4).value ?? ''),
    igScript:      String(row.getCell(5).value ?? ''),
    ytScript:      String(row.getCell(6).value ?? ''),
    devtoArticle:  String(row.getCell(7).value ?? ''),
    status:        (String(row.getCell(8).value ?? 'Pending')) as ContentStatus,
    linkedinImage: String(row.getCell(9).value ?? ''),
    mediumImage:   String(row.getCell(10).value ?? ''),
    igImage:       String(row.getCell(11).value ?? ''),
    lastUpdated:   String(row.getCell(12).value ?? ''),
    updatedBy:     String(row.getCell(13).value ?? ''),
    errorMessage:  String(row.getCell(14).value ?? ''),
  };
}

async function ensureWorkbook(): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.readFile(EXCEL_PATH);
    let ws = wb.getWorksheet('Content Calendar');
    if (!ws) {
      ws = wb.addWorksheet('Content Calendar');
      ws.addRow(HEADERS);
    }
  } catch {
    const ws = wb.addWorksheet('Content Calendar');
    const headerRow = ws.addRow(HEADERS);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0369A1' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    await wb.xlsx.writeFile(EXCEL_PATH);
  }
  return wb;
}

export class ExcelManager {
  async readAll(): Promise<ContentRow[]> {
    const release = await writeMutex.acquire();
    try {
      const wb = await ensureWorkbook();
      const ws = wb.getWorksheet('Content Calendar')!;
      const rows: ContentRow[] = [];
      ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const obj = rowToObject(row);
        if (obj) rows.push(obj);
      });
      return rows;
    } finally {
      release();
    }
  }

  async readByDate(date: string): Promise<ContentRow | null> {
    const all = await this.readAll();
    return all.find((r) => r.date === date) ?? null;
  }

  async appendRow(row: Partial<ContentRow> & { date: string; topic: string }): Promise<void> {
    const release = await writeMutex.acquire();
    try {
      const wb = await ensureWorkbook();
      const ws = wb.getWorksheet('Content Calendar')!;
      ws.addRow([
        row.date,
        row.topic,
        row.linkedinPost ?? '',
        row.mediumArticle ?? '',
        row.igScript ?? '',
        row.ytScript ?? '',
        row.devtoArticle ?? '',
        row.status ?? 'Pending',
        row.linkedinImage ?? '',
        row.mediumImage ?? '',
        row.igImage ?? '',
        new Date().toISOString(),
        row.updatedBy ?? '',
        row.errorMessage ?? '',
      ]);
      await wb.xlsx.writeFile(EXCEL_PATH);
    } finally {
      release();
    }
  }

  async updateRow(date: string, updates: Partial<ContentRow>): Promise<boolean> {
    const release = await writeMutex.acquire();
    try {
      const wb = await ensureWorkbook();
      const ws = wb.getWorksheet('Content Calendar')!;
      let found = false;

      ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const cellDate = row.getCell(1).value;
        const rowDate = cellDate instanceof Date
          ? cellDate.toISOString().slice(0, 10)
          : String(cellDate ?? '');

        if (rowDate === date) {
          found = true;
          if (updates.topic         !== undefined) row.getCell(2).value  = updates.topic;
          if (updates.linkedinPost  !== undefined) row.getCell(3).value  = updates.linkedinPost;
          if (updates.mediumArticle !== undefined) row.getCell(4).value  = updates.mediumArticle;
          if (updates.igScript      !== undefined) row.getCell(5).value  = updates.igScript;
          if (updates.ytScript      !== undefined) row.getCell(6).value  = updates.ytScript;
          if (updates.devtoArticle  !== undefined) row.getCell(7).value  = updates.devtoArticle;
          if (updates.status        !== undefined) row.getCell(8).value  = updates.status;
          if (updates.linkedinImage !== undefined) row.getCell(9).value  = updates.linkedinImage;
          if (updates.mediumImage   !== undefined) row.getCell(10).value = updates.mediumImage;
          if (updates.igImage       !== undefined) row.getCell(11).value = updates.igImage;
          row.getCell(12).value = new Date().toISOString();
          if (updates.updatedBy     !== undefined) row.getCell(13).value = updates.updatedBy;
          if (updates.errorMessage  !== undefined) row.getCell(14).value = updates.errorMessage;
        }
      });

      if (found) await wb.xlsx.writeFile(EXCEL_PATH);
      return found;
    } finally {
      release();
    }
  }

  async getExcelPath(): Promise<string> {
    return EXCEL_PATH;
  }

  async getStats(): Promise<{ rowCount: number; lastModified: string | null }> {
    const { statSync } = await import('fs');
    try {
      const stat = statSync(EXCEL_PATH);
      const rows = await this.readAll();
      return { rowCount: rows.length, lastModified: stat.mtime.toISOString() };
    } catch {
      return { rowCount: 0, lastModified: null };
    }
  }
}

export const excelManager = new ExcelManager();
