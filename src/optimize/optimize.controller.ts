import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthenticationGuard } from '../authentication/jwt-authentication.guard';
import { Readable } from 'stream';

@Controller('optimize')
export class OptimizeController {
  constructor(@InjectQueue('images') private readonly imagesQueue: Queue) {}

  @Post('image')
  @UseInterceptors(AnyFilesInterceptor())
  @UseGuards(JwtAuthenticationGuard)
  async processImage(@UploadedFiles() files: Express.Multer.File[]) {
    // add job to images queue, job name is 'optimize'.
    const job = await this.imagesQueue.add('optimize', {
      files,
    });

    return {
      jobId: job.id,
    };
  }

  // Since we’ve used the @Res() decorator, we put NestJS into the library-specific mode for the getJobResult handler.
  // Because of that, we are responsible for managing the response manually,
  // for example, with the response.sendStatus method.
  @Get('image/:id')
  async getJobResult(@Res() response: Response, @Param('id') id: string) {
    const job = await this.imagesQueue.getJob(id);

    if (!job) {
      return response.sendStatus(HttpStatus.NOT_FOUND);
    }

    const isCompleted = await job.isCompleted();

    if (!isCompleted) {
      return response.sendStatus(HttpStatus.ACCEPTED);
    }

    const result = Buffer.from(job.returnvalue);

    const stream = Readable.from(result);

    stream.pipe(response);
  }
}
