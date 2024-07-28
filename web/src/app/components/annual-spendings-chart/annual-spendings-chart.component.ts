// annual-spend-chart.component.ts
import { CommonModule } from "@angular/common";
import { Component, Input, type OnInit, inject, computed } from "@angular/core";
import { SignalService } from "@services/signal.service";
import {
	type ApexAxisChartSeries,
	type ApexChart,
	type ApexXAxis,
	type ApexTitleSubtitle,
	NgApexchartsModule,
	type ApexResponsive,
} from "ng-apexcharts";

export type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	responsive: ApexResponsive[];
	// title: ApexTitleSubtitle;
};

@Component({
	selector: "transactions-annual-spendings-chart",
	standalone: true,
	imports: [NgApexchartsModule, CommonModule],
	templateUrl: "./annual-spendings-chart.component.html",
	styles: [],
})
export class AnnualSpendingsChartComponent implements OnInit {
	@Input() year: number = new Date().getFullYear(); // Default to the current year

	private signalService = inject(SignalService);

	monthlySpendData = this.signalService.monthlySpendData;

	isDataAvailable = computed(
		() => Object.keys(this.monthlySpendData()).length > 0,
	);

	chartOptions = computed<ChartOptions>(() => {
		const data = this.monthlySpendData();
		const labels = this.getMonthYearLabels(data, this.year);
		const series = Object.values(data);

		return {
			series: [
				{
					name: "Monthly Spend",
					data: series,
				},
			],
			chart: {
				width: 400,
				height: 350,
				type: "line",
			},
			xaxis: {
				categories: labels,
				title: {
					text: "Months",
				},
			},
			// title: {
			// 	text: "Monthly Spend Over the Past Year",
			// },
			responsive: [
				{
					breakpoint: 480,
					options: {
						chart: {
							width: 300,
						},
					},
				},
			],
		};
	});

	ngOnInit() {
		// Fetch data if needed
	}

	private getMonthYearLabels(
		data: { [key: string]: number },
		year: number,
	): string[] {
		const monthNames = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		const labels = Object.keys(data).map((month) => {
			const monthIndex = Number.parseInt(month, 10) - 1; // Convert to 0-based index
			return `${monthNames[monthIndex]} ${year}`;
		});
		return labels;
	}
}
