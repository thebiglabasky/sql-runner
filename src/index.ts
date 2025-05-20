import chalk from 'chalk';
import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import { Executor } from './executor';
import { JobConfig } from './job';

dotenv.config();

const program = new Command();

program
  .name('sql-runner')
  .description('CLI to run batch SQL jobs')
  .version('0.1.0');

program
  .command('hello')
  .description('Prints hello world')
  .action(() => {
    console.log('Hello, world!');
    const dbUrl = process.env.DB_CONNECTION_STRING;
    if (dbUrl) {
      console.log('DB_CONNECTION_STRING:', dbUrl);
    } else {
      console.log('DB_CONNECTION_STRING not set');
    }
  });

program
  .command('run <jobFile>')
  .description('Run a job from a YAML config')
  .action(async (jobFile: string) => {
    try {
      const jobPath = path.isAbsolute(jobFile) ? jobFile : path.join(process.cwd(), jobFile);
      const file = fs.readFileSync(jobPath, 'utf8');
      const job: JobConfig = YAML.parse(file);
      const executor = new Executor(job);
      await executor.run();
    } catch (err) {
      console.error(chalk.red('Failed to run job:'), err);
      process.exit(1);
    }
  });

program.parse(process.argv);
