# Eccountant Project Proposal

## Notes For Submission
- Production Link: https://eccountant.live/
- Video Demo: https://www.youtube.com/watch?v=SlTgYZaLusc
- IF YOU WISH TO USE SANDBOX DATA INSTEAD OF PERSONAL INFO: the credentials on the popup are username: user_good and password: pass_good
- Disclaimer: You may notice you have data only as far back as April 2024. This is because Plaid now does this by default for limited production accounts. We believed it was best to leave it like this to minimize the number of API calls anyways because of Plaid's transition from development accounts to limited production accounts (which is way more frugal).

## Project Metadata

Project Title: Eccountant

Team Name: Angular

## Project Team

| Full Name     | UTORID   | Student Number | Email                           | Best way to Connect | Slack User Name |
| ------------- | -------- | -------------- | ------------------------------- | ------------------- | --------------- |
| Chad Rossouw  | rossouw2 | 1008873088     | chad.rossouw@mail.utoronto.ca   | 437 262 3168        | Chad Rossouw    |
| Murphy Lee    | leemurph | 1008897650     | murphy.lee@mail.utoronto.ca     | 416 831 0673        | Murphy Lee      |
| Vincent Zhang |          |                | vincentz.zhang@mail.utoronto.ca |                     | Vincent Zhang   |

## Project Outline

### Brief Description

Eccountant is an intuitive and user-friendly single-page web application designed to empower users to track their spending seamlessly. The application integrates with various financial institutions using Plaid's API to gather and categorize credit card and bank transaction data, providing users with a comprehensive overview of their financial activities in one centralized location. Eccountant aims to simplify financial management by offering insightful charts and visuals that highlight spending patterns across different categories.

### User Flow

1. **User Registration and Authentication:**

   - Users sign up and securely authenticate their accounts.
   - Integration with Plaid's API to connect users' bank and credit card accounts.

2. **Dashboard Overview:**

   - Users are greeted with a dashboard displaying a summary of their financial health.
   - Key metrics such as total balance, recent transactions, and spending trends are highlighted.

3. **Transaction Import and Categorization:**

   - Automated import of transaction data from connected financial accounts.
   - Transactions are categorized (e.g., groceries, utilities, entertainment) using Plaid's API functionality.

4. **Detailed Spending Analysis Page:**
   - Users can view detailed charts and graphs illustrating their spending habits.
   - Visuals include pie charts for category-wise spending, line graphs for spending trends over time, and bar charts for monthly expenditures.
   - Graphs will include filters for time and category of transaction.

### Conclusion

Eccountant aims to provide a comprehensive solution for personal financial management, offering users an easy-to-use interface, powerful analytics, and robust security. By leveraging modern web technologies and Plaid's API, Eccountant strives to be the go-to application for individuals looking to gain control over their financial lives.

This project proposal outlines the vision for Eccountant, focusing on delivering a valuable tool for users to manage and understand their financial activities better.

## Fulfilling Required Elements

Eccountant will meet the requirements as follows:

- The application will utilize Angular as the frontend framework, ensuring it is a Single Page Application (SPA) and meeting the criteria of not being a React app or a mobile app framework.
- The backend will be powered by Express, providing a robust and efficient core API.
- The API will adhere to RESTful principles, ensuring clear and consistent communication between the frontend and backend.
- Deployment will be handled using Docker and Docker Compose, ensuring a consistent and reproducible environment on a Virtual Machine.
- All deployment files, including Continuous Integration (CI) configurations for building images, will be committed to GitHub, ensuring transparency and ease of access.
- The application will be accessible to the general public without requiring additional steps, ensuring ease of use.
- Integration with the Plaid API (a third-party API) will be implemented to securely gather financial data.
- OAuth 2.0 will be used for secure and scalable authentication and authorization.
- **Database Integration:**
  - **User Data Storage:** A relational database (PostgreSQL) will be used to store user data, including authentication information, connected bank accounts, and preferences.
  - **Transaction Storage:** All imported transaction data will be stored in the database to allow for efficient querying and analysis.
  - **Categorization Data:** Categories and related metadata will be stored in the database to support dynamic and flexible categorization of transactions.
  - **Analytics Data:** Aggregated data for generating charts and graphs will be stored and indexed in the database to provide quick and responsive analytics to users.

## Fulfilling Additional Requirements

1. **Using Plaid's Webhooks:**

   - **Transactions Webhooks:**
     - `TRANSACTIONS_SYNC`: This webhook is fired whenever there are new or updated transactions available for the user. It provides a unified and streamlined way to ensure that the user's transaction data is always up-to-date. The `TRANSACTIONS_SYNC` webhook simplifies the process by consolidating the functionality of multiple individual webhooks, such as `INITIAL_UPDATE`, `HISTORICAL_UPDATE`, `DEFAULT_UPDATE`, and `TRANSACTIONS_REMOVED`. This ensures that users have the most accurate and current financial information in Eccountant at all times.

2. **A Piece of the Application Being Real-Time:**
   - The dashboard overview and the detailed spending analysis page will be updated in real-time as new transactions are detected through Plaid's webhooks. This means that users will see their latest spending activities and updated financial summaries without needing to manually refresh the page.
   - Real-time notifications will be implemented to alert users about important events such as detecting a new subscription (if we decide to implement this additional feature, check "Potential Additional Features" below). These notifications will help users stay informed and make timely financial decisions.

3. **Long Running Task:**
   - Our intended 2/3 fulfillments are webhooks and real-time functionality, but we hae also implemented a natural language querying feature which uses an LLM on the backend (we believe this counts as long-running).

## Potential Additional Features

Variations of Eccountant have already been implemented, but we believe the following additional features would really make our application stand out:

- **Manual Spending Input:**

  - Allow users to manually input cash transactions or expenses from accounts not linked through Plaid, ensuring a complete picture of their financial health.

- **Subscription Detection:**

  - Automatically identify and track recurring subscriptions, helping users manage and optimize their regular expenses.

- **Adding Credit Cards:**

  - Enable users to add multiple credit card accounts, providing a holistic view of their spending across various cards and simplifying overall financial management.

## Alpha Version

- Set up the project repository and development environment
- Implement user registration and authentication
- Integrate Plaid's API and establish a connection with users' bank accounts
- Develop the basic structure of the dashboard overview
- Implement the automated import and initial categorization of transactions
- Deploy the initial version on a Virtual Machine using Docker and Docker Compose

## Beta Version

- Enhance the dashboard to display key financial metrics (total balance, recent transactions, spending trends)
- Implement detailed spending analysis page with charts and graphs
- Add filters for time and category on the spending analysis page
- Integrate custom budgeting and alerts functionality
- Ensure OAuth 2.0 is fully functional for secure authentication
- Test the application with real-time transaction updates and webhook integration
- Conduct user testing and gather feedback
- Deploy the beta version and ensure it's accessible to the public

## Final Version

- Refine and optimize all existing features based on user feedback
- Implement manual spending input feature
- Add subscription detection and tracking
- Enable adding and managing multiple credit card accounts
- Finalize the export and report generation functionality
- Perform comprehensive testing and bug fixing
- Ensure all deployment files and CI configurations are committed to GitHub
- Create a detailed README with user instructions and deployment details
- Prepare and upload a 3-minute demo video showcasing the core features
- Final deployment and ensure the application is stable and accessible throughout the marking period
