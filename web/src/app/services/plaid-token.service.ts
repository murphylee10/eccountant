// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { Observable } from "rxjs";
import type { Bank } from "../models/bank.model";
import environment from "@environment";

@Injectable({
	providedIn: "root",
})
export class PlaidTokenService {
	private tokensUrl = "/tokens";
	private banksUrl = "/banks";

	constructor(private http: HttpClient) {}

	generateLinkToken(isSandbox: boolean): Observable<any> {
		return this.http.post(
			encodeURI(`${environment.api_url}${this.tokensUrl}/generate_link_token`),
			{ isSandbox },
		);
	}

	exchangePublicToken(
		publicToken: string,
		isSandbox: boolean,
	): Observable<any> {
		return this.http.post(
			encodeURI(
				`${environment.api_url}${this.tokensUrl}/exchange_public_token`,
			),
			{ publicToken, isSandbox },
		);
	}

	getConnectedBanks(): Observable<Bank[]> {
		return this.http.get<Bank[]>(
			encodeURI(`${environment.api_url}${this.banksUrl}/list`),
		);
	}

	deactivateBank(itemId: string): Observable<any> {
		return this.http.post(
			encodeURI(`${environment.api_url}${this.banksUrl}/deactivate`),
			{ itemId },
		);
	}
}
