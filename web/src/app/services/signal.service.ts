import { Injectable, signal } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class SignalService {
	categoryData = signal<{ [key: string]: number }>({});
	monthlySpendData = signal<{ [key: string]: number }>({});

	updateCategoryData(data: { [key: string]: number }) {
		this.categoryData.set(data);
	}

	updateMonthlySpendData(data: { [key: string]: number }) {
		this.monthlySpendData.set(data);
	}
}
