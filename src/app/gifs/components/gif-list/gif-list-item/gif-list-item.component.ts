import { Component, input } from '@angular/core';
import { Gif } from 'src/app/gifs/models/gif.model';

@Component({
  selector: 'gif-list-item',
  imports: [],
  templateUrl: './gif-list-item.component.html',
})
export class GifListItemComponent {
  gif = input.required<Gif>();
}
