import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
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
  imports: [NgApexchartsModule],
  templateUrl: './distribution-chart.component.html',
  styles: [],
})
export class DistributionChartComponent implements OnChanges {
  @Input() categoryData: { [key: string]: number } = {};

  public chartOptions: ChartOptions = {
    series: [],
    chart: {
      width: 500,
      type: 'donut',
    },
    labels: [],
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryData']) {
      this.updateChart();
    }
  }

  updateChart() {
    const categories = Object.keys(this.categoryData);
    const data = Object.values(this.categoryData);

    this.chartOptions.series = data;
    this.chartOptions.labels = categories;
  }
}
