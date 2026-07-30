![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/ovationincentives-provider

[![npm version](https://img.shields.io/npm/v/@seneca/ovationincentives-provider.svg)](https://npmjs.com/package/@seneca/ovationincentives-provider)
[![build](https://github.com/senecajs/seneca-ovationincentives-provider/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-ovationincentives-provider/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-ovationincentives-provider/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-ovationincentives-provider?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-ovationincentives-provider/badge.svg)](https://snyk.io/test/github/senecajs/seneca-ovationincentives-provider)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/19462/branches/505954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=19462&bid=505954)
[![Maintainability](https://api.codeclimate.com/v1/badges/f76e83896b731bb5d609/maintainability)](https://codeclimate.com/github/senecajs/seneca-ovationincentives-provider/maintainability)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

Provides access to the Ovationincentives API using the Seneca *provider*
convention. Ovationincentives API entities are represented as Seneca entities so
that they can be accessed using the Seneca entity API and messages.
See [seneca-entity](senecajs/seneca-entity) and the [Seneca Data
Entities
Tutorial](https://senecajs.org/docs/tutorials/understanding-data-entities.html) for more details on the Seneca entity API.

NOTE: underlying third party SDK needs to be replaced as out of date and has a security issue.

## Install

```sh
$ npm install @seneca/ovationincentives-provider @seneca/env
```

## Quick Example

```js

// Setup - get the key value (<SECRET>) separately from a vault or
// environment variable.
Seneca()
  // Get API keys using the seneca-env plugin
  .use('env', {
    var: {
      $OVATIONINCENTIVES_APIKEY: String,
      $OVATIONINCENTIVES_USERTOKEN: String,
    }
  })
  .use('provider', {
    provider: {
      ovationincentives: {
        keys: {
          apikey: { value: '$OVATIONINCENTIVES_APIKEY' },
          usertoken: { value: '$OVATIONINCENTIVES_USERTOKEN' },
        }
      }
    }
  })
  .use('ovationincentives-provider')

let board = await seneca.entity('provider/ovationincentives/board')
  .load$('<ovationincentives-board-id>')

Console.log('BOARD', board)

board.desc = 'New description'
board = await board.save$()

Console.log('UPDATED BOARD', board)

```

## More Examples

See [test/](test/) for more usage examples.

## Motivation

A [Seneca.js](http://senecajs.org) plugin.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-ovationincentives-provider/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)

## API

### Options

*None.*

### Action Patterns

* ["sys":"entity","base":"ovationincentives","cmd":"save","name":"code","zone":"provider"](#-sysentitybaseovationincentivescmdsavenamecodezoneprovider-)
* ["sys":"provider","get":"info","provider":"ovationincentives"](#-sysprovidergetinfoproviderovationincentives-)

### Action Descriptions

### &laquo; `"sys":"entity","base":"ovationincentives","cmd":"save","name":"code","zone":"provider"` &raquo;

No description provided.



----------
### &laquo; `"sys":"provider","get":"info","provider":"ovationincentives"` &raquo;

No description provided.



----------

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

### Running tests

```sh
npm run test
```

## Background

Part of the [Senecajs org](https://github.com/senecajs/).
