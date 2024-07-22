import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualSpendingsChartComponent } from './annual-spendings-chart.component';

describe('AnnualSpendingsChartComponent', () => {
  let component: AnnualSpendingsChartComponent;
  let fixture: ComponentFixture<AnnualSpendingsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnualSpendingsChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnualSpendingsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
