import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { In, Repository } from "typeorm";
import { PostNotFoundException } from './exceptions/postNotFound.exception';
import User from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createPostDto: CreatePostDto, user: User) {
    const categoriesIds =
      createPostDto.categories?.map((category) => category.id) || [];

    const categories = await this.categoryRepository.find({
      where: {
        id: In(categoriesIds),
      },
    });

    const newPost = this.postRepository.create({
      ...createPostDto,
      author: user,
      categories: categories,
    });

    await this.postRepository.save(newPost);
    return newPost;
  }

  async findAll() {
    return this.postRepository.find({ relations: ['author', 'categories'] });
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        author: true,
        categories: true,
      },
    });

    if (post) {
      return post;
    }

    throw new PostNotFoundException(id);
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    await this.postRepository.update(id, updatePostDto);
    const updatedPost = this.postRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        author: true,
      },
    });

    if (updatedPost) {
      return updatedPost;
    }

    throw new PostNotFoundException(id);
  }

  async remove(id: number) {
    const deleteResponse = await this.postRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new PostNotFoundException(id);
    }
  }
}
