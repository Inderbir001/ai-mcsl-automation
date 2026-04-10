export interface TrelloCard {
  id: string;
  title: string;
  description: string;
  status: 'Pending AI' | 'AI Processing' | 'Ready for Execution';
}