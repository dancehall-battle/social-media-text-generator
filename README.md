# Social media text generator

This tool generates text for Instagram and Twitter for posts about winners.

## Requirements
- Node.js
- yarn

## Install
Install the dependencies via `yarn install`.
Install the tool globally via `yarn global add file:$(pwd)`.

## Run

### Battle winner
Execute `node bin/cli.js battle [battle-iri]`, 
where `battle-iri` is the IRI of a battle.
In case you installed the tool globally,
execute `social-media-text-generator battle [battle-iri]`.

### Upcoming events
Execute `node bin/cli.js upcoming [date]`, 
where `date` is of the format `yyyy-mm` (e.g., `2019-11`).
In case you installed the tool globally,
execute `social-media-text-generator upcoming [date]`.

## Contributions
Contributions are welcome, and bug reports or pull requests are always helpful. 
If you plan to update a larger part of the website, it's best to contact us first.

## License
MIT &copy; Dancehall Battle