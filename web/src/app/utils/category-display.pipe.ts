import { Pipe, type PipeTransform } from '@angular/core';
import { CATEGORY_MAP } from '../models/category-map';

@Pipe({
  name: 'categoryDisplay',
  standalone: true,
})
export class CategoryDisplayPipe implements PipeTransform {
  transform(value: string): string {
    return CATEGORY_MAP[value] || value;
  }
}
