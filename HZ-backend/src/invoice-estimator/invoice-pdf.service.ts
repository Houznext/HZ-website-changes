import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { buildInvoicePdfHtml } from './invoice-pdf.template';

const PDF_TIMEOUT_MS = 45_000;

function windowsChromeCandidates(): string[] {
  if (process.platform !== 'win32') return [];
  const local = process.env.LOCALAPPDATA || '';
  const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
  const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
  return [
    path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(local, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ];
}

const CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ...windowsChromeCandidates(),
].filter(Boolean) as string[];

function resolveChromeExecutable(): string | undefined {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      if (candidate && fs.existsSync(candidate)) return candidate;
    } catch {
      /* try next */
    }
  }
  return undefined;
}

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

function launchArgs(): string[] {
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--font-render-hinting=none',
  ];
  // --single-process crashes Chrome on Windows ("Target closed" during printToPDF).
  // Only enable in Linux containers when explicitly requested.
  if (
    process.platform === 'linux' &&
    process.env.PUPPETEER_SINGLE_PROCESS === 'true'
  ) {
    args.push('--single-process');
  }
  return args;
}

@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);
  private readonly logoDataUrl = loadLogoDataUrl();

  async generate(inv: Record<string, unknown>): Promise<Buffer> {
    const html = buildInvoicePdfHtml(inv, { logoDataUrl: this.logoDataUrl });
    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

    const executablePath = resolveChromeExecutable();
    if (executablePath) {
      this.logger.log(`Launching Chromium for PDF: ${executablePath}`);
    } else {
      this.logger.log(
        `Using Puppeteer bundled Chrome (cache: ${path.join(os.homedir(), '.cache', 'puppeteer')})`,
      );
    }

    try {
      browser = await puppeteer.launch({
        headless: true,
        ...(executablePath ? { executablePath } : {}),
        args: launchArgs(),
      });

      const page = await browser.newPage();
      // Avoid networkidle — Google Fonts / CDN can hang or crash the page.
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: PDF_TIMEOUT_MS,
      });
      // Give fonts a short chance to apply; don't block forever.
      await new Promise((r) => setTimeout(r, 400));

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
