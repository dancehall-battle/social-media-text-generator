const emojiFlags = require('emoji-flags');
const {isYesterday, isThisWeek, isWeekend, differenceInWeeks, isSameMonth, isSameYear, format, isEqual} = require('date-fns');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {Client} = require('graphql-ld/index');

async function main(dateStr) {
  const date = new Date(dateStr);

  if (date) {
    const events = await queryTPF(date);
    console.dir(events, {depth: null});

    generateCaption(events, date);
  } else {
    console.error(`"${dateStr}" is not a valid date.`);
  }
}

let hashtags = [];

function generateCaption(events, date) {
  let instagramCaption = `It will be a busy month of ${format(date, 'MMMM')}! `;
  instagramCaption += `There are battles at ${events.length} events in ${getAmountOfCountries(events)} different countries `;
  instagramCaption += `🌍 Where are you going?\n`;
  instagramCaption += `.\n.\n`;

  events.forEach(event => {
    if (event.instagram) {
      instagramCaption += `@${event.instagram}`;
    } else {
      instagramCaption += `${event.name}`;
    }

    hashtags.push('#' + event.name.toLowerCase().replace(/[' .]/g, ''));

    if (event.location !== '') {
      const {emoji, name} = emojiFlags.countryCode(event.location);
      instagramCaption += ` ${emoji}`;
      //twitter += ` ${emoji}`;

      if (hashtags.indexOf('#' + name.toLowerCase()) === -1) {
        hashtags.push('#' + name.toLowerCase());
      }
    }

    instagramCaption += ' ' + formatDateOfEvent(event);
    instagramCaption += '\n';
  });

  instagramCaption += '.\n.\n';
  instagramCaption += '#dancehall #battle #dancehallbattle #dance #dancer #competition #contest';
  instagramCaption += ' ' + hashtags.join(' ');
/*

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
*/

  console.log('### Instagram ###');
  console.log(instagramCaption);

  // console.log('\n### Twitter ###');
  // console.log(twitterDescription);
}

function formatDateOfEvent(event) {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  if (isEqual(startDate, endDate)) {
    return format(startDate, 'd MMMM');
  } else {
    return format(startDate, 'd') + ' - ' + format(endDate, 'd MMMM');
  }
}

function getAmountOfCountries(events) {
  const countries = [];

  events.forEach(event => {
    if (countries.indexOf(event.location) === -1 && event.location !== '') {
      countries.push(event.location);
    }
  });

  return countries.length;
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

async function queryTPF(date){
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
      start @single 
      end @single
      name @single
      location @single
      instagram @single
  }`;

  const comunicaConfig = {
    sources: [
      { type: "hypermedia", value: "https://data.dancehallbattle.org/data" },
    ],
  };

  const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });
  const {data} = await client.query({ query });

  const events = data.filter(event => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    if (startDate && endDate) {
      return (isSameYear(startDate, date) && isSameMonth(startDate,date )) || (isSameYear(endDate, date) && isSameMonth(endDate,date ))
    } else {
      return false;
    }
  });

  return events.sort((a, b) => {
    const aStart = new Date(a.start);
    const bStart = new Date(b.start);

    if (aStart < bStart) {
      return -1;
    } else if (aStart > bStart) {
      return 1;
    } else {
      if (a.name < b.name) {
        return -1;
      } else {
        return 1;
      }
    }
  });

  return events;
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