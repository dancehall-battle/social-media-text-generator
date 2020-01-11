
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

  _getTopX(items, top) {
    const result = [];

    items.forEach(item => {
      if (item.position <= top) {
        result.push(item);
      }
    });

    return result;
  }
}

module.exports = AbstractRanking;