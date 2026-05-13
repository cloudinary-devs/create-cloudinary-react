#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = join(__dirname, 'templates');

/** Package managers we know how to drive for install / dev scripts */
const SUPPORTED_PACKAGE_MANAGERS = new Set(['npm', 'pnpm', 'yarn', 'bun']);

/**
 * Parse npm_config_user_agent (set by npm, pnpm, yarn, bun when they run a package).
 * Same approach as create-vite: first space-separated segment is "name/version".
 */
function pkgFromUserAgent(userAgent) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(' ')[0];
  const [name, version = ''] = pkgSpec.split('/');
  if (!name) return undefined;
  return { name, version };
}

/**
 * Resolve which client to run for install / dev.
 * Only npm, pnpm, yarn, and bun have explicit command mappings below; anything else
 * (missing env, exotic clients, parse quirks) falls back to npm as the safe default that
 * ships with Node and matches the install instructions most users expect.
 */
function detectPackageManager() {
  const pkg = pkgFromUserAgent(process.env.npm_config_user_agent);
  if (pkg && SUPPORTED_PACKAGE_MANAGERS.has(pkg.name)) {
    return pkg.name;
  }
  return 'npm';
}

function getInstallCommand(packageManager) {
  if (packageManager === 'yarn') {
    return ['yarn'];
  }
  return [packageManager, 'install'];
}

function getRunDevCommand(packageManager) {
  switch (packageManager) {
    case 'yarn':
    case 'pnpm':
    case 'bun':
      return [packageManager, 'dev'];
    default:
      return ['npm', 'run', 'dev'];
  }
}

