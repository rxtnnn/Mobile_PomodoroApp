import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PomodorotimerPage } from './pomodorotimer.page';

const routes: Routes = [
  {
    path: '',
    component: PomodorotimerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PomodorotimerPageRoutingModule {}
