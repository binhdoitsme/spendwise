# SpendWise (Finance Journal Model)

## ✨ Glossary

| Term                             | Definition                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Finance Journal**              | A shared ledger where multiple users (Collaborators) record financial transactions (Transactions). Previously called SpendPad.   |
| **Collaborator**                 | A member of a Finance Journal. Includes the Owner and other invited members who can create Transactions. Previously called SpendBuddy. |
| **Transaction**                  | A single financial transaction entry. A Transaction could be an expense, income, or transfer.                                   |
| **Account (Source/Destination)** | A financial account representing where money comes from or goes to (e.g., Cash, Bank Account, Credit Card).                     |
| **Tag**                          | A label used to flexibly group or describe Transactions (e.g., "F&B", "Salary", "Vacation").                                    |
| **Approval Status**              | A workflow for validating Transactions. Statuses: Pending, Approved, Rejected.                                                  |
| **SaveVault**                    | A separate entity for tracking savings goals, using similar account and tagging structures.                                     |
| **Saving Goal**                  | A specific target inside SaveVault that a user saves money towards (e.g., "Emergency Fund", "New Laptop").                      |
| **Settings**                     | Customizable rules per Finance Journal (e.g., approval requirement for Transactions, access permissions).                       |

## 🔍 Use Cases

### Finance Journal Management

- Create a new Finance Journal.
- Invite Collaborators.
- Remove Collaborators.
- Manage settings for Transaction approval.

### Transaction Management

- Create a Transaction (expense, income, or transfer).
- Edit a Transaction.
- Delete a Transaction.
- Approve or Reject a Transaction (based on approval settings).
- Add Tags to a Transaction.
- Filter Transactions by date, source, tags, amount range, etc.
- View audit history for changes to Transactions.

### Account Management

- Create new Accounts (Cash, Debit, Credit, Loan, E-Wallet, etc.).
- Edit Accounts (e.g., update due dates for credit/loan).
- Delete Accounts (with safe handling for already-linked Transactions).

### Tag Management

- Create a Tag inside a Finance Journal.
- Edit Tag name.
- Delete Tag (optionally reassign linked Transactions).

### SaveVault Management

- Create a SaveVault.
- Add Saving Goals.
- Create Saving Transactions toward a Goal.
- Track progress of Saving Goals.
- Manage SaveVault Collaborators (optional).

### Settings Management

- Set whether backdated Transactions require approval.
- Set whether all new Transactions require approval.
- Define default rules for new Tags, Accounts, or Collaborators.

### Dashboard and Reporting

- View summaries (total expenses, incomes, net balance).
- View breakdowns by Account, Source, Tags, Collaborators.
- Export transactions to CSV (future).
- Graphs: Spending over time, Saving goal progress.

### Notifications (future phase)

- Notify when a Transaction requires approval.
- Notify when a Saving Goal milestone is hit.
- Notify when due dates on accounts are approaching.
