export interface subTask {
  id: number;
  title: string;
  completed: boolean;
}

export const subtaskData: subTask[] = [
  { id: 1, title: "Setup Google Cloud Console credentials", completed: false },
  {
    id: 2,
    title: "Configure redirect URIs for development environment",
    completed: false,
  },
];
