const { rankings } = require('utils');
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
    const client = await this.getClient(id);
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

    instagramText += this.getInstagramFooter(hashtags);

    console.log(instagramText);
  }
}

module.exports = DancerRanking;