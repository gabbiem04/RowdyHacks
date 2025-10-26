
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getDebtAdvice = async (
  income: number,
  expenses: number,
  debt: { name: string; amount: number; apr: number }[],
  userQuery: string
): Promise<string> => {
  const debtDetails = debt.map(d => `- ${d.name}: $${d.amount.toFixed(2)} at ${d.apr}% APR`).join('\n');

  const prompt = `
    You are an expert financial advisor. A user needs help with their debt.
    Here is their financial situation:
    - Monthly Income: $${income.toFixed(2)}
    - Total Monthly Expenses: $${expenses.toFixed(2)}
    - Credit Card Debt:
    ${debtDetails}

    The user's question is: "${userQuery}"

    Based on this information, provide clear, actionable, and personalized advice on how to lower their debt. 
    Explain concepts like debt avalanche or debt snowball if they are relevant. 
    Keep the tone encouraging and supportive. Format your response using markdown.
    `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching debt advice from Gemini API:", error);
    return "I'm sorry, I'm having trouble providing advice right now. Please check your connection and try again.";
  }
};


export const getBudgetPlan = async (
  income: number,
  expenses: { name: string; amount: number; category: string }[],
): Promise<string> => {
  const expenseDetails = expenses.map(e => `- ${e.category} - ${e.name}: $${e.amount.toFixed(2)}`).join('\n');
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const prompt = `
    You are an expert budget planner. Based on the following financial data, create a sample monthly budget plan.
    
    - Monthly Income: $${income.toFixed(2)}
    - Current Monthly Expenses:
    ${expenseDetails}
    - Total Current Monthly Expenses: $${totalExpenses.toFixed(2)}

    Analyze the spending and suggest a realistic budget plan using the 50/30/20 rule (50% Needs, 30% Wants, 20% Savings/Debt) as a guideline, but adapt it to the user's specific income and expenses.
    
    Present the suggested budget in a clear table format using markdown.
    
    Also provide 3-5 actionable tips for them to stick to this new budget.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching budget plan from Gemini API:", error);
    return "I'm sorry, I couldn't generate a budget plan at this moment. Please try again later.";
  }
};
