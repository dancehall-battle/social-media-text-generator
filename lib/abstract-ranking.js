const fs = require('fs-extra');
const path = require('path');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {Client} = require('graphql-ld/index');

class AbstractRanking {

  constructor() {
  }

  /**
   * This method generates an Instagram text for a ranking.
   * @param {int} top The top X ranks that should be included in the text.
   * @returns {Promise<void>}
   */
  async getText(top) {
    const id = await this._getRankingID();
    const ranking = await this._getRankingByID(id);
    let spots = this._getTopX(ranking.items, top);
    spots = this._turnSpotsIntoObject(spots);
    this._generateText(spots, top);
  }

  _getRankingID() {
    throw new Error('This method is not implemented.');
  }

  _getRankingByID() {
    throw new Error('This method is not implemented.');
  }

  _turnSpotsIntoObject() {
    throw new Error('This method is not implemented.');
  }

  _generateText() {
    throw new Error('This method is not implemented.');
  }

  /**
   * This method returns a GraphQL-LD client.
   * @param id The url of a ranking.
   * @returns A new GraphQl-LD client.
   */
  async getClient(id) {
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
    return new Client({context, queryEngine});
  }

  /**
   * This method returns the footer for an Instagram text.
   * @param hashtags An array of values for hashtags (without #).
   */
  getInstagramFooter(hashtags) {
    let footer = '.\n.\nFind all rankings on our website (link in bio).\n.\n.\n';
    const temp = hashtags.map(str => '#' + str.toLowerCase());
    const uniqueHashtags = temp.filter(function(item, pos) {
      return temp.indexOf(item) === pos;
    });

    footer += uniqueHashtags.join(' ');

    return footer;
  }

  _getTopX(items, top) {
    const result = [];

    items.forEach(item => {
      if (item.position <= top) {
        result.push(item);
      }
    });

    return result;
  }

  /**
   * This method returns a string with the points for a rank, taking into account ties.
   * It is based on the items at that specific spot.
   * @param items The items of the spot.
   * @returns {string} The string with the points.
   * @private
   */
  _getPointsText(items) {
    let pointsText = `${items[0].points} pts`;

    if (items.length > 1) {
      pointsText = `(tied with ${pointsText})`;
    } else {
      pointsText = `(${pointsText})`;
    }

    return pointsText;
  }

  /**
   * This method prints the Instagram and Twitter texts to the console.
   * @param instagramText The Instagram text of the post.
   * @param twitterText The Twitter text of the post.
   * @private
   */
  _printTexts(instagramText, twitterText) {
    console.log('### Instagram ###');
    console.log(instagramText);

    console.log('\n### Twitter ###');
    console.log(twitterText);
  }
}

module.exports = AbstractRanking;