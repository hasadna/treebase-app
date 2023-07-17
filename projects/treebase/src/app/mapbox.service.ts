import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapboxService {

  ACCESS_TOKEN = 'pk.eyJ1IjoidHJlZWJhc2UiLCJhIjoiY2xjazVueWFnMHBscDN2bXRkdjh1dHd1cyJ9.zcn36ZZJ9b0RJlYJTSZYOA';
  public init = new ReplaySubject<void>(1);
  public map: mapboxgl.Map;

  constructor() {
    console.log('MAPBOX SERVICE ACCESS TOKEN', this.ACCESS_TOKEN);
    (mapboxgl.accessToken as any) = this.ACCESS_TOKEN;
    mapboxgl.setRTLTextPlugin(
      'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
      (error: any) => {
        console.log('FAILED TO LOAD PLUGIN', error);
      },
      true // Lazy load the plugin
    );  
    this.init.next();
    this.init.complete();
  } 
}
