import { CommonModule } from "@angular/common";
import {
	Component,
	computed,
	inject,
	Input,
	OnChanges,
	SimpleChanges,
} from "@angular/core";
import { SignalService } from "@services/signal.service";
import {
	ApexChart,
	ApexAxisChartSeries,
	ApexXAxis,
	ApexPlotOptions,
	ApexFill,
	ApexDataLabels,
	NgApexchartsModule,
	ApexResponsive,
} from "ng-apexcharts";
import { SHARED_COLORS } from "@pages/transactions/components/shared-colors";

export type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	plotOptions: ApexPlotOptions;
	fill: ApexFill;
	dataLabels: ApexDataLabels;
	colors: string[];
	responsive: ApexResponsive[];
};

@Component({
	selector: "transactions-spendings-chart",
	standalone: true,
	imports: [NgApexchartsModule, CommonModule],
	templateUrl: "./spendings-chart.component.html",
	styles: "",
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
			series: [
				{
					name: "Spending",
					data: series,
				},
			],

			chart: {
				height: 350,
				width: 450,
				type: "bar",
			},
			responsive: [
				{
					breakpoint: 480,
					options: {
						chart: {
							width: 300,
						},
					},
				},
				{
					breakpoint: 768,
					options: {
						chart: {
							width: 350,
						},
					},
				},
				{
					breakpoint: 1024,
					options: {
						chart: {
							width: 400,
						},
					},
				},
				{
					breakpoint: 1440,
					options: {
						chart: {
							width: 500,
						},
					},
				},
				{
					breakpoint: 1920,
					options: {
						chart: {
							width: 370,
						},
					},
				},
				{
					breakpoint: 2560,
					options: {
						chart: {
							width: 450,
						},
					},
				},
			],
			xaxis: {
				categories: categories,
			},
			colors: SHARED_COLORS.slice(0, categories.length),
			plotOptions: {
				bar: {
					horizontal: false,
					dataLabels: {
						position: "top",
					},
					distributed: true,
				},
			},
			fill: {
				opacity: 1,
			},
			dataLabels: {
				enabled: true,
				formatter: (val: any) => `$${val.toFixed(2)}`,
			},
		};
	});
}
