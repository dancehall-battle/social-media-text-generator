#!/usr/bin/env node

const program = require('commander');
const generateBattleText = require('../lib/battle-winner');
const generateUpcomingText = require('../lib/upcoming-events');

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
    if (date.split('-').length - 1 === 1) {
      date += '-01';
    }

    generateUpcomingText(date);
  });

program.parse(process.argv);