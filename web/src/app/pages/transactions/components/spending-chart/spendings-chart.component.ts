import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
  imports: [NgApexchartsModule],
  templateUrl: './spendings-chart.component.html',
  styles: '',
})
export class SpendingsChartComponent implements OnChanges {
  @Input() categoryData: { [key: string]: number } = {};

  public chartOptions: ChartOptions = {
    series: [],
    chart: {
      height: 350,
      width: 500,
      type: 'bar',
    },
    xaxis: {
      categories: [],
    },
    plotOptions: {
      bar: {
        horizontal: false,
        dataLabels: {
          position: 'top',
        },
      },
    },
    fill: {
      opacity: 1,
    },
    dataLabels: {
      enabled: true,
      formatter: (val: any) => '$' + val.toFixed(2),
    },
    colors: [
      '#008FFB',
      '#00E396',
      '#FEB019',
      '#FF4560',
      '#775DD0',
      '#546E7A',
      '#26a69a',
      '#D10CE8',
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

    this.chartOptions.series = [
      {
        name: 'Spending',
        data: data,
      },
    ];
    this.chartOptions.xaxis = {
      categories: categories,
    };
  }
}
