import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Gif, SearchResponse } from '../interfaces/gifs.interfaces';

// Si el provideIn está en root, ese servicio estará disponible en toda la aplicación sin
// la necesidad de hacer las importaciones en los providers
@Injectable({providedIn: 'root'})
export class GifsService {

  public gifsList: Gif[] = [];

  private _tagsHistory: string[] = [];
  private apiKey: string = '3O5sJvWGh5zhK8aoQzRTqVLrECuBXm40';
  private serviceUrl: string = 'https://api.giphy.com/v1/gifs';

  constructor( private http: HttpClient ) {
    this.loadLocalStorage();
  }


  get tagsHistory() {
    // Como los arreglos pasan por referencia, con el operador spread se crea una copia
    // del valor de tagsHistory y romper esa referencia
    return [...this._tagsHistory];
  }

  private organizeHistory( tag: string ): void {
    tag = tag.toLowerCase();

    if( this._tagsHistory.includes(tag) ) {
      this._tagsHistory = this._tagsHistory.filter( (oldTag) => oldTag !== tag );
    }

    this._tagsHistory.unshift( tag );
    this._tagsHistory = this.tagsHistory.splice(0, 10);
    this.saveLocalStorage()
  }

  searchTag( tag: string ): void {
    if( tag.length == 0 ) return;
    this.organizeHistory( tag );

    const params = new HttpParams()
      .set( 'api_key', this.apiKey )
      .set( 'limit', '10' )
      .set( 'q', tag )

    // Esto NO es una promesa, es un observable
    this.http.get<SearchResponse>(`${this.serviceUrl}/search`, { params })
      .subscribe( resp => {
        this.gifsList = resp.data;

        console.log(this.gifsList);
      });

  }

  private saveLocalStorage(): void {
    localStorage.setItem('history', JSON.stringify( this._tagsHistory ));
  }

  private loadLocalStorage(): void {
    if( !localStorage.getItem('history') ) return;

    this._tagsHistory = JSON.parse( localStorage.getItem('history')! );

    if( this._tagsHistory.length === 0 ) return;
    this.searchTag( this._tagsHistory[0] );
  }

  // async searchTag( tag: string ): Promise<void> {
  //   if( tag.length == 0 ) return;
  //   this.organizeHistory( tag );

  //   Esto es FetchAPI de js, no es propio de Angular
  //   fetch('https://api.giphy.com/v1/gifs/search?api_key=3O5sJvWGh5zhK8aoQzRTqVLrECuBXm40&q=transformers&limit=10')
  //     .then( resp => resp.json() )
  //     .then( data => console.log(data) );
  // }

}
