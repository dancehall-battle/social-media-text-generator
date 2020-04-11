const emojiFlags = require('emoji-flags');
const {isYesterday, isThisWeek, isWeekend, differenceInWeeks} = require('date-fns');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {Client} = require('graphql-ld/index');
const {getOrganizerInstagram, getValidHashTag} = require('./utils');
const path = require('path');
const fs = require('fs-extra');

async function main(battleIRI) {
  const data = await queryTPF(battleIRI);

  if (data) {
    //console.dir(data, {depth: null});
    await generateCaption(data);
  } else {
    console.error(`No data for the battle with IRI ${battleIRI} was found.`);
  }
}

let hashtags = [];

async function generateCaption(battle) {
  const textsFirstWinner = generateTextsForWinner(battle.hasWinner[0]);
  let instagramCaption = `🏆 ${textsFirstWinner.instagram}`;
  let twitterDescription = `🏆 ${textsFirstWinner.twitter}`;

  if (battle.participants === '2') {
    const textsSecondWinner = generateTextsForWinner(battle.hasWinner[1]);
    instagramCaption += ` and ${textsSecondWinner.instagram}`;
    twitterDescription += ` and ${textsSecondWinner.twitter}`;
  }

  hashtags.push(`#${battle.participants}vs${battle.participants}`);

  if (battle.name) {
    hashtags.push('#' + getValidHashTag(battle.name));
  }

  if (battle.gender !== '') {
    hashtags.push('#' + getValidHashTag(battle.gender));
  }

  const battleName = ` won the ${createNameForBattle(battle)} at `;

  instagramCaption += battleName;
  twitterDescription += battleName;
  let addOrganizers = false;

  if (battle.atEvent.instagram !== '') {
    instagramCaption += `@${battle.atEvent.instagram}`;
  } else {
    instagramCaption += `${battle.atEvent.name}`;
    addOrganizers = true;
  }

  twitterDescription += battle.atEvent.name;

  hashtags.push('#' + getValidHashTag(battle.atEvent.name));

  if (battle.atEvent.location !== '') {
    const {emoji, name} = emojiFlags.countryCode(battle.atEvent.location);
    instagramCaption += ` ${emoji}`;
    twitterDescription += ` ${emoji}`;
    hashtags.push('#' + getValidHashTag(name));
  }

  if (addOrganizers) {
    let organiserIGs = await getOrganizerInstagram(battle.atEvent.id);

    if (organiserIGs.length > 0) {
      organiserIGs = organiserIGs.map(ig => '@' + ig);
      instagramCaption += ` (organised by ${organiserIGs.join(' ')})`;
    }
  }

  let when;
  const startDate = new Date(battle.start);
  const today = new Date();

  if (isYesterday(startDate)) {
    when = ' yesterday';
  } else if (isThisWeek(startDate, { weekStartsOn: 1 })) {
    when = ' this week';
  } else if (isWeekend(startDate) && (differenceInWeeks(today, startDate) === 0 || (isWeekend(today) && differenceInWeeks(today, startDate) === 1))) {
    when = ' last weekend';
  } else {
    when = ' **WHEN**';
  }

  instagramCaption += when;
  twitterDescription += when;

  if (battle.level !== '' && battle.level !== 'all') {
    hashtags.push('#' + getValidHashTag(battle.level));
  }

  hashtags = [...new Set(hashtags)];

  instagramCaption += ' 🔥\n';
  twitterDescription += ` 🔥 #dancehallbattle ${battle.atEvent.id}`;
  instagramCaption += '.\n.\n';
  instagramCaption += 'Find all winners on our website (link in bio).\n';
  instagramCaption += '.\n.\n';
  instagramCaption += '#dancehall #battle #dancehallbattle #dance #dancer #competition #contest #winner';
  instagramCaption += ' ' + hashtags.join(' ');

  console.log('### Instagram ###');
  console.log(instagramCaption);

  console.log('\n### Twitter ###');
  console.log(twitterDescription);
}

function generateTextsForWinner(winner) {
  let instagram;
  let twitter;

  if (winner.instagram && winner.instagram !== '') {
    instagram = `@${winner.instagram}`;
  } else {
    instagram = `${winner.name}`;
  }

  if (winner.twitter && winner.twitter !== '') {
    twitter = `@${winner.twitter}`;
  } else {
    twitter = `${winner.name}`;
  }

  if (winner.country !== '') {
    const {emoji, name} = emojiFlags.countryCode(winner.country);
    instagram += ` ${emoji}`;
    twitter += ` ${emoji}`;
    hashtags.push('#' + getValidHashTag(name));
  }

  hashtags.push('#' + getValidHashTag(winner.name));

  return {
    instagram,
    twitter
  }
}

async function queryTPF(battleIRI){
  const context = {'@context': await fs.readJson(path.resolve(__dirname, 'context.json'))};

  context['@context'].BATTLE = battleIRI;

  const query = `
  query { 
      id(_:BATTLE)
      name @single
      level @single
      gender @single
      age @single
      start @single 
      end @single
      participants @single
      inviteOnly @single
      atEvent @single {
        id @single
        name @single
        location @single
        instagram @single
      }
      hasWinner {
        name @single
        country @single
        instagram @single
        twitter @single
      }
  }`;

  const comunicaConfig = {
    sources: [
      { type: "hypermedia", value: "https://data.dancehallbattle.org/data" },
    ],
  };

  const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });
  const {data} = await client.query({ query });

  if (data.length === 0) {
    return [];
  } else {
    return data[0];
  }
}

function createNameForBattle(battle) {
  let label = battle.name;

  if (!label) {
    label = `${battle.participants} vs ${battle.participants}`;

    if (battle.level && battle.level !== 'all') {
      label += ` ${capitalize(battle.level)}`;
    }

    if (battle.age) {
      label += ` ${capitalize(battle.age)}`;
    }

    if (battle.gender) {
      label += ` ${capitalize(battle.gender)}`;
    }
  }

  return label;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

module.exports = main;