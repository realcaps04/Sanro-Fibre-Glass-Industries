import { dummyExpenseIds, mockExpenses } from "@/data/expenses";
import { createId, matchesQuery } from "@/lib/search";
import { createCollection } from "@/services/collection";
import type { CreateExpenseInput, Expense } from "@/types";

const collection = createCollection<Expense>("expenses", mockExpenses);

function readExpenses(): Expense[] {
  const stored = collection.read();
  const next = stored.filter((expense) => !dummyExpenseIds.includes(expense.id));
  if (next.length !== stored.length) {
    collection.write(next);
  }
  return next;
}

export const expenseService = {
  async getExpenses(): Promise<Expense[]> {
    return [...readExpenses()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  },

  async getExpenseById(id: string): Promise<Expense | undefined> {
    return readExpenses().find((expense) => expense.id === id);
  },

  async searchExpenses(query: string): Promise<Expense[]> {
    const expenses = await this.getExpenses();
    return expenses.filter((expense) =>
      matchesQuery(
        query,
        expense.category,
        expense.description,
        expense.vendor,
        expense.paymentMethod,
      ),
    );
  },

  async createExpense(input: CreateExpenseInput): Promise<Expense> {
    const expense: Expense = {
      ...input,
      id: createId("exp"),
    };
    collection.write([expense, ...collection.read()]);
    return expense;
  },
};
