import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CategoryNotFoundException } from './exceptions/categoryNotFound.exception';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const newCategory = this.categoryRepository.create(createCategoryDto);
    await this.categoryRepository.save(newCategory);
    return newCategory;
  }

  findAll() {
    return this.categoryRepository.find({ relations: ['posts'] });
  }

  async findOne(id: number) {
    const category = this.categoryRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        posts: true,
      },
    });

    if (category) {
      return category;
    }

    throw new CategoryNotFoundException(id);
  }
}
