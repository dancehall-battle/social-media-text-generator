#!/usr/bin/env node

const program = require('commander');
const generateBattleText = require('../lib/battle-winner');
const generateUpcomingText = require('../lib/upcoming-events');
const DancerRanking = require('../lib/dancer-ranking');

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

program
  .command('ranking')
  .description('Generate texts for dancer and country rankings.')
  .option('-t, --top', 'Number of top ranked spots to include.')
  .option('-w, --what', 'Ranking to use.', 'dancer')
  .action((top, what) => {
    if (what === 'dancer') {
      const ranking = new DancerRanking();

      ranking.getText(parseInt(top));
    }
  });

program.parse(process.argv);