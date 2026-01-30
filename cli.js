#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = join(__dirname, 'templates');

// Validate cloud name format
function isValidCloudName(name) {
  return /^[a-z0-9_-]+$/.test(name) && name.length > 0;
}

// Validate project name
function isValidProjectName(name) {
  return /^[a-z0-9_-]+$/i.test(name) && name.length > 0;
}

async function main() {
  console.log(chalk.cyan.bold('\n🚀 Cloudinary React + Vite Boilerplate\n'));
  console.log(chalk.gray('💡 Need a Cloudinary account? Sign up for free: https://cloudinary.com/users/register/free\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What’s your project’s name?\n',
      default: 'my-cloudinary-app',
      validate: (input) => {
        if (!input.trim()) {
          return 'Project name cannot be empty';
        }
        if (!isValidProjectName(input)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
        if (existsSync(input)) {
          return `Directory "${input}" already exists. Please choose a different name.`;
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'cloudName',
      message:
        'What’s your Cloudinary cloud name?\n' +
        chalk.gray(' → Find your cloud name: https://console.cloudinary.com/app/home/dashboard') + '\n',
      validate: (input) => {
        if (!input.trim()) {
          return chalk.yellow(
            'Cloud name is required.\n' +
            ' → Sign up: https://cloudinary.com/users/register/free\n' +
            ' → Find your cloud name: https://console.cloudinary.com/app/home/dashboard'
          );
        }
        if (!isValidCloudName(input)) {
          return 'Cloud name can only contain lowercase letters, numbers, hyphens, and underscores';
        }
        return true;
      },
    },
    {
      type: 'confirm',
      name: 'hasUploadPreset',
      message:
        'Do you have an unsigned upload preset?\n' +
        chalk.gray(' → You’ll need one if you want to upload new images to Cloudinary,\n   but not if you only want to transform or deliver existing images.') + '\n' +
        chalk.gray(' → Create one here: https://console.cloudinary.com/app/settings/upload/presets') + '\n',
      default: false,
    },
    {
      type: 'input',
      name: 'uploadPreset',
      message: 'What’s your unsigned upload preset’s name?\n',
      when: (answers) => answers.hasUploadPreset,
      validate: (input) => {
        if (!input.trim()) {
          return 'Upload preset name cannot be empty';
        }
        return true;
      },
    },
    {
      type: 'checkbox',
      name: 'aiTools',
      message: 'Which AI coding assistant(s) are you using? (Select all that apply)',
      choices: [
        { name: 'Cursor', value: 'cursor' },
        { name: 'GitHub Copilot', value: 'copilot' },
        { name: 'Claude Code / Claude Desktop', value: 'claude' },
        { name: 'Other / Generic AI tools', value: 'generic' },
      ],
      default: ['cursor'],
    },
    {
      type: 'confirm',
      name: 'installDeps',
      message: 'Install dependencies now?\n',
      default: true,
    },
    {
      type: 'confirm',
      name: 'startDev',
      message: 'Start development server?\n',
      default: false,
      when: (answers) => answers.installDeps,
    },
  ]);

  const { projectName, cloudName, uploadPreset, aiTools, installDeps, startDev } = answers;

  console.log(chalk.blue('\n📦 Creating project...\n'));

  // Create project directory
  const projectPath = join(process.cwd(), projectName);
  mkdirSync(projectPath, { recursive: true });

  // Template replacement function
  function replaceTemplate(content, vars) {
    let result = content;
    Object.keys(vars).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, vars[key]);
    });
    return result;
  }

  // Template variables
  const templateVars = {
    PROJECT_NAME: projectName,
    CLOUD_NAME: cloudName,
    UPLOAD_PRESET: uploadPreset || '',
  };

  // Function to copy template file
  function copyTemplate(relativePath, outputPath = null) {
    const templatePath = join(TEMPLATES_DIR, relativePath);
    const finalPath = outputPath || join(projectPath, relativePath.replace('.template', ''));
    
    // Create directory if needed
    const finalDir = dirname(finalPath);
    if (!existsSync(finalDir)) {
      mkdirSync(finalDir, { recursive: true });
    }

    if (existsSync(templatePath)) {
      const content = readFileSync(templatePath, 'utf-8');
      const processed = replaceTemplate(content, templateVars);
      writeFileSync(finalPath, processed);
    }
  }

  // Copy all template files
  const filesToCopy = [
    'package.json.template',
    'vite.config.ts.template',
    'tsconfig.json.template',
    'tsconfig.app.json.template',
    'tsconfig.node.json.template',
    'eslint.config.js.template',
    '.gitignore.template',
    '.env.template',
    'index.html.template',
    'README.md.template',
    'src/cloudinary/config.ts.template',
    'src/cloudinary/UploadWidget.tsx.template',
    'src/App.tsx.template',
    'src/main.tsx.template',
    'src/index.css.template',
    'src/App.css.template',
  ];

  filesToCopy.forEach((file) => {
    copyTemplate(file);
  });

  // Create AI rules based on user's tool selection
  const aiRulesTemplatePath = join(TEMPLATES_DIR, '.cursorrules.template');
  if (existsSync(aiRulesTemplatePath) && aiTools && aiTools.length > 0) {
    const aiRulesContent = replaceTemplate(
      readFileSync(aiRulesTemplatePath, 'utf-8'),
      templateVars
    );

    // Generate files based on selected tools
    if (aiTools.includes('cursor')) {
      writeFileSync(join(projectPath, '.cursorrules'), aiRulesContent);
    }

    if (aiTools.includes('copilot')) {
      const githubDir = join(projectPath, '.github');
      mkdirSync(githubDir, { recursive: true });
      writeFileSync(join(githubDir, 'copilot-instructions.md'), aiRulesContent);
    }

    if (aiTools.includes('claude')) {
      writeFileSync(join(projectPath, '.claude'), aiRulesContent);
      writeFileSync(join(projectPath, 'claude.md'), aiRulesContent);
    }

    if (aiTools.includes('generic')) {
      writeFileSync(join(projectPath, 'AI_INSTRUCTIONS.md'), aiRulesContent);
      writeFileSync(join(projectPath, 'PROMPT.md'), aiRulesContent);
    }

    // Generate MCP configuration if using Cursor or Claude (MCP works with both)
    if (aiTools.includes('cursor') || aiTools.includes('claude')) {
      const mcpTemplatePath = join(TEMPLATES_DIR, '.cursor/mcp.json.template');
      if (existsSync(mcpTemplatePath)) {
        const cursorDir = join(projectPath, '.cursor');
        mkdirSync(cursorDir, { recursive: true });
        const mcpContent = replaceTemplate(
          readFileSync(mcpTemplatePath, 'utf-8'),
          templateVars
        );
        writeFileSync(join(cursorDir, 'mcp.json'), mcpContent);
      }
    }
  }

  // Copy vite.svg to public directory
  const viteSvgPath = join(projectPath, 'public', 'vite.svg');
  mkdirSync(join(projectPath, 'public'), { recursive: true });
  const viteSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>';
  writeFileSync(viteSvgPath, viteSvg);

  console.log(chalk.green('✅ Project created successfully!\n'));

  if (!answers.hasUploadPreset) {
    console.log(chalk.yellow('\n📝 Note: Upload preset not configured'));
    console.log(chalk.gray('   • Transformations will work with sample images'));
    console.log(chalk.gray('   • Uploads require an unsigned upload preset'));
    console.log(chalk.cyan('\n   To enable uploads:'));
    console.log(chalk.cyan('   1. Go to https://console.cloudinary.com/app/settings/upload/presets'));
    console.log(chalk.cyan('   2. Click "Add upload preset"'));
    console.log(chalk.cyan('   3. Set it to "Unsigned" mode'));
    console.log(chalk.cyan('   4. Add the preset name to your .env file\n'));
  }

  if (installDeps) {
    console.log(chalk.blue('📦 Installing dependencies...\n'));
    try {
      process.chdir(projectPath);
      execSync('npm install', { stdio: 'inherit' });
      console.log(chalk.green('\n✅ Dependencies installed!\n'));

      if (startDev) {
        console.log(chalk.blue('🚀 Starting development server...\n'));
        execSync('npm run dev', { stdio: 'inherit' });
      } else {
        console.log(chalk.cyan(`\n📁 Project created at: ${projectPath}`));
        console.log(chalk.cyan(`\nNext steps:`));
        console.log(chalk.cyan(`  cd ${projectName}`));
        console.log(chalk.cyan(`  npm run dev\n`));
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error installing dependencies:'), error.message);
      console.log(chalk.cyan(`\nYou can install manually:`));
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan(`  npm install\n`));
    }
  } else {
    console.log(chalk.cyan(`\n📁 Project created at: ${projectPath}`));
    console.log(chalk.cyan(`\nNext steps:`));
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan(`  npm install`));
    console.log(chalk.cyan(`  npm run dev\n`));
  }
}

main().catch((error) => {
  console.error(chalk.red('❌ Error:'), error.message);
  process.exit(1);
});
