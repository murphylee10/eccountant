import { Component } from '@angular/core';
import { ApiService } from '@services/api.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import ollama from 'ollama';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'transactions-chat-dialog',
  standalone: true,
  imports: [FormsModule, FloatLabelModule, CommonModule, ButtonModule],
  templateUrl: './chat-dialog.component.html',
  styles: '',
})
export class ChatDialogComponent {
  query: string | undefined;
  answer: string | undefined;

  constructor(
    public ref: DynamicDialogRef,
    private apiService: ApiService,
  ) {}

  async askCodestralAPI(message: string, model: string = 'codestral-latest') {
    return await this.apiService.chat(model, message);
  }

  async validateqQuery(question: string, LLM_MODEL: string, PROD: boolean) {
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
    let valid = '';
    if (PROD) {
      valid = await this.askCodestralAPI(message, 'codestral-latest');
    } else {
      const response = await ollama.chat({
        model: LLM_MODEL,
        messages: [{ role: 'user', content: message }],
      });
      valid = response.message.content;
    }
    if (valid === undefined) {
      return false;
    }
    valid = valid.trimStart();
    return valid.length > 0 && valid[0].toUpperCase() === 'Y'
  }

  async generateQuery(question: string, LLM_MODEL: string, PROD: boolean) {
    const message = `
	model Transaction {
	  category: is type String and is one of 'Income', 'Transfer In', 'Transfer Out', 'Loan Payments', 'Bank Fees', 'Entertainment', 'Food and Drink', 'General Merchandise', 'Home Improvement', 'Medical', 'Personal Care', 'General Services', 'Government and Non-Profit', 'Transportation', 'Travel', 'Rent and Utilities'
	  date: is type String in the format 'YYYY-MM-DD'.
	  name: is type String is the name of the transaction.
	  amount: is type Float.
	}
	
	Question: "${question}".
	Task: write a postgreSQL query that retrieves the information requested in the Question.
	
	Requirements:
	- Respond with only the postgreSQL query.
	- Do not include formatting.
	- The current year is 2024.
	- The current month is July.
	- The date column is type String. Any date operation must be done taking this into account.
	- You must use only these relations: "Transaction".
	`;

    if (PROD) {
      return await this.askCodestralAPI(message, 'codestral-latest');
    }
    const response = await ollama.chat({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: message }],
    });
    return response.message.content;
  }

  cleanResponse(response: string) {
    const regex = /SELECT\s.*?\sFROM\s+"?(\w+)"?/g;
    response = response.replace(regex, (match, tableName) => {
      console.log('MATCH:', match);
      console.log('TABLENAME:', tableName);
      const titleCaseTableName = tableName.replace(/\b\w/g, (char: string) =>
        char.toUpperCase(),
      );
      return match.replace(tableName, titleCaseTableName);
    });
    console.log('replaced:', response);

    const content = response;
    var query = content;
    if (content.includes('```')) {
      const lines = content.split('\n');
      const idx_begin = lines.findIndex((line) => line.includes('```'));
      const idx_end = lines.findIndex(
        (line) => line.includes('```'),
        idx_begin + 1,
      );
      query = lines.slice(idx_begin + 1, idx_end).join('\n');
    }

    const TABLES = new Set(['User', 'Item', 'Account', 'Transaction']);
    const queryParts = query.trim().split(/\s+/);
    for (let i = 1; i < queryParts.length; i++) {
      if (queryParts[i - 1].toUpperCase() === 'FROM') {
        const clean = queryParts[i].replace(`"`, '');
        if (TABLES.has(clean)) {
          queryParts[i] = `"${clean}"`;
        }
      }
    }
    const formattedQuery = queryParts.join(' ');
    return formattedQuery;
  }

  async formulateResponse(
    LLM_MODEL: string,
    question: string,
    res: string,
    PROD: boolean,
  ) {
    const message = `
	Question: "${question}".
	Answer: "${res}".
	Task: say the answer in one sentence.
	`;
    if (PROD) {
      return await this.askCodestralAPI(message, 'open-mistral-7b');
    }
    const postres = await ollama.chat({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: message }],
    });
    return postres.message.content;
  }

  async queryTransactions() {
    const PROD = false;
    const question = this.query;
    if (!question) {
      return;
    }

    const LLM_MODEL = 'codestral:22b';
    const LLM_MODEL_S = 'mistral:7b';
    console.log(question);
    const valid = await this.validateqQuery(question, LLM_MODEL, PROD);
    if (!valid) {
      this.answer = 'Invalid question. Please rephrase your question.';
      return;
    }
    const response = await this.generateQuery(question, LLM_MODEL, PROD);
    console.log('response:', response);
    if (response) {
      const formattedQuery = this.cleanResponse(response);
      console.log('formatted:', formattedQuery);

      const res = JSON.stringify(await this.apiService.ask(formattedQuery));
      console.log(res);

      const cc = await this.formulateResponse(LLM_MODEL_S, question, res, PROD);
      console.log(cc);
      this.answer = cc;
    } else {
      this.answer = 'Error processing question.';
    }
  }
}
