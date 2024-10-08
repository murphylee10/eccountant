import { CommonModule } from "@angular/common";
import {
	Component,
	Input,
	SimpleChanges,
	OnChanges,
	inject,
	computed,
} from "@angular/core";
import { SignalService } from "@services/signal.service";
import {
	ApexChart,
	ApexNonAxisChartSeries,
	ApexResponsive,
	NgApexchartsModule,
} from "ng-apexcharts";
import { SHARED_COLORS } from "../../pages/transactions/components/shared-colors";

export type ChartOptions = {
	series: ApexNonAxisChartSeries;
	chart: ApexChart;
	labels: any;
	responsive: ApexResponsive[];
	colors: string[];
};

@Component({
	selector: "transactions-distribution-chart",
	standalone: true,
	imports: [NgApexchartsModule, CommonModule],
	templateUrl: "./distribution-chart.component.html",
	styles: [],
})
export class DistributionChartComponent {
	private signalService = inject(SignalService);

	categoryData = this.signalService.categoryData;

	isDataAvailable = computed(() => Object.keys(this.categoryData()).length > 0);

	chartOptions = computed<ChartOptions>(() => {
		const data = this.categoryData();
		const categories = Object.keys(data);
		const series = Object.values(data);

		return {
			series: series,
			chart: {
				width: 400,
				type: "donut",
				// sparkline: {
				// 	enabled: true,
				// },
			},
			labels: categories,
			colors: SHARED_COLORS.slice(0, categories.length),
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
		};
	});
}
