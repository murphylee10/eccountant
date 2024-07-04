import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import environment from "@environment";
import { Observable } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class PlaidTransactionsService {
	private transactionsUrl = "/transactions";
	constructor(private http: HttpClient) {}

	getTransactions(): Observable<any> {
		return this.http.get<any>(
			encodeURI(`${environment.api_url}${this.transactionsUrl}/`),
		);
	}
}
