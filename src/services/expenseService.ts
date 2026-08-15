import { mockExpenses } from "@/data/expenses";
import { createId, matchesQuery } from "@/lib/search";
import { createCollection } from "@/services/collection";
import type { CreateExpenseInput, Expense } from "@/types";

const collection = createCollection("expenses", mockExpenses);

export const expenseService = {
  async getExpenses(): Promise<Expense[]> {
    return [...collection.read()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  },

  async getExpenseById(id: string): Promise<Expense | undefined> {
    return collection.read().find((expense) => expense.id === id);
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
