
export enum Status {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  phase: string;
  status: Status;
  dueDate: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  category: 'Paper' | 'Tool' | 'Code' | 'Tutorial';
}

export interface MetricPoint {
  episode: number;
  reward: number;
  avgQueueLength: number;
  throughput: number;
  avgWaitingTime: number;
  co2Emissions: number;
}
