import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TreeComponent } from './tree/tree.component';
import { TreesComponent } from './trees/trees.component';
import { AboutComponent } from './about/about.component';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { FilterComponent } from './filter/filter.component';
import { MapComponent } from './map/map.component';
import { ContentComponent } from './content/content.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MunisComponent } from './munis/munis.component';
import { MuniComponent } from './muni/muni.component';
import { StatAreasComponent } from './stat-areas/stat-areas.component';
import { StatAreaComponent } from './stat-area/stat-area.component';
import { RegionComponent } from './region/region.component';
import { SummaryComponent } from './summary/summary.component';
import { LegendComponent } from './legend/legend.component';
import { SearchComponent } from './search/search.component';
import { ShareComponent } from './share/share.component';
import { ExportComponent } from './export/export.component';

@NgModule({
  declarations: [
    AppComponent,
    TreeComponent,
    TreesComponent,
    AboutComponent,
    LayoutComponent,
    HeaderComponent,
    FilterComponent,
    MapComponent,
    ContentComponent,
    MunisComponent,
    MuniComponent,
    StatAreasComponent,
    StatAreaComponent,
    RegionComponent,
    SummaryComponent,
    LegendComponent,
    SearchComponent,
    ShareComponent,
    ExportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatTooltipModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
