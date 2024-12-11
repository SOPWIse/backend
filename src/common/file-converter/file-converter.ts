import * as puppeteer from 'puppeteer';
import { Readable } from 'stream';

class PdfService {
  async generatePdfAsMulterFile(
    fileName: string,
    html: string,
  ): Promise<Express.Multer.File> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfUint8Array = await page.pdf({ format: 'A4' });
    await browser.close();
    const pdfBuffer = Buffer.from(pdfUint8Array);

    const multerFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: `${fileName}-generated-${Date.now()}.pdf`,
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: pdfBuffer.length,
      buffer: pdfBuffer,
      stream: Readable.from(pdfBuffer),
      destination: '',
      filename: `${fileName}-generated-${Date.now()}.pdf`,
      path: '',
    };

    return multerFile;
  }
}

export default new PdfService();
