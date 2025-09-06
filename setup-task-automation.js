#!/usr/bin/env node

/**
 * Task Automation Setup Script
 * 
 * This script helps you quickly set up the task management automation system
 * with various configuration options and integrations.
 */

const fs = require('fs');
const path = require('path');

console.log(`
🚀 Task Management Automation Setup
===================================

This setup will help you configure your task automation system with Cursor integration.
`);

// Check if we're in a Node.js environment
if (typeof window !== 'undefined') {
  console.error('❌ This setup script should be run in Node.js, not in the browser.');
  process.exit(1);
}

// Configuration options
const setupOptions = {
  mvp: {
    name: 'MVP Setup',
    description: 'Basic automation with core features',
    features: [
      '✅ Core task management',
      '✅ Basic automation rules',
      '✅ Cursor integration',
      '✅ Simple dashboard'
    ]
  },
  development: {
    name: 'Development Workflow',
    description: 'Full development workflow with GitHub integration',
    features: [
      '✅ All MVP features',
      '✅ GitHub integration',
      '✅ Pull request automation',
      '✅ Advanced metrics',
      '✅ Slack notifications'
    ]
  },
  full: {
    name: 'Full Integration',
    description: 'Complete setup with all external integrations',
    features: [
      '✅ All Development features',
      '✅ Trello integration',
      '✅ Asana integration',
      '✅ Advanced analytics',
      '✅ Custom automation rules'
    ]
  }
};

function displayOptions() {
  console.log('Available setup options:\n');
  
  Object.entries(setupOptions).forEach(([key, option], index) => {
    console.log(`${index + 1}. ${option.name}`);
    console.log(`   ${option.description}`);
    option.features.forEach(feature => console.log(`   ${feature}`));
    console.log('');
  });
}

function createEnvFile(config) {
  const envContent = `# Task Automation Configuration
NODE_ENV=development
WORKFLOW_TYPE=${config.workflowType || 'development'}
ENABLE_METRICS=true
ENABLE_WEBHOOKS=true

# External API Keys (fill in your values)
${config.includeIntegrations ? `
# Trello Integration
TRELLO_API_KEY=your_trello_api_key_here
TRELLO_TOKEN=your_trello_token_here
TRELLO_BOARD_ID=your_board_id_here

# Asana Integration
ASANA_ACCESS_TOKEN=your_asana_access_token_here
ASANA_PROJECT_ID=your_project_id_here

# GitHub Integration
GITHUB_TOKEN=your_github_token_here
GITHUB_REPOSITORY=owner/repo-name

# Slack Integration
SLACK_BOT_TOKEN=your_slack_bot_token_here
SLACK_CHANNEL=#general
` : '# Add your API keys here as needed'}

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret_here
WEBHOOK_BASE_URL=http://localhost:3000

# Database (optional)
# DATABASE_URL=your_database_url_here
`;

  fs.writeFileSync('.env.example', envContent);
  console.log('✅ Created .env.example file');
  
  if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', envContent);
    console.log('✅ Created .env file (please update with your actual API keys)');
  }
}

function createSetupScript() {
  const setupScript = `import { TaskAutomationSetup } from './src/setup/TaskAutomationSetup';

async function main() {
  console.log('🚀 Initializing Task Automation System...');
  
  try {
    // Quick setup with environment variables
    const result = await TaskAutomationSetup.setupFromEnvironment();
    
    if (result.success) {
      console.log('✅ Setup completed successfully!');
      console.log('🎉 Your task automation system is ready to use.');
      console.log('');
      console.log('Next steps:');
      console.log('1. Update your .env file with actual API keys');
      console.log('2. Start the development server: npm run dev');
      console.log('3. Visit http://localhost:3000/dashboard to see your tasks');
    } else {
      console.error('❌ Setup failed with errors:');
      result.errors.forEach(error => console.error('  -', error));
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

main().catch(console.error);
`;

  fs.writeFileSync('setup.mjs', setupScript);
  console.log('✅ Created setup.mjs script');
}

function createDockerConfig() {
  const dockerCompose = `version: '3.8'

services:
  task-automation:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  # Optional: Add database if needed
  # postgres:
  #   image: postgres:13
  #   environment:
  #     POSTGRES_DB: taskautomation
  #     POSTGRES_USER: user
  #     POSTGRES_PASSWORD: password
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"

# volumes:
#   postgres_data:
`;

  const dockerfile = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
`;

  fs.writeFileSync('docker-compose.yml', dockerCompose);
  fs.writeFileSync('Dockerfile', dockerfile);
  console.log('✅ Created Docker configuration files');
}

function createPackageScripts() {
  const packagePath = 'package.json';
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add automation-specific scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'setup:automation': 'node setup.mjs',
      'automation:health': 'curl http://localhost:3000/api/health',
      'automation:metrics': 'curl http://localhost:3000/api/automation/metrics',
      'automation:sync': 'curl -X POST http://localhost:3000/api/integrations/sync'
    };

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added automation scripts to package.json');
  }
}

function main() {
  displayOptions();
  
  // For now, we'll create a basic setup
  // In a real implementation, you'd use a library like inquirer for interactive prompts
  console.log('Creating MVP setup configuration...\n');
  
  const config = {
    workflowType: 'development',
    includeIntegrations: true
  };

  // Create configuration files
  createEnvFile(config);
  createSetupScript();
  createDockerConfig();
  createPackageScripts();

  console.log(`
🎉 Setup files created successfully!

Next steps:
1. Update .env file with your API keys
2. Run: npm run setup:automation
3. Start development: npm run dev
4. Visit: http://localhost:3000/dashboard

For production deployment:
- Use Docker: docker-compose up -d
- Or deploy to your preferred platform

Documentation: See TASK_AUTOMATION_README.md for detailed instructions.

Happy automating! 🚀
`);
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = { createEnvFile, createSetupScript, createDockerConfig };