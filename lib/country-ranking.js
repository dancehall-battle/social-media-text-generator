const { rankings } = require('utils');
const emojiFlags = require('emoji-flags');
const {getValidHashTag} = require('./utils');
const AbstractRanking = require('./abstract-ranking');

class CountryRanking extends AbstractRanking {
  constructor() {
    super();
  }

  async _getRankingID() {
    return await rankings.getCountryHomeAwayID();
  }

  async _getRankingByID(id) {
    const client = await this.getClient(id);
    const query = `
  query { 
    id (_:ID)
    items {
      rankedCountry @single
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

      result[spot.position].push(spot.rankedCountry);
    });

    return result;
  }

  _generateText(spots, topCount) {
    let instagramText = `Dancehall Battle Rankings update: top ${topCount} countries 🗺\n`;
    let twitterText = instagramText;
    const hashtags = ['dancehallbattle', 'dancehall', 'battle', 'ranking', 'country', `top${topCount}`];

    for (let i = 1; i <= topCount; i ++) {
      const countries = spots[i];

      if (countries) {
        instagramText += `${i}. `;
        twitterText += `${i}. `;

        countries.forEach(country => {
          const {emoji, name} = emojiFlags.countryCode(country);
          instagramText += `${name} ${emoji}`;
          twitterText += `${name} ${emoji}`;
          hashtags.push(getValidHashTag(name));
        });

        if (countries.length > 1) {
          instagramText += `(tied)`;
          twitterText += `(tied)`;
        }

        instagramText += '\n';
        twitterText += '\n';
      }
    }

    instagramText += this.getInstagramFooter(hashtags);
    twitterText += '\nhttps://dancehallbattle.org/ranking/country/all\n';
    twitterText += '#dancehallbattle #ranking';

    console.log('### Instagram ###');
    console.log(instagramText);

    console.log('\n### Twitter ###');
    console.log(twitterText);
  }
}

module.exports = CountryRanking;