export interface Note {
  id: string;
  workspace_id: string;
  product_id?: string;
  epic_id?: string;
  title: string;
  content: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  workspace_id: string;
  product_id?: string;
  epic_id?: string;
  title: string;
  content?: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
  is_favorite?: boolean;
}