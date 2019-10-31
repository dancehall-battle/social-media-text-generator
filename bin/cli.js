#!/usr/bin/env node

const program = require('commander');
const generateBattleText = require('../lib/generate-battle-text');
const generateUpcomingText = require('../lib/generate-upcoming-events');

program
  .command('battle <url>')
  .description('Generate texts for Instagram and Twitter for a battle and its winner.')
  .action((url) => {
    generateBattleText(url);
  });

program
  .command('upcoming <date>')
  .description('Generate texts for Instagram and Twitter for upcoming events.')
  .action((date) => {
    generateUpcomingText(date);
  });

program.parse(process.argv);