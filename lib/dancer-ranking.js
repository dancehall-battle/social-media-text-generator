const { rankings } = require('utils');
const fs = require('fs-extra');
const path = require('path');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {Client} = require('graphql-ld/index');
const emojiFlags = require('emoji-flags');
const {getValidHashTag} = require('./utils');
const AbstractRanking = require('./abstract-ranking');

class DancerRanking extends AbstractRanking {
  constructor() {
    super();
  }

  async _getRankingID() {
    return await rankings.getDancerCombinedID();
  }

  async _getRankingByID(id) {
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

  _turnSpotsIntoObject(spots) {
    const result = {};

    spots.forEach(spot => {
      if (!result[spot.position]) {
        result[spot.position] = [];
      }

      result[spot.position].push(spot.dancer);
    });

    return result;
  }

  _generateText(spots, topCount) {
    let instagramText = `Dancehall Battle Rankings update: top ${topCount} dancers 🕺💃\n`;
    const hashtags = ['dancehallbattle', 'dancehall', 'battle', 'ranking', 'dancer', `top${topCount}`];

    for (let i = 1; i <= topCount; i ++) {
      const dancers = spots[i];

      if (dancers) {
        instagramText += `${i}. `;

        dancers.forEach(dancer => {
          instagramText += `@${dancer.instagram} `;
          hashtags.push(getValidHashTag(dancer.name));

          if (dancer.country) {
            const {emoji, name} = emojiFlags.countryCode(dancer.country);
            instagramText += `${emoji} `;
            hashtags.push(getValidHashTag(name));
          }
        });

        if (dancers.length > 1) {
          instagramText += `(tied)`;
        }

        instagramText += '\n';
      }
    }

    instagramText += '.\n.\nFind all rankings on our website (link in bio).\n.\n.\n';
    const temp = hashtags.map(str => '#' + str.toLowerCase());
    const uniqueHashtags = temp.filter(function(item, pos) {
      return temp.indexOf(item) === pos;
    });

    instagramText += uniqueHashtags.join(' ');

    console.log(instagramText);
  }
}

module.exports = DancerRanking;