const { rankings } = require('utils');
const fs = require('fs-extra');
const path = require('path');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {Client} = require('graphql-ld/index');

async function main(options) {
  const id = await rankings.getDancerCombinedID();
  const ranking = await getDancerRankingByID(id);
  let top = getTopX(ranking.items, 5);
  top = turnTopIntoObject(top);
  generateText(top, 5);
}

function turnTopIntoObject(top) {
  const result = {};

  top.forEach(spot => {
    if (!result[spot.position]) {
      result[spot.position] = [];
    }

    result[spot.position].push(spot.dancer);
  });

  return result;
}

function generateText(spots, topCount) {
  let instagramText = 'Dancehall Battle Rankings update: top 5 dancers 🕺💃\n';

  for (let i = 1; i <= topCount; i ++) {
    const dancers = spots[i];

    if (dancers) {
      console.log(dancers);
      instagramText += `${i}. `;

      dancers.forEach(dancer => {
        instagramText += `@${dancer.instagram} `;
      });

      instagramText += '\n';
    }
  }

  console.log(instagramText);
}

function getTopX(items, top) {
  const result = [];

  items.forEach(item => {
    if (item.position <= top) {
      result.push(item);
    }
  });

  return result;
}

async function getDancerRankingByID(id) {
  const context = {
    '@context': await fs.readJson(path.resolve(__dirname, 'context.json'))
  };
  context['@context'].ID = id;

  const comunicaConfig = {
    sources: [
      { type: "hypermedia", value: "https://data.dancehallbattle.org/data" },
      { type: "hypermedia", value: "https://data.dancehallbattle.org/rankings" },
    ],
  };
  const queryEngine = new QueryEngineComunica(comunicaConfig);
  const client = new Client({context, queryEngine});

  const query = `
  query { 
    id (_:ID)
    items {
      dancer @single {
        id @single
        name @single
        country @single
        instagram @single
      }
      position @single
    }
  }`;

  return (await client.query({query})).data[0];
}

module.exports = main;