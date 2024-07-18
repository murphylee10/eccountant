import { Component } from "@angular/core";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { DynamicDialogRef } from "primeng/dynamicdialog";
import ollama, { type ChatResponse } from "ollama";
import { FormsModule } from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";

@Component({
	selector: "transactions-chat-dialog",
	standalone: true,
	imports: [FormsModule, FloatLabelModule, CommonModule, ButtonModule],
	templateUrl: "./chat-dialog.component.html",
	styles: "",
})
export class ChatDialogComponent {
	query: string | undefined;
	answer: string | undefined;

	constructor(
		public ref: DynamicDialogRef,
		private apiService: ApiService,
	) {}

	async generateQuery(question: string, LLM_MODEL: string) {
		return await ollama.chat({
			model: LLM_MODEL,
			messages: [
				{
					role: "user",
					content: `
model Transaction {
  category: is type String and is one of 'Income', 'Transfer In', 'Transfer Out', 'Loan Payments', 'Bank Fees', 'Entertainment', 'Food and Drink', 'General Merchandise', 'Home Improvement', 'Medical', 'Personal Care', 'General Services', 'Government and Non-Profit', 'Transportation', 'Travel', 'Rent and Utilities'
  date: is type String in the format 'YYYY-MM-DD'.
  name: is type String is the name of the transaction.
  amount: is type Float.
}

Question: "${question}".
Task: understand the question is asking and write a postgreSQL query to retrieve the information.

Requirements:
- Respond with only the postgreSQL query.
- Do not include formatting.
- The current year is 2024.
- The current month is July.
- The date column is type String. Any date operation must be done taking this into account.
				 `,
				},
			],
		});
		// - The current date at the time of writing is 2024-07-15. Therefore, if the question does not specify a year, use 2024 and if the question does not specify a month, use July, otherwise use the year or month that is specified.
		// - Do not use any non-postgreSQL functions.
		// - The query should be simple and efficient.
		// - All relations names in double quotes but do not escape the quotes.
		// - The date is type string, so compare dates using string comparison i.e., >=, < ,etc. otherwise you need to convert to a date object before comparing.
		// - You must compare dates using string comparison.
	}

	cleanResponse(response: ChatResponse) {
		const content = response.message.content;
		let query = content;
		if (content.includes("```")) {
			const lines = content.split("\n");
			const idx_begin = lines.findIndex((line) => line.includes("```"));
			const idx_end = lines.findIndex(
				(line) => line.includes("```"),
				idx_begin + 1,
			);
			query = lines.slice(idx_begin + 1, idx_end).join("\n");
		}

		const TABLES = new Set(["User", "Item", "Account", "Transaction"]);
		const queryParts = query.trim().split(/\s+/);
		for (let i = 1; i < queryParts.length; i++) {
			if (queryParts[i - 1].toUpperCase() === "FROM") {
				const clean = queryParts[i].replace(`"`, "");
				if (TABLES.has(clean)) {
					queryParts[i] = `"${clean}"`;
				}
			}
		}
		const formattedQuery = queryParts.join(" ");
		return formattedQuery;
	}

	async formulateResponse(LLM_MODEL: string, question: string, res: string) {
		const postres = await ollama.chat({
			model: LLM_MODEL,
			messages: [
				{
					role: "user",
					content: `
  Question: "${question}".
  Answer: "${res}".
  Task: say the answer in one sentence.
           `,
				},
			],
		});
		const cc = postres.message.content;
		return cc;
	}

	async queryTransactions() {
		const question = this.query;
		if (!question) {
			return;
		}
		// const question = "How much did I spend this month?";
		// const question = "How much did I spend last month?";
		// const question = "How much did I spend on groceries in June?";
		// const question = "How much did I spend between april 24th and june 29?";
		// const question = "Which month did I spend the most and how much?";
		// const question = "How much have I spent on KFC?";
		// const question = "How much have I spent on KFC all time?";
		// const question = "How much did I spend in august 2022?";
		// const question = "How much did I spend in July?";
		// const question = "How much did I spend on food and drink in June?";
		// const question = "How much did I spend on food in June?";

		const LLM_MODEL = "codestral:22b";
		// const LLM_MODEL = 'qwen2:72b';
		// const LLM_MODEL = 'mistral:7b-instruct'
		// const LLM_MODEL = 'codellama:13b-instruct'
		// const LLM_MODEL = 'phi3:14b-instruct'
		// const LLM_MODEL = 'phi3:14b-instruct'
		// const LLM_MODEL = 'deepseek-coder-v2:16b';
		// const LLM_MODEL = 'qwen';
		// const LLM_MODEL = 'llama3:8b';

		console.log(question);
		const response = await this.generateQuery(question, LLM_MODEL);
		console.log("response:", response.message.content);
		const formattedQuery = this.cleanResponse(response);
		console.log("formatted:", formattedQuery);

		const res = JSON.stringify(await this.apiService.ask(formattedQuery));
		console.log(res);

		const cc = await this.formulateResponse(LLM_MODEL, question, res);
		console.log(cc);
		this.answer = cc;
	}
}
