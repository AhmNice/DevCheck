export interface ProjectInterface {
  _id: string;
  user_id: string;
  name: string;
  description?: string;
  deadline?: Date;
  archived: boolean;
  deleted: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