function runPackageManagerCommand(args, cwd) {
  const [command, ...cmdArgs] = args;
  const result = spawnSync(command, cmdArgs, { stdio: 'inherit', cwd, shell: false });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Command failed: ${args.join(' ')}`);
  }
}

// Validate cloud name format
function isValidCloudName(name) {
  return /^[a-z0-9_-]+$/.test(name) && name.length > 0;
}

// Validate project name
function isValidProjectName(name) {
  return /^[a-z0-9_-]+$/i.test(name) && name.length > 0;
}

async function main() {
  
  let answers = {};
  
  if (process.argv.includes('--headless')) {

    let values;
    try {
      ({ values } = parseArgs({
        args: process.argv.slice(2).filter(a => a !== '--'),
        options: {
          headless: { type: 'boolean' },
          projectName: { type: 'string', default: 'my-cloudinary-app' },
          cloudName: { type: 'string' },
          hasUploadPreset: { type: 'boolean', default: false },
          uploadPreset: { type: 'string' },
          aiTools: { type: 'string', multiple: true, default: ['cursor'] },
          installDeps: { type: 'boolean', default: true },
          startDev: { type: 'boolean', default: false },
          packageManager: { type: 'string' },
        },
        allowPositionals: true,
      }));
    } catch (e) {
      console.error(chalk.red(`Error: ${e.message}`));
      process.exit(1);
    }

    Object.assign(answers, values);

    const errors = [];

    if (!isValidProjectName(values.projectName)) {
      errors.push('--projectName can only contain letters, numbers, hyphens, and underscores');
    } else if (existsSync(values.projectName)) {
      errors.push(`Directory "${values.projectName}" already exists. Please choose a different name.`);
    }

    if (!values.cloudName) {
      errors.push('--cloudName is required');
    } else if (!isValidCloudName(values.cloudName)) {
      errors.push('--cloudName can only contain lowercase letters, numbers, hyphens, and underscores');
    }

    if (values.hasUploadPreset && !values.uploadPreset) {
      errors.push('--uploadPreset is required when --hasUploadPreset is set');
    }

    if (errors.length > 0) {
      for (const err of errors) {
        console.error(chalk.red(`Error: ${err}`));
      }
      process.exit(1);
    }

  } else {
  
    console.log(chalk.cyan.bold('\n🚀 Cloudinary React Starter Kit\n'));
    console.log(chalk.gray('💡 Need a Cloudinary account? Sign up for free: https://cld.media/reactregister\n'));
  
    const questions = [
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
              ' → Sign up: https://cld.media/reactregister\n' +
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
          chalk.gray(' → An unsigned upload preset allows users to upload files directly from your app.') + '\n' +
          chalk.gray(' → Create one here: https://console.cloudinary.com/app/settings/upload/presets') + '\n' +
          chalk.gray('   (Set signing mode to "Unsigned" when creating)\n'),
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
        message:
          'Which AI coding assistant(s) are you using? (Select all that apply)\n' +
          chalk.gray('   We’ll add local instruction files so your assistant knows Cloudinary patterns.\n'),
        choices: [
          { name: 'Cursor', value: 'cursor' },
          { name: 'GitHub Copilot', value: 'copilot' },
          { name: 'Claude Code', value: 'claude' },
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
    ];

    answers = await inquirer.prompt(questions);
  }

  const { projectName, cloudName, uploadPreset, aiTools, installDeps, startDev } = answers;

  let packageManager = answers.packageManager;
  if (packageManager && !SUPPORTED_PACKAGE_MANAGERS.has(packageManager)) {
    console.warn(
      chalk.yellow(
        `Unknown package manager "${packageManager}". Use npm, pnpm, yarn, or bun. Ignoring --packageManager; using npm_config_user_agent when it names a supported client, otherwise npm.`
      )
    );
    packageManager = undefined;
  }
  packageManager = packageManager || detectPackageManager();

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
    UPLOAD_PRESET_ENV_LINE: uploadPreset
      ? `- \`VITE_CLOUDINARY_UPLOAD_PRESET\`: ${uploadPreset}`
      : '- `VITE_CLOUDINARY_UPLOAD_PRESET`: (not set - add one for uploads)',
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
      writeFileSync(join(projectPath, 'CLAUDE.md'), aiRulesContent);
    }

    if (aiTools.includes('generic')) {
      writeFileSync(join(projectPath, 'AI_INSTRUCTIONS.md'), aiRulesContent);
      writeFileSync(join(projectPath, 'PROMPT.md'), aiRulesContent);
    }

    // Generate MCP configuration: Cursor uses .cursor/mcp.json, Claude Code uses .mcp.json in project root
    const mcpTemplatePath = join(TEMPLATES_DIR, '.cursor/mcp.json.template');
    if (existsSync(mcpTemplatePath)) {
      const mcpContent = replaceTemplate(
        readFileSync(mcpTemplatePath, 'utf-8'),
        templateVars
      );
      if (aiTools.includes('cursor')) {
        const cursorDir = join(projectPath, '.cursor');
        mkdirSync(cursorDir, { recursive: true });
        writeFileSync(join(cursorDir, 'mcp.json'), mcpContent);
      }
      if (aiTools.includes('claude')) {
        writeFileSync(join(projectPath, '.mcp.json'), mcpContent);
      }
    }
  }

  // Copy vite.svg to public directory
  const viteSvgPath = join(projectPath, 'public', 'vite.svg');
  mkdirSync(join(projectPath, 'public'), { recursive: true });
  const viteSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>';
  writeFileSync(viteSvgPath, viteSvg);

  console.log(chalk.green('✅ Project created successfully!\n'));

  if (aiTools && aiTools.length > 0) {
    // Count actual files created
    let fileCount = 0;
    if (aiTools.includes('cursor')) fileCount += 2; // .cursorrules + mcp.json
    if (aiTools.includes('copilot')) fileCount += 1;
    if (aiTools.includes('claude')) fileCount += 2; // CLAUDE.md + .mcp.json
    if (aiTools.includes('generic')) fileCount += 2; // AI_INSTRUCTIONS.md + PROMPT.md
    
    const filesText = fileCount === 1 ? 'file' : 'files';
    console.log(chalk.cyan(`📋 AI assistant configuration ${filesText} created:`));
    if (aiTools.includes('cursor')) console.log(chalk.gray('   • Cursor: .cursorrules'));
    if (aiTools.includes('copilot')) console.log(chalk.gray('   • GitHub Copilot: .github/copilot-instructions.md'));
    if (aiTools.includes('claude')) console.log(chalk.gray('   • Claude: CLAUDE.md'));
    if (aiTools.includes('generic')) console.log(chalk.gray('   • Generic: AI_INSTRUCTIONS.md, PROMPT.md'));
    if (aiTools.includes('cursor')) console.log(chalk.gray('   • MCP (Cursor): .cursor/mcp.json'));
    if (aiTools.includes('claude')) console.log(chalk.gray('   • MCP (Claude Code): .mcp.json'));
    console.log(chalk.gray(`\n   ${fileCount === 1 ? 'This file teaches' : 'These files teach'} your AI assistant about Cloudinary patterns and best practices.`));
    console.log(chalk.gray(`\n   💡 How to use ${fileCount === 1 ? 'this file' : 'these files'}:`));
    console.log(chalk.gray('   • Simply open your project in your AI assistant - the configuration is already loaded'));
    console.log(chalk.gray('   • Ask your AI to help build Cloudinary features, and it will follow these patterns'));
    console.log(chalk.gray('   • Example prompts: "Add image upload", "Create a transformation gallery"\n'));
  }

  if (!answers.hasUploadPreset) {
    console.log(chalk.yellow('\n📝 Note: Upload preset not configured'));
    console.log(chalk.gray('   • Uploads require an unsigned upload preset'));
    console.log(chalk.cyan('\n   To enable uploads:'));
    console.log(chalk.cyan('   1. Go to https://console.cloudinary.com/app/settings/upload/presets'));
    console.log(chalk.cyan('   2. Click "Add upload preset"'));
    console.log(chalk.cyan('   3. Set it to "Unsigned" mode'));
    console.log(chalk.cyan('   4. Add the preset name to your .env file'));
    console.log(chalk.cyan('   5. Save the file and restart the dev server so it loads correctly\n'));
  }

  const installCmd = getInstallCommand(packageManager);
  const devCmd = getRunDevCommand(packageManager);
  const installCmdStr = installCmd.join(' ');
  const devCmdStr = devCmd.join(' ');

  if (installDeps) {
    console.log(chalk.blue(`📦 Installing dependencies with ${packageManager}...\n`));
    try {
      runPackageManagerCommand(installCmd, projectPath);
      console.log(chalk.green('\n✅ Dependencies installed!\n'));

      if (startDev) {
        console.log(chalk.blue('🚀 Starting development server...\n'));
        console.log(chalk.cyan.bold('━'.repeat(60)));
        console.log(chalk.cyan.bold('🎉 Your Cloudinary React app is now running!\n'));
        console.log(chalk.white('Next steps:'));
        console.log(chalk.gray('  1. Open your browser and navigate to the URL shown below'));
        console.log(chalk.gray('  2. Check out the generated AI context files for helpful prompts'));
        console.log(chalk.gray('  3. Start building! Try asking your AI assistant:'));
        console.log(chalk.green('     → "Add an image upload feature"'));
        console.log(chalk.green('     → "Create a gallery with transformations"'));
        console.log(chalk.green('     → "Add image optimization"\n'));
        console.log(chalk.cyan.bold('━'.repeat(60) + '\n'));
        runPackageManagerCommand(devCmd, projectPath);
      } else {
        console.log(chalk.cyan.bold('━'.repeat(60)));
        console.log(chalk.cyan.bold('🎉 Setup complete! Your Cloudinary React app is ready.\n'));
        console.log(chalk.white(`📁 Project location: ${projectPath}\n`));
        console.log(chalk.white('Next steps:'));
        console.log(chalk.cyan(`  1. cd ${projectName}`));
        console.log(chalk.cyan(`  2. ${devCmdStr}`));
        console.log(chalk.gray(`  3. Open your browser to the URL shown by the dev server\n`));
        console.log(chalk.white('What you can do now:'));
        console.log(chalk.gray('  • Open the app in your browser and see the Cloudinary features being used'));
        console.log(chalk.gray('  • Explore the code in src/cloudinary/ to see how it works'));
        console.log(chalk.gray('  • Ask your AI assistant to add features using example prompts:\n'));
        console.log(chalk.green('    → "Add an image gallery with transformations"'));
        console.log(chalk.green('    → "Add a video player component"'));
        console.log(chalk.green('    → "Implement image optimization"\n'));
        console.log(chalk.cyan.bold('━'.repeat(60) + '\n'));
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error installing dependencies:'), error.message);
      console.log(chalk.cyan(`\nYou can install manually:`));
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan(`  ${installCmdStr}\n`));
    }
  } else {
    console.log(chalk.cyan.bold('━'.repeat(60)));
    console.log(chalk.cyan.bold('🎉 Setup complete! Your Cloudinary React app is ready.\n'));
    console.log(chalk.white(`📁 Project location: ${projectPath}\n`));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.cyan(`  1. cd ${projectName}`));
    console.log(chalk.cyan(`  2. ${installCmdStr}`));
    console.log(chalk.cyan(`  3. ${devCmdStr}`));
    console.log(chalk.gray(`  4. Open your browser to the URL shown by the dev server\n`));
    console.log(chalk.white('What you can do after setup:'));
    console.log(chalk.gray('  • Open the app in your browser and see the Cloudinary features being used'));
    console.log(chalk.gray('  • Explore the code in src/cloudinary/ to see how it works'));
    console.log(chalk.gray('  • Ask your AI assistant to add features using example prompts:\n'));
    console.log(chalk.green('    → "Add an image gallery with transformations"'));
    console.log(chalk.green('    → "Add a video player component"'));
    console.log(chalk.green('    → "Implement image optimization"\n'));
    console.log(chalk.cyan.bold('━'.repeat(60) + '\n'));
  }
}

main().catch((error) => {
  console.error(chalk.red('❌ Error:'), error.message);
  process.exit(1);
});
