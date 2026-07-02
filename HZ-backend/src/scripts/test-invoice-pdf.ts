/** Quick PDF smoke test: npm run test:invoice-pdf */
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { InvoicesService } from '../invoice-estimator/invoices.service';
import { InvoicePdfService } from '../invoice-estimator/invoice-pdf.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvoiceEstimator } from '../invoice-estimator/entities/invoice-estimator.entity';
import { Repository } from 'typeorm';

dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || 'development'}`,
  ),
});

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const repo = app.get<Repository<InvoiceEstimator>>(
    getRepositoryToken(InvoiceEstimator),
  );
  const invoices = app.get(InvoicesService);
  const pdf = app.get(InvoicePdfService);

  const row = await repo.findOne({
    where: {},
    order: { createdAt: 'DESC' },
  });
  if (!row) {
    console.log('No invoices in DB');
    await app.close();
    return;
  }

  let inv = await invoices.findOne(row.id, true);
  if (inv.status === 'draft') {
    await repo.update(row.id, { status: 'sent', sentAt: new Date() });
    inv = await invoices.findOne(row.id, true);
  }

  const buf = await pdf.generate(inv);
  const out = path.resolve(process.cwd(), `invoice-pdf-test-${row.id}.pdf`);
  fs.writeFileSync(out, buf);
  console.log(`Wrote ${out} (${buf.length} bytes)`);
  await app.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
