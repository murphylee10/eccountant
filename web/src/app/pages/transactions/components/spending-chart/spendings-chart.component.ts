import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SignalService } from '@services/signal.service';
import {
  ApexChart,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexPlotOptions,
  ApexFill,
  ApexDataLabels,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  dataLabels: ApexDataLabels;
  colors: string[];
};

@Component({
  selector: 'transactions-spendings-chart',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './spendings-chart.component.html',
  styles: '',
})
export class SpendingsChartComponent {
  private signalService = inject(SignalService);

  categoryData = this.signalService.categoryData;

  isDataAvailable = computed(() => Object.keys(this.categoryData()).length > 0);

  chartOptions = computed<ChartOptions>(() => {
    const data = this.categoryData();
    const categories = Object.keys(data);
    const series = Object.values(data);

    return {
      series: [{
        name: 'Spending',
        data: series
      }],
      chart: {
        height: 350,
        width: 500,
        type: 'bar'
      },
      xaxis: {
        categories: categories
      },
      plotOptions: {
        bar: {
          horizontal: false,
          dataLabels: {
            position: 'top'
          }
        }
      },
      fill: {
        opacity: 1
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: any) {
          return '$' + val.toFixed(2);
        }
      },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8']
    };
  });
}
