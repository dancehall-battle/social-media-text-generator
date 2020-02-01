# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixed
- getOrganiserInstagram is not a function
- GraphQL-LD context in getOrganizerInstagram function
- Number is missing from event name in hashtags (see [issue 18](https://github.com/dancehall-battle/social-media-text-generator/issues/18))

## [1.0.0] - 2020-01-17

### Added
- Generate Instagram and Twitter text for upcoming events (see [issue 9](https://github.com/dancehall-battle/social-media-text-generator/issues/9))
- Add organisers to battle winner's Instagram text (see [issue 7](https://github.com/dancehall-battle/social-media-text-generator/issues/7))
- Event url at end of Twitter text (see [issue 13](https://github.com/dancehall-battle/social-media-text-generator/issues/13))
- Separate file for context
- Generate Instagram and Twitter text for top dancer and country rankings (see [issue 15](https://github.com/dancehall-battle/social-media-text-generator/issues/15))

### Fixed
- Namespaces
- Use commando for battle
- GraphQL-LD context in separate file

### Removed
- Unused dependency: csv-parse

## [0.0.2] - 2019-10-28

### Fixed
- Use name when no Instagram is available for winner (see [issue 3](https://github.com/dancehall-battle/social-media-text-generator/issues/3))

[1.0.0]: https://github.com/dancehall-battle/social-media-text-generator/compare/v0.0.2...v1.0.0
[0.0.2]: https://github.com/dancehall-battle/social-media-text-generator/compare/v0.0.1...v0.0.2
