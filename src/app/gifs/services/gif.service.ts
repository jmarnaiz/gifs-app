import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../models/giphy.model';
import type { Gif } from '../models/gif.model';
import { GifMapper } from '../mapper/gif.mapper';
import { map, Observable, tap } from 'rxjs';

const HISTORY_KEY = 'history';
const PAGE_SIZE = 20;

const loadHistoryFromLocalStorage = (): Record<string, Gif[]> => {
  const history = localStorage.getItem(HISTORY_KEY);

  return history ? JSON.parse(history) : {};
};

@Injectable({
  providedIn: 'root',
})
export class GifService {
  private _http = inject(HttpClient);
  private _trendingPage = signal(0);

  constructor() {
    this.loadTrendings();
  }

  trendingGifs = signal<Gif[]>([]);
  trendingGifsIsLoading = signal(false);
  // Debemos crear un array que contenga array de 3 gifs: [[gif1, gif2, gif3], [gif4, gif5, gif6], ...]
  trendingGifsGrouped = computed<Gif[][]>(() => {
    const groupedElements: Gif[][] = [];

    for (let i = 0; i < this.trendingGifs().length; i += 3) {
      groupedElements.push(this.trendingGifs().slice(i, i + 3));
    }

    return groupedElements;
  });

  searchHistory = signal<Record<string, Gif[]>>(loadHistoryFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));
  // searchGifs = signal<Gif[]>([]);

  loadTrendings() {
    if (this.trendingGifsIsLoading()) return;

    this.trendingGifsIsLoading.set(true);

    this._http
      .get<GiphyResponse>(`${environment.giphyURL}/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          offset: this._trendingPage() * PAGE_SIZE,
          limit: PAGE_SIZE,
        },
      })
      .pipe(map(({ data }) => GifMapper.mapGiphyItemsToGifArray(data)))
      .subscribe((gifs) => {
        this.trendingGifs.update((gifsStored) => [...gifsStored, ...gifs]);
        this._trendingPage.update((page) => page + 1);
        this.trendingGifsIsLoading.set(false);
      });
  }

  // search(query: string) {
  //   this._http
  //     .get<GiphyResponse>(`${environment.giphyURL}/search`, {
  //       params: {
  //         api_key: environment.giphyApiKey,
  //         limit: 20,
  //         q: query,
  //       },
  //     })
  //     .subscribe((resp) => {
  //       const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
  //       this.searchGifs.set(gifs);
  //     });
  // }

  search(query: string): Observable<Gif[]> {
    return this._http
      .get<GiphyResponse>(`${environment.giphyURL}/search`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: 20,
          q: query,
        },
      })
      .pipe(
        map(({ data }) => GifMapper.mapGiphyItemsToGifArray(data)),
        tap((items) => {
          this.searchHistory.update((history) => ({
            ...history,
            [query.toLowerCase()]: items,
          }));
        })
      );
  }

  // Recuerda que si pongo llaves, hay que poner el return para saber que se devuelve

  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? [];
  }

  // Se dispara cada vez que cambie el valor de searchHistory
  _saveHistoryToLocalStorage = effect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(this.searchHistory()));
  });
}
