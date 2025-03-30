import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

/**
 * Generates a PDF from the SOP log data
 * @param sopLogData The SOP log data from database
 * @returns Buffer containing the generated PDF
 */

declare const window: Window & {
  renderSopLogData: (data: any) => void;
};

export async function generateSopLogPdf(sopLogData) {
  try {
    const templatePath = path.resolve(__dirname, '../../../templates/report-template.html');
    const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();

    await page.setContent(htmlTemplate, {
      waitUntil: 'networkidle0',
    });

    await page.evaluate((data) => {
      window.renderSopLogData(data);
    }, sopLogData);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    return {
      originalName: `audit-log-${Date.now()}.pdf`,
      buffer: pdfBuffer,
      mimeType: 'application/pdf',
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
