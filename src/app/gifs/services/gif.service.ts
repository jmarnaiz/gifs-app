import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../models/giphy.model';
import type { Gif } from '../models/gif.model';
import { GifMapper } from '../mapper/gif.mapper';
import { map, Observable, tap } from 'rxjs';

const HISTORY_KEY = 'history';

const loadHistoryFromLocalStorage = (): Record<string, Gif[]> => {
  const history = localStorage.getItem(HISTORY_KEY);

  return history ? JSON.parse(history) : {};
};

@Injectable({
  providedIn: 'root',
})
export class GifService {
  private _http = inject(HttpClient);

  constructor() {
    this.loadTrendings();
  }

  trendingGifs = signal<Gif[]>([]);
  searchHistory = signal<Record<string, Gif[]>>(loadHistoryFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));
  // searchGifs = signal<Gif[]>([]);

  loadTrendings() {
    this._http
      .get<GiphyResponse>(`${environment.giphyURL}/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: 20,
        },
      })
      .subscribe((resp) => {
        const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
        this.trendingGifs.set(gifs);
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

  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? [];
  }

  // private _saveHistoryToLocalStorage() {
  //   localStorage.setItem('history', JSON.stringify(this.searchHistory()));
  // }

  // Se dispara cada vez que cambie el valor de searchHistory
  _saveHistoryToLocalStorage = effect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(this.searchHistory()));
  });
}

// Recuerda que si pongo llaves, hay que poner el return para saber que se devuelve
