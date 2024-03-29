const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {Client} = require('graphql-ld/index');

const comunicaConfig = {
  sources: [
    { type: "hypermedia", value: "http://localhost:5000/data" },
  ],
};

const queryEngine = new QueryEngineComunica(comunicaConfig);

/**
 * This method returns the Instagram handles of the organisers of an event.
 * @param eventID the IRI of the event.
 * @returns array of Instagram handles.
 */
async function getOrganizerInstagram(eventID) {
  const query = `
  query { 
    id(_:EVENT)
    organizer {
      instagram @single
    }
  }`;

  const context = {
    "@context": {
      "instagram": { "@id": "https://dancehallbattle.org/ontology/instagram" },
      "organizer": { "@id": "http://schema.org/organizer" },
      "EVENT": eventID,
    }
  };

  const client = new Client({ context, queryEngine });
  const {data} = await client.query({ query });

  if (data.length > 0) {
    return data[0].organizer.map(organizer => organizer.instagram);
  } else {
    return [];
  }
}

function getValidHashTag(str) {
  str = str.toLowerCase();
  str = str.replace(/[_\W]/g, '');

  return str;
}

module.exports = {
  getOrganizerInstagram,
  getValidHashTag
};