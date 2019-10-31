#!/usr/bin/env node

const program = require('commander');
const generateBattleText = require('../lib/generate-battle-text');

program
  .command('battle <url>')
  .description('Generate texts for Instagram and Twitter for a battle and its winner.')
  .action((url) => {
    generateBattleText(url);
  });

program.parse(process.argv);