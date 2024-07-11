import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges, OnChanges, inject, computed } from '@angular/core';
import { SignalService } from '@services/signal.service';
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: any;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'transactions-distribution-chart',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './distribution-chart.component.html',
  styles: [],
})
export class DistributionChartComponent {
  private signalService = inject(SignalService);

  categoryData = this.signalService.categoryData;

  isDataAvailable = computed(() => Object.keys(this.categoryData()).length > 0);

  chartOptions = computed<ChartOptions>(() => {
    console.log(this.categoryData())
    const data = this.categoryData();
    const categories = Object.keys(data);
    const series = Object.values(data);

    return {
      series: series,
      chart: {
        width: 500,
        type: 'donut',
      },
      labels: categories,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  });
}