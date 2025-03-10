import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollStateService {
  trendingScrollState = signal(0);

  /**
   * Como mejora, se podría crear una estructura de datos para almacenar
   * el scroll state de cada página, en lugar de tener un único valor.
   * Ejemplo:
   *
   * pagesScrollState = signal<Record<string, number>>({
   * 'page1': 1000, 'page2': 500, 'page3': 0});
   */
}
