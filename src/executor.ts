import chalk from 'chalk';
import * as fs from 'fs';
import ora from 'ora';
import * as path from 'path';
import { Client } from 'pg';
import { JobConfig } from './job';

export class Executor {
  private job: JobConfig;
  private sqlTemplate: string;
  private client: Client;

  constructor(job: JobConfig) {
    this.job = job;
    const sqlPath = path.isAbsolute(job.sql_file)
      ? job.sql_file
      : path.join(process.cwd(), 'sql', job.sql_file);
    this.sqlTemplate = fs.readFileSync(sqlPath, 'utf8');
    this.client = new Client({ connectionString: process.env.DB_CONNECTION_STRING });
  }

  async run() {
    await this.client.connect();
    const totalBatches = Math.ceil(this.job.total_rows / this.job.batch_size);
    const spinner = ora(`Running job: ${this.job.name}`).start();
    for (let batch = 0; batch < totalBatches; batch++) {
      const start = batch * this.job.batch_size;
      const end = Math.min(start + this.job.batch_size, this.job.total_rows);
      spinner.text = `Batch ${batch + 1}/${totalBatches} (rows ${start}–${end - 1})`;
      try {
        await this.executeBatch(start, end, batch);
        spinner.succeed(chalk.green(`Batch ${batch + 1} succeeded`));
        if (batch < totalBatches - 1) spinner.start();
      } catch (err) {
        spinner.fail(chalk.red(`Batch ${batch + 1} failed: ${err}`));
        break;
      }
    }
    await this.client.end();
    spinner.stop();
    console.log(chalk.blue('Job complete.'));
  }

  private async executeBatch(start: number, end: number, batch: number) {
    // Simple template replacement: {{start}}, {{end}}, {{batch}}, plus job.parameters
    let sql = this.sqlTemplate
      .replace(/{{\s*start\s*}}/g, start.toString())
      .replace(/{{\s*end\s*}}/g, end.toString())
      .replace(/{{\s*batch\s*}}/g, batch.toString());
    if (this.job.parameters) {
      for (const [key, value] of Object.entries(this.job.parameters)) {
        sql = sql.replace(new RegExp(`{{\s*${key}\s*}}`, 'g'), String(value));
      }
    }
    await this.client.query('BEGIN');
    await this.client.query(sql);
    await this.client.query('COMMIT');
  }
}
