import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthenticationGuard } from '../authentication/jwt-authentication.guard';
import { FindOneParams } from '../utils/findOneParams';
import RequestWithUser from '../authentication/requestWithUser.interface';

@Controller('posts')
@UseGuards(JwtAuthenticationGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() request: RequestWithUser,
  ) {
    return this.postsService.create(createPostDto, request.user);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  // Please note that we don’t use @Param('id') anymore here. Instead, we destructure the whole params object.
  // this is because we use Validating params class
  @Get(':id')
  findOne(@Param() { id }: FindOneParams) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
