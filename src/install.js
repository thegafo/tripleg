import chalk from 'chalk';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const optionalDependencies = ['@google/generative-ai'];

export const installOptionalDependencies = async () => {
    const installPath = path.resolve(__dirname, '..');
    console.log(chalk.green('Installing optional dependencies...'));
    for (const dependency of optionalDependencies) {
        execSync(`npm install ${dependency} --no-save --prefix ${installPath}`, { stdio: 'inherit' });
    }
    console.log(chalk.green('Optional dependencies installed successfully.'));
    process.exit();
};

export const getMissingOptionalDependencies = () => {
    return Promise.all(optionalDependencies.filter(async (dependency) => {
        try {
            await import(dependency);
            return false;
        } catch (error) {
            return true;
        }
    }));
}
