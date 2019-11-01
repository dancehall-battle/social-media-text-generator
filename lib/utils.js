const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {Client} = require('graphql-ld/index');

const comunicaConfig = {
  sources: [
    { type: "hypermedia", value: "https://data.dancehallbattle.org/data" },
  ],
};

const queryEngine = new QueryEngineComunica(comunicaConfig);

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
      "instagram": { "@id": "https://dancebattle.org/ontology/instagram" },
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

module.exports = {
  getOrganizerInstagram
};