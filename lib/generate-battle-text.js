const emojiFlags = require('emoji-flags');
const {isYesterday, isThisWeek, isWeekend, differenceInWeeks} = require('date-fns');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {Client} = require('graphql-ld/index');

async function main(battleIRI) {
  const data = await queryTPF(battleIRI);

  if (data) {
    //console.dir(data, {depth: null});
    generateCaption(data);
  } else {
    console.error(`No data for the battle with IRI ${battleIRI} was found.`);
  }
}

let hashtags = [];

function generateCaption(battle) {
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
    hashtags.push('#' + battle.name.toLowerCase().replace(/[' ]/g, ''));
  }

  const battleName = ` won the ${createNameForBattle(battle)} at `;

  instagramCaption += battleName;
  twitterDescription += battleName;

  if (battle.atEvent.instagram !== '') {
    instagramCaption += `@${battle.atEvent.instagram}`;
  } else {
    instagramCaption += `${battle.atEvent.name}`;
  }

  twitterDescription += battle.atEvent.name;

  hashtags.push('#' + battle.atEvent.name.toLowerCase().replace(/[' ]/g, ''));

  if (battle.atEvent.location !== '') {
    const {emoji, name} = emojiFlags.countryCode(battle.atEvent.location);
    instagramCaption += ` ${emoji}`;
    twitterDescription += ` ${emoji}`;
    hashtags.push('#' + name.toLowerCase());
  }

  // TODO check for organiser
  // if (data.event_organiser !== '') {
  //   caption += ` (organised by @${data.event_organiser})`;
  // }

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
    hashtags.push('#' + battle.level);
  }

  hashtags = [...new Set(hashtags)];

  instagramCaption += ' 🔥\n';
  twitterDescription += ' 🔥 #dancehallbattle';
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

  if (winner.instagram && winner.instagram !== '') {
    instagram = `@${winner.instagram}`;
  } else {
    instagram = `${winner.name}`;
  }

  let twitter = `${winner.name}`;

  if (winner.country !== '') {
    const {emoji, name} = emojiFlags.countryCode(winner.country);
    instagram += ` ${emoji}`;
    twitter += ` ${emoji}`;
    hashtags.push('#' + name.toLowerCase());
  }

  hashtags.push('#' + winner.name.toLowerCase().replace(/[' ]/g, ''));

  return {
    instagram,
    twitter
  }
}

async function queryTPF(battleIRI){
  const context = {
    "@context": {
      "type":  { "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
      "label":  { "@id": "http://www.w3.org/2000/01/rdf-schema#label" },
      "name":  { "@id": "http://schema.org/name" },
      "start":  { "@id": "http://schema.org/startDate" },
      "instagram":  { "@id": "https://dancebattle.org/ontology/instagram" },
      "end":    { "@id": "http://schema.org/endDate" },
      "location":    { "@id": "http://schema.org/location" },
      "hasWinner":    { "@id": "https://dancebattle.org/ontology/hasWinner" },
      "wins":    { "@reverse": "https://dancebattle.org/ontology/hasWinner" },
      "level":    { "@id": "https://dancebattle.org/ontology/level" },
      "age":    { "@id": "https://dancebattle.org/ontology/age" },
      "gender":    { "@id": "https://dancebattle.org/ontology/gender" },
      "hasBattle":    {  "@id": "https://dancebattle.org/ontology/hasBattle" },
      "atEvent":    {  "@reverse": "https://dancebattle.org/ontology/hasBattle" },
      "country":    { "@id": "https://dancebattle.org/ontology/representsCountry" },
      "inviteOnly":    { "@id": "https://dancebattle.org/ontology/inviteOnly" },
      "participants":    {  "@id": "https://dancebattle.org/ontology/amountOfParticipants" },
      "Event": { "@id": "https://dancebattle.org/ontology/DanceEvent" },
      "Battle": { "@id": "https://dancebattle.org/ontology/DanceBattle" },
      "Dancer": { "@id": "https://dancebattle.org/ontology/Dancer" }
    }
  };

  const query = `
  query { 
      id @single
      name @single
      level @single
      gender @single
      age @single
      start @single 
      end @single
      participants @single
      inviteOnly @single
      atEvent @single {
        name @single
        location @single
        instagram @single
      }
      hasWinner {
        name @single
        country @single
        instagram @single
      }
  }`;

  const comunicaConfig = {
    sources: [
      { type: "hypermedia", value: "https://data.dancehallbattle.org/data" },
    ],
  };

  const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });
  const {data} = await client.query({ query });

  let i = 0;

  while (i < data.length && data[i].id !== battleIRI) {
    i ++
  }

  if (i < data.length) {
    return data[i];
  } else {
    return null;
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