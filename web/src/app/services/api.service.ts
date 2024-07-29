// biome-ignore lint/style/useImportType: <explanation>
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import environment from "@environment";
import { take } from "rxjs";
import type { PlaidTransaction } from "../models/transaction.model";
import { Subscription } from "../models/subscription.model";

@Injectable({
	providedIn: "root",
})
export class ApiService {
	private transactionsUrl = "/transactions";
	private banksUrl = "/banks";
	private subscriptionsUrl = "/subscriptions";

	constructor(private http: HttpClient) {}

	// Custom implementations using httpclient.
	// Necessary for interceptor to attach auth headers.
	private async get<T>(endpoint: string) {
		return new Promise<T>((res, rej) => {
			this.http
				.get<T>(encodeURI(`${environment.api_url}${endpoint}`))
				.pipe(take(1))
				.subscribe({ next: res, error: rej });
		});
	}

	private async post<T>(endpoint: string, body: any) {
		return new Promise<T>((res, rej) => {
			this.http
				.post<T>(encodeURI(`${environment.api_url}${endpoint}`), body)
				.pipe(take(1))
				.subscribe({ next: res, error: rej });
		});
	}

	private async patch<T>(endpoint: string, body: any): Promise<T> {
		return new Promise<T>((res, rej) => {
			this.http
				.patch<T>(encodeURI(`${environment.api_url}${endpoint}`), body)
				.pipe(take(1))
				.subscribe({ next: res, error: rej });
		});
	}

	private async delete<T>(endpoint: string, body: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.http
				.request<void>(
					"delete",
					encodeURI(`${environment.api_url}${endpoint}`),
					{
						body,
					},
				)
				.pipe(take(1))
				.subscribe({
					next: () => resolve(),
					error: (err: HttpErrorResponse) => reject(err),
				});
		});
	}

	public async exampleAuth() {
		return this.get<{
			success: boolean;
			msg: string;
		}>("/example/auth").catch((err) => {
			return { success: false, msg: err };
		});
	}

	public async exampleAuthScope() {
		return this.get<{
			success: boolean;
			msg: string;
		}>("/example/authScope").catch((err) => {
			return { success: false, msg: err };
		});
	}

	public async exampleEvent() {
		return this.get<{
			success: boolean;
		}>("/example/event").catch(() => {
			return { success: false };
		});
	}

	public async storeUser(
		userId: string,
		email: string,
	): Promise<{ success: boolean; msg: string }> {
		return this.post<{
			success: boolean;
			msg: string;
		}>("/users/register", { userId, email }).catch((err) => {
			return { success: false, msg: err.msg };
		});
	}

	async addTransaction(transaction: {
		name: string;
		date: string;
		category: string;
		amount: number;
		isIncoming: boolean;
	}) {
		return this.post(`${this.transactionsUrl}/add`, transaction);
	}

	async deleteUserTransaction(transactionId: string) {
		return this.delete(`${this.transactionsUrl}/delete/${transactionId}`, {});
	}

	/* PLAID API */

	getTransactionsByDateRange(
		startDate: string,
		endDate: string,
	): Promise<PlaidTransaction[]> {
		return this.get<PlaidTransaction[]>(
			`${this.transactionsUrl}/date-range?startDate=${startDate}&endDate=${endDate}`,
		);
	}

	getFirstTransaction(): Promise<PlaidTransaction> {
		return this.get<PlaidTransaction>(
			`${this.transactionsUrl}/first-transaction`,
		);
	}

	getLastTransaction(): Promise<PlaidTransaction> {
		return this.get<PlaidTransaction>(
			`${this.transactionsUrl}/last-transaction`,
		);
	}

	getRecentTransactions(): Promise<PlaidTransaction[]> {
		return this.get<PlaidTransaction[]>(`${this.transactionsUrl}/recent`);
	}

	public async getBanks(): Promise<{ id: string; bank_name: string }[]> {
		return this.get<{ id: string; bank_name: string }[]>(
			`${this.banksUrl}/list`,
		).catch((err) => {
			return [];
		});
	}

	public async getAccounts(itemId: string): Promise<any[]> {
		return this.get<any[]>(`${this.banksUrl}/accounts/${itemId}`).catch(
			(err) => {
				return [];
			},
		);
	}

	public async deactivateBank(itemId: string) {
		return this.post<any>(`${this.banksUrl}/deactivate`, { itemId });
	}

	getTransactionsByYear(year: number): Promise<PlaidTransaction[]> {
		return this.get<PlaidTransaction[]>(`${this.transactionsUrl}/year/${year}`);
	}

	fireWebhook() {
		return this.post<any>("/debug/generate_webhook", {});
	}

	/* LLM Endpoint */
	ask(query: string): Promise<any> {
		return this.post<any>(`${this.transactionsUrl}/ask`, { query });
	}

	chat(model: string, message: string): Promise<string> {
		const body = {
			model,
			messages: [{ role: "user", content: message }],
		};

		return new Promise<string>((resolve, reject) => {
			this.http
				.post<string>(encodeURI(`${environment.api_url}/chat`), body)
				.subscribe({
					next: (response: string) => {
						resolve(response);
					},
					error: (error) => {
						reject(error);
					},
				});
		});
	}

	/* Subscriptons */
	getSubscriptions(): Promise<{
		accepted: Subscription[];
		pending: Subscription[];
		removed: Subscription[];
	}> {
		return this.get<{
			accepted: Subscription[];
			pending: Subscription[];
			removed: Subscription[];
		}>(`${this.subscriptionsUrl}`);
	}

	acceptSubscription(subscriptionId: string): Promise<void> {
		return this.post<void>(`${this.subscriptionsUrl}/accept`, {
			subscriptionId,
		});
	}

	removeSubscription(subscriptionId: string): Promise<void> {
		return this.delete<void>(`${this.subscriptionsUrl}/${subscriptionId}`, {});
	}

	restoreSubscription(subscriptionId: string): Promise<void> {
		return this.post<void>(
			`${this.subscriptionsUrl}/restore/${subscriptionId}`,
			{},
		);
	}

	changeSubscriptionDay(subscriptionId: string, day: number): Promise<void> {
		return this.patch<void>(`${this.subscriptionsUrl}/change-day`, {
			subscriptionId,
			day,
		});
	}

	changeSubscriptionMonth(
		subscriptionId: string,
		month: number,
	): Promise<void> {
		return this.patch<void>(`${this.subscriptionsUrl}/change-month`, {
			subscriptionId,
			month,
		});
	}
}
