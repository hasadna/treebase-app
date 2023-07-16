import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MapboxService } from '../mapbox.service';
import * as mapboxgl from 'mapbox-gl';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StateService } from '../state.service';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@UntilDestroy()
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements AfterViewInit{

  STYLE = 'mapbox://styles/treebase/clck61858001514mfunfann6j/draft';
  OWN_LAYERS = [
    'cadaster-label',
    'cadaster-border',
    'stat-areas-label',
    'stat-areas-border',
    'stat-areas-fill',
    'munis-label',
    'munis-border',
    'munis-fill',
    'parcels-label',
    'parcels-border',
    'parcels-fill',
    'roads-border',
    'canopies',
    'trees',
  ];
  CLICKS = [
    ['trees', 'trees', 'tree-id'],
    ['munis-fill', 'munis', 'muni_code'],
    ['stat-areas-fill', 'stat-areas', 'code'],
  ];
  
  @ViewChild('map') mapEl: ElementRef;
  // @ViewChild('hoverPopup') hoverPopupEl: ElementRef;

  map: mapboxgl.Map;

  focus_: string|null = null;


  constructor(private mapboxService: MapboxService, private state: StateService,
              private router: Router, private api: ApiService) {
  }

  ngAfterViewInit() {
    this.mapboxService.init.subscribe(() => {
      this.initialize();
    });
  }

  initialize() {
    const mapParams: mapboxgl.MapboxOptions = {
      container: this.mapEl.nativeElement,
      style: this.STYLE,
      minZoom: 6.4,
      attributionControl: false,
      bounds: [[34.578046, 32.162327], [35.356111, 31.690073]],
      maxBounds: [[30, 27], [40, 38]],
      preserveDrawingBuffer: true,
    };
    this.map = new mapboxgl.Map(mapParams);
    this.map.addControl(new mapboxgl.AttributionControl(), 'top-right');
    this.map.addControl(new mapboxgl.NavigationControl({showCompass: false}), 'top-left');
    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    this.map.touchPitch.disable();

    this.map.on('load', () => {
      this.CLICKS.forEach(([layer, base, prop]) => {
        this.map.on('click', layer, (e) => {
          const features = e.features;
          if (features && features.length > 0) {
            const feature: any = features[0];
            if (feature.properties?.[prop]) {
              this.router.navigate([base, feature.properties[prop]], {queryParamsHandling: 'merge'});
            }
          }
        });
      });
      this.OWN_LAYERS.forEach((layer) => {
        this.map.on('mousemove', layer, (e: mapboxgl.MapLayerMouseEvent) => {
          if (e.defaultPrevented) {
            return;
          }
          e.preventDefault();
          if (e.features && e.features.length > 0) {
            this.map.getCanvas().style.cursor = 'pointer';
          }
        });
      });
      this.map.on('mousemove', (e: mapboxgl.MapLayerMouseEvent) => {
        if (e.defaultPrevented) {
          return;
        }
        e.preventDefault();
        this.map.getCanvas().style.cursor = '';
      });
      this.state.state.pipe(
        untilDestroyed(this),
      ).subscribe((state) => {
        if (state.geo) {
          this.map.flyTo({
            center: state.geo.center,
            zoom: state.geo.zoom,
            padding: {top:0, bottom:0, left:0, right: 400}
          });
        }
        console.log('STATE', state, this.map.getStyle().layers);
        if (state.filters?.focus !== this.focus_) {
          this.focus_ = state.filters?.focus;
          if (state.focus) {
            const QUERY = state.focus.boundsQuery();
            if (QUERY) {
              this.api.query(QUERY).subscribe((res) => {
                this.map.fitBounds(res[0].bounds, {padding: {top:0, bottom:0, left:0, right: 400}});
              });
            }
          }
        }
        const extraFilters = state.focus?.mapFilters() || {};

        this.map.getStyle().layers.forEach((layer) => {
          if (this.ownLayer(layer)) {
            if (state.isLayerVisible(layer.id)) {
              this.map.setLayoutProperty(layer.id, 'visibility', 'visible');
            } else {
              this.map.setLayoutProperty(layer.id, 'visibility', 'none');
              return;
            }
            const lc = state.getLayerConfig(layer.id);
            console.log('OWN LAYER', layer.id, lc);
            const filters: any[][] = [];
            if (lc?.filter) {
              filters.push(lc.filter);
            } 
            if (extraFilters[layer.id]) {
              filters.push(extraFilters[layer.id]);
            }
            console.log('FILTERS', extraFilters, lc.filter, filters.length, ['all', ...filters]);
            if (filters.length > 1) {
              this.map.setFilter(layer.id, ['all', ...filters]);
            } else if (filters.length === 1) {
              this.map.setFilter(layer.id, filters[0]);
            } else {
              this.map.setFilter(layer.id, null);
            }
            if (lc?.paint) {
              Object.keys(lc.paint).forEach((key) => {
                this.map.setPaintProperty(layer.id, key, lc.paint[key]);
              });
            }
            if (lc?.layout) {
              Object.keys(lc.layout).forEach((key) => {
                this.map.setLayoutProperty(layer.id, key, lc.layout[key]);
              });
            }
          }
        });
      });  
    });
  }

  ownLayer(layer: mapboxgl.AnyLayer) {
    return this.OWN_LAYERS.includes(layer.id);
  }
}
