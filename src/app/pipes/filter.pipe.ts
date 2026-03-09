import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true,
  pure: false
})
export class FilterPipe implements PipeTransform {
  transform<T extends Record<string, unknown>>(
    items: T[],
    searchText: string,
    fields: string[]
  ): T[] {
    if (!items || !searchText || searchText.trim() === '') {
      return items;
    }
    const lowerSearch = searchText.toLowerCase().trim();
    return items.filter(item =>
      fields.some(field => {
        const value = item[field];
        return value != null && String(value).toLowerCase().includes(lowerSearch);
      })
    );
  }
}
