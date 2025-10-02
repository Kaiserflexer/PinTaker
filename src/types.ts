export type TaskStatus = 'new' | 'in-progress' | 'done';

export type TaskCategory = string;

export interface TaskCategoryOption {
  id: TaskCategory;
  label: string;
}

export interface TaskTimer {
  durationMinutes: number;
  startedAt: number;
}

export interface Task {
  id: string;
  title: string;
  content: string;
  status: TaskStatus;
  category: TaskCategory;
  archived: boolean;
  timer?: TaskTimer;
}

export interface TaskDraft
  extends Omit<Task, 'id' | 'archived' | 'timer'> {
  timer?: TaskTimer | null;
}

export type TaskUpdate = Partial<Omit<Task, 'id' | 'timer'>> & { timer?: TaskTimer | null };
