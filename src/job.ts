export interface JobConfig {
  name: string;
  description?: string;
  sql_file: string;
  total_rows: number;
  batch_size: number;
  parameters?: Record<string, any>;
}
