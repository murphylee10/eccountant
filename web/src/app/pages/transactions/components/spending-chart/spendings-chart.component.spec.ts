import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendingChartComponent } from './spendings-chart.component';

describe('SpendingChartComponent', () => {
  let component: SpendingChartComponent;
  let fixture: ComponentFixture<SpendingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpendingChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpendingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
