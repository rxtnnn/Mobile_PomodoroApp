import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PomodoroPage } from './pomodorotimer.page';

describe('PomodorotimerPage', () => {
  let component: PomodoroPage;
  let fixture: ComponentFixture<PomodoroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PomodoroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
