export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: number;
  posterAddress: string;
  workerAddress?: string;
  deadline?: number; // Should be number (timestamp) or check usage
  status: "open" | "assigned" | "completed";
  createdAt: string;
  transactionHash?: string;
  submissions?: { worker: string; link: string }[];
}

const STORAGE_KEY = "microgig_tasks";

export const loadTasks = (): Task[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export const assignTask = (id: string, worker: string): Task | null => {
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;

  tasks[idx].status = "assigned";
  tasks[idx].workerAddress = worker;
  saveTasks(tasks);
  return tasks[idx];
};

export const completeTask = (id: string, txHash: string): Task | null => {
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;

  tasks[idx].status = "completed";
  tasks[idx].transactionHash = txHash;
  saveTasks(tasks);
  return tasks[idx];
};

export const addTask = (task: any): Task => {
  const tasks = loadTasks();
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    status: "open",
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(newTask);
  saveTasks(tasks);
  return newTask;
};

export const CATEGORIES = [
  { value: "design", label: "Design", emoji: "🎨" },
  { value: "translation", label: "Translation", emoji: "🌍" },
  { value: "testing", label: "Testing", emoji: "🧪" },
  { value: "writing", label: "Writing", emoji: "✍️" },
  { value: "development", label: "Development", emoji: "💻" },
  { value: "other", label: "Other", emoji: "📋" },
] as const;
