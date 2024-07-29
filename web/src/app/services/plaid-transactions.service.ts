import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import environment from "@environment";
import type { Observable } from "rxjs";
import type { PlaidTransaction } from "../models/transaction.model";

@Injectable({
	providedIn: "root",
})
export class PlaidTransactionsService {
	private transactionsUrl = "/transactions";
	constructor(private http: HttpClient) {}

	getTransactions(): Observable<PlaidTransaction[]> {
		return this.http.get<PlaidTransaction[]>(
			encodeURI(`${environment.api_url}${this.transactionsUrl}/`),
		);
	}

	getTransactionsByDateRange(
		startDate: string,
		endDate: string,
	): Observable<PlaidTransaction[]> {
		return this.http.get<PlaidTransaction[]>(
			encodeURI(
				`${environment.api_url}${this.transactionsUrl}/date-range?startDate=${startDate}&endDate=${endDate}`,
			),
		);
	}
}
