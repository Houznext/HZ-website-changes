import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { buildInvoicePdfHtml } from './invoice-pdf.template';

const PDF_TIMEOUT_MS = 45_000;

function loadLogoDataUrl(): string | undefined {
  const candidates = [
    path.join(process.cwd(), 'assets', 'houznext-logo.png'),
    path.join(__dirname, '..', '..', 'assets', 'houznext-logo.png'),
    path.join(process.cwd(), '..', 'HZ-admin', 'public', 'images', 'Houznext Logo.png'),
  ];
  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const buf = fs.readFileSync(filePath);
        return `data:image/png;base64,${buf.toString('base64')}`;
      }
    } catch {
      /* try next */
    }
  }
  return undefined;
}

@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);
  private readonly logoDataUrl = loadLogoDataUrl();

  async generate(inv: Record<string, unknown>): Promise<Buffer> {
    const html = buildInvoicePdfHtml(inv, { logoDataUrl: this.logoDataUrl });
    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--font-render-hinting=none',
        ],
      });

      const page = await browser.newPage();
      await page.setContent(html, {
        waitUntil: 'load',
        timeout: PDF_TIMEOUT_MS,
      });
      await new Promise((r) => setTimeout(r, 800));

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        timeout: PDF_TIMEOUT_MS,
      });

      return Buffer.from(pdf);
    } catch (err) {
      this.logger.error(
        'Puppeteer PDF failed',
        err instanceof Error ? err.message : err,
      );
      throw err;
    } finally {
      if (browser) {
        await browser.close().catch(() => undefined);
      }
    }
  }
}
