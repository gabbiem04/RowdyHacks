
import React, { useState, useMemo } from 'react';
import { Expense, Bill, Debt } from './types';
import { DollarSignIcon, TrendingDownIcon, CreditCardIcon, PiggyBankIcon, SparklesIcon, PlusCircleIcon, Trash2Icon } from './components/icons';
import ExpenseChart from './components/ExpenseChart';
import { getDebtAdvice, getBudgetPlan } from './services/geminiService';

const App: React.FC = () => {
    const [income, setIncome] = useState<number>(5000);
    const [expenses, setExpenses] = useState<Expense[]>([
        { id: '1', name: 'Groceries', amount: 400, category: 'Food' },
        { id: '2', name: 'Gas', amount: 150, category: 'Transport' },
    ]);
    const [bills, setBills] = useState<Bill[]>([
        { id: '1', name: 'Rent', amount: 1500, category: 'Housing' },
        { id: '2', name: 'Internet', amount: 60, category: 'Utilities' },
    ]);
    const [debts, setDebts] = useState<Debt[]>([
        { id: '1', name: 'Visa Card', amount: 4500, apr: 22.5 },
    ]);
    
    const [aiDebtQuery, setAiDebtQuery] = useState<string>('');
    const [aiDebtResponse, setAiDebtResponse] = useState<string>('');
    const [isDebtLoading, setIsDebtLoading] = useState<boolean>(false);
    
    const [aiBudgetResponse, setAiBudgetResponse] = useState<string>('');
    const [isBudgetLoading, setIsBudgetLoading] = useState<boolean>(false);

    const totalExpenses = useMemo(() => {
        const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
        const billTotal = bills.reduce((sum, item) => sum + item.amount, 0);
        return expenseTotal + billTotal;
    }, [expenses, bills]);

    const totalDebt = useMemo(() => debts.reduce((sum, item) => sum + item.amount, 0), [debts]);
    const savings = useMemo(() => income - totalExpenses, [income, totalExpenses]);

    const handleGenerateDebtAdvice = async () => {
        if (!aiDebtQuery) return;
        setIsDebtLoading(true);
        setAiDebtResponse('');
        const advice = await getDebtAdvice(income, totalExpenses, debts, aiDebtQuery);
        setAiDebtResponse(advice);
        setIsDebtLoading(false);
    };

    const handleGenerateBudgetPlan = async () => {
        setIsBudgetLoading(true);
        setAiBudgetResponse('');
        const allExpenses = [...expenses, ...bills];
        const plan = await getBudgetPlan(income, allExpenses);
        setAiBudgetResponse(plan);
        setIsBudgetLoading(false);
    };

    const addListItem = <T extends { id: string, name: string; amount: number; }>(
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        newItem: Omit<T, 'id'>
    ) => {
        setter(prev => [...prev, { ...newItem, id: Date.now().toString() } as T]);
    };

    const removeListItem = <T extends { id: string }>(
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        id: string
    ) => {
        setter(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
                <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">AI Budget Planner</h1>
            </header>

            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Summary Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <SummaryCard title="Monthly Income" value={income} icon={<DollarSignIcon className="text-green-500"/>} />
                    <SummaryCard title="Monthly Expenses" value={totalExpenses} icon={<TrendingDownIcon className="text-red-500"/>} />
                    <SummaryCard title="Total Debt" value={totalDebt} icon={<CreditCardIcon className="text-yellow-500"/>} />
                    <SummaryCard title="Monthly Savings" value={savings} icon={<PiggyBankIcon className={savings >= 0 ? "text-blue-500" : "text-red-500"}/>} />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card title="Financial Overview">
                            <ExpenseChart income={income} expenses={totalExpenses} />
                        </Card>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card title="Income">
                                <label htmlFor="income" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your monthly income</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input type="number" name="income" id="income" value={income} onChange={e => setIncome(Number(e.target.value))} className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500" placeholder="0.00" />
                                </div>
                            </Card>
                             <Card title="Debts">
                                <ListManager
                                    items={debts}
                                    onRemove={id => removeListItem(setDebts, id)}
                                    onAdd={item => addListItem(setDebts, { ...item, apr: Number(item.apr || 0) })}
                                    fields={[{name: 'name', placeholder: 'Credit Card Name'}, {name: 'amount', placeholder: 'Amount', type: 'number'}, {name: 'apr', placeholder: 'APR %', type: 'number'}]}
                                    renderItem={d => `$${d.amount.toFixed(2)} at ${d.apr}%`}
                                />
                            </Card>
                            <Card title="Recurring Bills">
                                <ListManager
                                    items={bills}
                                    onRemove={id => removeListItem(setBills, id)}
                                    onAdd={item => addListItem(setBills, {...item, category: item.category || 'Other'})}
                                    fields={[{name: 'name', placeholder: 'Bill Name'}, {name: 'amount', placeholder: 'Amount', type: 'number'}, {name: 'category', placeholder: 'Category'}]}
                                />
                            </Card>
                            <Card title="Monthly Expenses">
                                <ListManager 
                                    items={expenses}
                                    onRemove={id => removeListItem(setExpenses, id)}
                                    onAdd={item => addListItem(setExpenses, {...item, category: item.category || 'Misc'})}
                                    fields={[{name: 'name', placeholder: 'Expense Name'}, {name: 'amount', placeholder: 'Amount', type: 'number'}, {name: 'category', placeholder: 'Category'}]}
                                />
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: AI Features */}
                    <div className="lg:col-span-1 space-y-8">
                         <Card title="AI Budget Planner" icon={<SparklesIcon className="text-purple-400"/>}>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Let AI analyze your finances and create a personalized budget plan for you.</p>
                            <button onClick={handleGenerateBudgetPlan} disabled={isBudgetLoading} className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-purple-400 transition-colors flex items-center justify-center">
                                {isBudgetLoading ? 'Generating...' : 'Create My Budget Plan'}
                            </button>
                            {isBudgetLoading && <div className="text-center mt-4">Analyzing your finances...</div>}
                            {aiBudgetResponse && <AiResponseDisplay response={aiBudgetResponse} />}
                        </Card>
                        <Card title="AI Debt Advisor" icon={<SparklesIcon className="text-teal-400"/>}>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ask our AI for strategies to tackle your debt.</p>
                            <textarea value={aiDebtQuery} onChange={e => setAiDebtQuery(e.target.value)} placeholder="e.g., How can I pay off my credit card faster?" className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" rows={3}></textarea>
                            <button onClick={handleGenerateDebtAdvice} disabled={isDebtLoading || !aiDebtQuery} className="mt-2 w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-teal-400 transition-colors flex items-center justify-center">
                                {isDebtLoading ? 'Thinking...' : 'Get Advice'}
                            </button>
                            {isDebtLoading && <div className="text-center mt-4">Generating personalized advice...</div>}
                            {aiDebtResponse && <AiResponseDisplay response={aiDebtResponse} />}
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Sub-components defined outside App to prevent re-renders
interface SummaryCardProps { title: string; value: number; icon: React.ReactNode; }
const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold">${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
    </div>
);

interface CardProps { title: string; children: React.ReactNode; icon?: React.ReactNode; }
const Card: React.FC<CardProps> = ({ title, children, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
            {icon && <span className="mr-2">{icon}</span>}
            <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);

interface ListManagerProps<T> {
    items: (T & { id: string; name: string; amount: number })[];
    onRemove: (id: string) => void;
    // FIX: Changed `any` to `Record<string, any>` for better type safety, preventing properties from being treated as 'unknown'.
    onAdd: (item: Record<string, any>) => void;
    fields: { name: string; placeholder: string; type?: string }[];
    renderItem?: (item: T) => React.ReactNode;
}
const ListManager = <T,>({ items, onRemove, onAdd, fields, renderItem }: ListManagerProps<T>) => {
    // FIX: Changed state type from `any` to `Record<string, string>` to properly type form data.
    const [newItem, setNewItem] = useState<Record<string, string>>({});
    
    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({...newItem, amount: Number(newItem.amount || 0)});
        setNewItem({});
    };

    return (
        <div>
            <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                {items.map(item => (
                    <li key={item.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                        <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                {renderItem ? renderItem(item) : `$${item.amount.toFixed(2)}`}
                            </span>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2Icon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
                 {items.length === 0 && <li className="text-center text-gray-500 dark:text-gray-400 py-4">No items added yet.</li>}
            </ul>
            <form onSubmit={handleAdd} className="grid grid-cols-2 gap-2 items-end">
                {fields.map(field => (
                     <input
                        key={field.name}
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        value={newItem[field.name] || ''}
                        onChange={e => setNewItem({ ...newItem, [field.name]: e.target.value })}
                        className="w-full text-sm p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 col-span-2 sm:col-span-1"
                        required={field.name === 'name' || field.name === 'amount'}
                    />
                ))}
                <button type="submit" className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 col-span-2 sm:col-span-2 flex items-center justify-center">
                    <PlusCircleIcon className="w-5 h-5 mr-1" /> Add
                </button>
            </form>
        </div>
    );
};


const AiResponseDisplay: React.FC<{ response: string }> = ({ response }) => {
    // Basic markdown to HTML conversion
    const formattedResponse = response
        .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
        .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
        .replace(/# (.*)/g, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*)/gm, '<li class="ml-5 list-disc">$1</li>')
        .replace(/(\n<li>.*<\/li>)/g, '<ul>$1\n</ul>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 rounded-md px-2 py-1 text-sm font-mono">$1</code>')
        .replace(/\|(.+)\|/g, (match, content) => {
            const cells = content.split('|').map(c => `<td>${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        })
        .replace(/<tr><td>---.*<\/td><\/tr>/g, '</tbody><thead>') // Heuristic for header row
        .replace(/(<tr>.*<\/tr>)/g, '<tbody>$1</tbody>')
        .replace(/(<thead>?.*<\/thead><tbody>.*<\/tbody>)/gs, '<table class="w-full text-sm text-left my-4 border-collapse"><thead class="bg-gray-100 dark:bg-gray-700">$1</table>');


    return (
        <div
            className="mt-4 prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-200 prose-strong:text-gray-800 dark:prose-strong:text-gray-200"
            dangerouslySetInnerHTML={{ __html: formattedResponse }}
        />
    );
};


export default App;
