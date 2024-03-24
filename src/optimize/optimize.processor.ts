import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { buffer } from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import AdmZip from 'adm-zip';
import { Express } from 'express';

@Processor('images')
export default class ImageProcessor {
  @Process('optimize')
  async handleOptimization(job: Job) {
    const files: Express.Multer.File[] = job.data.files;

    const optimizationPromises: Promise<Buffer>[] = files.map((file) => {
      // We call the Buffer.from(file.buffer) function, because the file.buffer stopped being an instance of the
      // Buffer class when serialized and put to the Redis store.
      const fileBuffer = Buffer.from(file.buffer);
      return buffer(fileBuffer, {
        plugins: [
          imageminPngquant({
            quality: [0.6, 0.8],
          }),
        ],
      });
    });

    const optimizedImages = await Promise.all(optimizationPromises);

    const zip = new AdmZip();

    optimizedImages.forEach((image, index) => {
      const fileData = files[index];
      zip.addFile(fileData.originalname, image);
    });

    return zip.toBuffer();
  }
}
