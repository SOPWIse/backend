import { IFileBody } from '@sopwise/modules/file-manager/types';
import * as puppeteer from 'puppeteer';

class PdfService {
  async generatePdfAsMulterFile(
    fileName: string,
    html: string,
  ): Promise<IFileBody> {
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    const page = await browser.newPage();

    const htmlWithStyles = `
      <style>
        body {
          padding: 20px;
          font-family: Arial, sans-serif;
          line-height: 1.6;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      </style>
      ${html}
    `;

    await page.setContent(htmlWithStyles, { waitUntil: 'networkidle0' });

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: '<div></div>',
    });
    await browser.close();
    const pdfBuffer = Buffer.from(pdfUint8Array);

    return {
      originalName: `${fileName}-generated-${Date.now()}.pdf`,
      buffer: pdfBuffer,
      mimeType: 'application/pdf',
    };
  }
}

export default new PdfService();
