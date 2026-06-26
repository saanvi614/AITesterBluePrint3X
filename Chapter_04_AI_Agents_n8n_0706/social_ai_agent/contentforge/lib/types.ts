export type ContentStatus = 'Pending' | 'Writing' | 'Imaging' | 'Done' | 'Error';

export interface ContentRow {
  date: string;           // ISO date string YYYY-MM-DD
  topic: string;
  linkedinPost: string;
  mediumArticle: string;
  igScript: string;
  ytScript: string;
  devtoArticle: string;
  status: ContentStatus;
  linkedinImage: string;  // relative path e.g. /images/linkedin_2024-01-15.png
  mediumImage: string;
  igImage: string;
  lastUpdated?: string;   // ISO timestamp
  updatedBy?: string;     // which agent last touched this row
  errorMessage?: string;
}

export interface PipelineState {
  running: boolean;
  currentStep: string | null;
  lastRun: string | null;   // ISO timestamp
  nextRun: string | null;   // ISO timestamp
  lastError: string | null;
  groqKeyOk: boolean;
  geminiKeyOk: boolean;
}

export const KEYWORD_POOL = [
  'QA', 'MCP', 'RAG', 'LLM', 'AI Agents', 'n8n', 'LangFlow',
  'Crew AI', 'DeepEval', 'LangChain', 'AI Harness', 'LLM Eval',
] as const;

export const EXCEL_COLUMNS = {
  date:          'A',
  topic:         'B',
  linkedinPost:  'C',
  mediumArticle: 'D',
  igScript:      'E',
  ytScript:      'F',
  devtoArticle:  'G',
  status:        'H',
  linkedinImage: 'I',
  mediumImage:   'J',
  igImage:       'K',
  lastUpdated:   'L',
  updatedBy:     'M',
  errorMessage:  'N',
} as const;
