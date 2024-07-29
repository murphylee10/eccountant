import { Component } from "@angular/core";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { ApiService } from "@services/api.service";
// biome-ignore lint/style/useImportType: Angular wants the whole module imported not just the type
import { DynamicDialogRef } from "primeng/dynamicdialog";
// import ollama from 'ollama';
import { FormsModule } from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import environment from "@environment";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { AuthService } from "@services/auth.service";

@Component({
	selector: "transactions-chat-dialog",
	standalone: true,
	imports: [
		FormsModule,
		FloatLabelModule,
		CommonModule,
		ButtonModule,
		ProgressSpinnerModule,
	],
	templateUrl: "./chat-dialog.component.html",
	styles: "",
})
export class ChatDialogComponent {
	query: string | undefined;
	answer: string | undefined;
	displayedAnswer = "";
	isLoading = false;

	constructor(
		public ref: DynamicDialogRef,
		private apiService: ApiService,
		private authService: AuthService,
	) {}

	askCodestralAPI(message: string, model = "codestral-latest") {
		return this.apiService.chat(model, message);
	}

	validateqQuery(question: string, LLM_MODEL: string, prod: boolean) {
		const message = `
	    Question "${question}".
	    Task: Filter the question through the following list. If a single requirement is not satisfied return "N" immediately.
	    - Determine whether the user has permission to execute the query. The question definitely cannot cause an injection attack, drop any relations, or update or alter any relation content.
	    - The query must be a question not a statement or command or comment.
	    - The query must be about the financial transactions of the user.
	    Note:
	    - Do not explain your answer.
	    - Answer must be "Y" or "N".
	  `;
		return this.askCodestralAPI(message, "codestral-latest").then((valid) => {
			if (valid === undefined) {
				return false;
			}
			valid = valid.trimStart();
			return valid.length > 0 && valid[0].toUpperCase() === "Y";
		});
	}

	generateQuery(
		question: string,
		LLM_MODEL: string,
		prod: boolean,
	): Promise<string | undefined> {
		const monthNames: string[] = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];

		const now: Date = new Date();
		const month: string = monthNames[now.getMonth()];
		const year: number = now.getFullYear();

		return new Promise((resolve, reject) => {
			this.authService.getUserId().subscribe((userId) => {
				if (userId) {
					const message = `
	model Transaction {
	  category: is type String and is one of 'Income', 'Transfer In', 'Transfer Out', 'Loan Payments', 'Bank Fees', 'Entertainment', 'Food and Drink', 'General Merchandise', 'Home Improvement', 'Medical', 'Personal Care', 'General Services', 'Government and Non-Profit', 'Transportation', 'Travel', 'Rent and Utilities'
	  date: is type String in the format 'YYYY-MM-DD'.
	  name: is type String is the name of the transaction.
	  amount: is type Float.
	}

	Other relevant models:
	model User {
		id             String        @id @default(uuid())
		email          String?
		items          Item[]
		transactions   Transaction[]
		subscriptions  Subscription[]
		}

		model Item {
		id                 String @id @default(uuid())
		user_id            String
		access_token       String
		transaction_cursor String?
		bank_name          String?
		is_active          Boolean @default(true)
		isSandbox          Boolean @default(true)
		user               User    @relation(fields: [user_id], references: [id], onDelete: Cascade)
		accounts           Account[]
		subscriptions      Subscription[]
		}

		model Account {
		id           String @id @default(uuid())
		item_id      String
		name         String?
		item         Item    @relation(fields: [item_id], references: [id], onDelete: Cascade)
		transactions Transaction[]
		}
	
	Question: "${question}".
	Task: write a postgreSQL query that retrieves the information requested in the Question.
	
	Requirements:
	- Respond with only the postgreSQL query.
	- Do not include formatting.
	- The current year is ${year}.
	- The current month is ${month}.
	- The date column is type String. Any date operation must be done taking this into account.
	- Should mainly be based on model Transaction.
	- The userId needs to be '${userId}'.
	`;

					this.askCodestralAPI(message, "codestral-latest")
						.then((response) => {
							resolve(response);
						})
						.catch((error) => {
							reject(error);
						});
				} else {
					reject("User ID is not available.");
				}
			});
		});
	}

	cleanResponse(response: string) {
		const regex = /SELECT\s.*?\sFROM\s+"?(\w+)"?/g;
		response = response.replace(regex, (match, tableName) => {
			const titleCaseTableName = tableName.replace(/\b\w/g, (char: string) =>
				char.toUpperCase(),
			);
			return match.replace(tableName, titleCaseTableName);
		});
		const content = response;
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

	formulateResponse(
		LLM_MODEL: string,
		question: string,
		res: string,
		prod: boolean,
	) {
		const message = `
	Question: "${question}".
	Answer: "${res}".
	Task: say the answer in one sentence.
	`;
		return this.askCodestralAPI(message, "open-mistral-7b");
	}

	typeResponse(answer: string) {
		let index = 0;
		this.displayedAnswer = "";
		const typingInterval = setInterval(() => {
			if (index < answer.length) {
				this.displayedAnswer += answer.charAt(index);
				index++;
			} else {
				clearInterval(typingInterval);
			}
		}, 50); // Adjust typing speed by changing the interval (50ms here)
	}

	queryTransactions() {
		const question = this.query;
		if (!question) {
			return;
		}

		const LLM_MODEL = "codestral:22b";
		const LLM_MODEL_S = "mistral:7b";
		this.isLoading = true;
		this.validateqQuery(question, LLM_MODEL, environment.production)
			.then((valid) => {
				if (!valid) {
					this.isLoading = false;
					this.answer = "Invalid question. Please rephrase your question.";
					throw new Error("Invalid question.");
				}
				return this.generateQuery(question, LLM_MODEL, environment.production);
			})
			.then((response) => {
				if (!response) {
					this.isLoading = false;
					this.answer = "Error processing question.";
					throw new Error("Error processing question.");
				}
				const formattedQuery = this.cleanResponse(response);
				return this.apiService.ask(formattedQuery);
			})
			.then((res) => {
				const resString = JSON.stringify(res);
				return this.formulateResponse(
					LLM_MODEL_S,
					question,
					resString,
					environment.production,
				);
			})
			.then((cc) => {
				this.isLoading = false;
				this.answer = cc;
				this.typeResponse(cc);
			})
			.catch((error) => {
				this.isLoading = false;
				console.error(error);
			});
	}
}
