import { Category } from '../../categories/entities/category.entity';

export class CreatePostDto {
  content: string;
  title: string;
  categories?: Category[];
}
