const emojiFlags = require('emoji-flags');
const {isSameMonth, isSameYear, format, isEqual} = require('date-fns');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {Client} = require('graphql-ld/index');
const {getOrganizerInstagram} = require('./utils');
const fs = require('fs-extra');
const path = require('path');

async function main(dateStr) {
  const date = new Date(dateStr);

  if (date) {
    const events = await queryTPF(date);
    console.dir(events, {depth: null});

    await generateCaption(events, date);
  } else {
    console.error(`"${dateStr}" is not a valid date.`);
  }
}

let hashtags = [];

async function generateCaption(events, date) {
  let instagramCaption = `It will be a busy month of ${format(date, 'MMMM')}! `;
  instagramCaption += `There are battles at ${events.length} events in ${getAmountOfCountries(events)} different countries `;
  instagramCaption += `🌍 Where are you going?`;
  let twitterDescription = instagramCaption;
  twitterDescription += ' #dancehallbattle';
  instagramCaption += `\n.\n.\n`;

  for (let i =0; i < events.length; i++) {
    const event = events[i];

    if (event.instagram) {
      instagramCaption += `@${event.instagram}`;
    } else {
      instagramCaption += `${event.name}`;
      let origanizerIGs = await getOrganizerInstagram(event.id);

      if (origanizerIGs.length > 0) {
        origanizerIGs = origanizerIGs.map(ig => '@' + ig);
        instagramCaption += ` (organised by ${origanizerIGs.join(' ')})`;
      }
    }

    hashtags.push('#' + event.name.toLowerCase().replace(/[' .]/g, ''));

    if (event.location !== '') {
      const {emoji, name} = emojiFlags.countryCode(event.location);
      instagramCaption += ` ${emoji}`;

      if (hashtags.indexOf('#' + name.toLowerCase()) === -1) {
        hashtags.push('#' + name.toLowerCase());
      }
    }

    instagramCaption += ' ' + formatDateOfEvent(event);
    instagramCaption += '\n';
  }

  instagramCaption += '.\n.\n';
  instagramCaption += '#dancehall #battle #dancehallbattle #dance #dancer #competition #contest';
  instagramCaption += ' ' + hashtags.join(' ');

  console.log('### Instagram ###');
  console.log(instagramCaption);

  console.log('\n### Twitter ###');
  console.log(twitterDescription);
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
    "@context": await fs.readJson(path.resolve(__dirname,'context.json'))
  };

  const query = `
  query { 
      id @single
      start @single 
      end @single
      name @single
      location @single
      instagram @single
  }`;

  const comunicaConfig = {
    sources: [
      { type: "hypermedia", value: "http://localhost:5000/data" },
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