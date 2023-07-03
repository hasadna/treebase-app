import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { TreesComponent } from './trees/trees.component';
import { TreeComponent } from './tree/tree.component';
import { MuniComponent } from './muni/muni.component';
import { MunisComponent } from './munis/munis.component';
import { StatAreaComponent } from './stat-area/stat-area.component';
import { StatAreasComponent } from './stat-areas/stat-areas.component';

const routes: Routes = [
  { path: 'trees', component: TreesComponent },
  { path: 'trees/:id', component: TreeComponent },
  { path: 'munis', component: MunisComponent },
  { path: 'munis/:id', component: MuniComponent },
  { path: 'stat-areas', component: StatAreasComponent },
  { path: 'stat-areas/:id', component: StatAreaComponent },
  { path: '', component: AboutComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
