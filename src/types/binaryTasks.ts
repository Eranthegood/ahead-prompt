export interface BinaryTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBinaryTaskData {
  title: string;
  description?: string;
}

export interface UpdateBinaryTaskData {
  title?: string;
  description?: string;
  is_completed?: boolean;
}