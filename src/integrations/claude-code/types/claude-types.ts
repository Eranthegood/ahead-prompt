export interface ClaudeConfig {
  model: 'claude-sonnet-4-20250514' | 'claude-opus-4-1-20250805'
  repository: string
  branch?: string
  workingDirectories?: string[]
  createPR: boolean
  commitMessage?: string
  apiKey?: string
}

export type ClaudeSessionStatus = 
  | 'initializing'
  | 'cloning_repo'
  | 'executing_claude'
  | 'processing_files'
  | 'committing_changes'
  | 'creating_pr'
  | 'completed'
  | 'failed'

export interface ClaudeSession {
  id: string
  prompt_id: string
  session_id: string
  status: ClaudeSessionStatus
  working_directory?: string
  output_lines: string[]
  config: ClaudeConfig
  error_message?: string
  created_at: string
  completed_at?: string
  updated_at: string
}

export interface ClaudeOutputEvent {
  type: 'stdout' | 'stderr' | 'status_change' | 'file_changed' | 'git_operation' | 'error' | 'session_complete'
  content?: string
  status?: ClaudeSessionStatus
  message?: string
  timestamp: string
}

export interface ExecuteClaudeRequest {
  sessionId: string
  prompt: string
  config: ClaudeConfig
  promptId: string
}

export interface ClaudeCommandOptions {
  model: string
  workingDir: string
  additionalDirs: string[]
  prompt: string
}

export const CLAUDE_MODELS = [
  { value: 'claude-sonnet-4-20250514' as const, label: 'Claude Sonnet 4' },
  { value: 'claude-opus-4-1-20250805' as const, label: 'Claude Opus 4.1' },
] as const

export const CLAUDE_SESSION_STATUS_LABELS: Record<ClaudeSessionStatus, string> = {
  'initializing': 'Initialisation...',
  'cloning_repo': 'Clonage du repository...',
  'executing_claude': 'Exécution de Claude Code...',
  'processing_files': 'Traitement des fichiers...',
  'committing_changes': 'Commit des modifications...',
  'creating_pr': 'Création de la Pull Request...',
  'completed': 'Terminé avec succès',
  'failed': 'Échec'
}