import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlySpendChartComponent } from './monthly-spend-chart.component';

describe('MonthlySpendChartComponent', () => {
  let component: MonthlySpendChartComponent;
  let fixture: ComponentFixture<MonthlySpendChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlySpendChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlySpendChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
