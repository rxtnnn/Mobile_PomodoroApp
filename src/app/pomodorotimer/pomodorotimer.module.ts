import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PomodorotimerPageRoutingModule } from './pomodorotimer-routing.module';

import { PomodorotimerPage } from './pomodorotimer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PomodorotimerPageRoutingModule
  ],
  declarations: [PomodorotimerPage]
})
export class PomodorotimerPageModule {}
