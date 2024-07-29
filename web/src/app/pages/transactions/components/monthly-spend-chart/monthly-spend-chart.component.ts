import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import {
	ApexChart,
	ApexAxisChartSeries,
	ApexXAxis,
	ApexPlotOptions,
	ApexFill,
	ApexDataLabels,
	NgApexchartsModule,
} from "ng-apexcharts";

type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	plotOptions: ApexPlotOptions;
	fill: ApexFill;
	dataLabels: ApexDataLabels;
};

@Component({
	selector: "transactions-monthly-spend-chart",
	standalone: true,
	imports: [NgApexchartsModule],
	templateUrl: "./monthly-spend-chart.component.html",
	styles: "",
})
export class MonthlySpendChartComponent implements OnChanges {
	@Input() monthlySpendData: { [key: string]: number } = {};

	public chartOptions: ChartOptions = {
		series: [],
		chart: {
			height: 350,
			type: "bar",
			stacked: true,
		},
		xaxis: {
			categories: [],
		},
		plotOptions: {
			bar: {
				horizontal: false,
				dataLabels: {
					position: "top",
				},
			},
		},
		fill: {
			opacity: 1,
		},
		dataLabels: {
			enabled: true,
			formatter: (val: any) => val.toFixed(2),
		},
	};

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["monthlySpendData"]) {
			this.updateChart();
		}
	}

	updateChart() {
		const months = Object.keys(this.monthlySpendData);
		const data = Object.values(this.monthlySpendData);

		this.chartOptions.series = [
			{
				name: "Monthly Spend",
				data: data,
			},
		];
		this.chartOptions.xaxis = {
			categories: months,
		};
	}
}
