#!/usr/bin/env node

const program = require('commander');
const generateBattleText = require('../lib/battle-winner');
const generateUpcomingText = require('../lib/upcoming-events');
const DancerRanking = require('../lib/dancer-ranking');
const CountryRanking = require('../lib/country-ranking');

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
  .action((cmdOb, optionsArray) => {
    const what = optionsArray[1];
    const top = optionsArray[0];

    console.log(what);

    if (what === 'dancer') {
      const ranking = new DancerRanking();

      ranking.getText(parseInt(top));
    } else if (what === 'country') {
      const ranking = new CountryRanking();

      ranking.getText(parseInt(top));
    } else {
      console.error('Incorrect use of -w. Only "dancer" and "country" are allowed.');
    }
  });

program.parse(process.argv);