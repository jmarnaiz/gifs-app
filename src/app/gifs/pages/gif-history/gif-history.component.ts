import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GifService } from '../../services/gif.service';
import { GifListComponent } from '../../components/gif-list/gif-list.component';

@Component({
  selector: 'app-gif-history',
  imports: [GifListComponent],
  templateUrl: './gif-history.component.html',
})
export default class GifHistoryComponent {
  gifService = inject(GifService);
  // Método tradicional
  // query = inject(ActivatedRoute).params.subscribe((params) =>
  //   console.log('Params: ', params['query'])
  // );
  // Con snapshot tomo una 'instantánea' de la ruta en ese momento
  // pero ya no sería algo dinámico
  // query = inject(ActivatedRoute).snapshot.params['query'];

  // Método moderno
  query = toSignal(
    inject(ActivatedRoute).params.pipe(map((params) => params['query']))
  );

  gifsByQuery = computed(() => this.gifService.getHistoryGifs(this.query()));
}
