import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../models/giphy.model';
import { Gif } from '../models/gif.model';
import { GifMapper } from '../mapper/gif.mapper';

@Injectable({
  providedIn: 'root',
})
export class GifService {
  private _http = inject(HttpClient);

  constructor() {
    this.loadTrendings();
  }

  trendingGifs = signal<Gif[]>([]);

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
}
