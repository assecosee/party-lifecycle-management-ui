export interface CaseTracking {
  plan?: string;
  initiatingPlan?: string;
  lastExecutedTask?: string;
  tasks?: Task[];

}
export interface Task {
  id?: string;
  description?: string;
  status?: string;
}
