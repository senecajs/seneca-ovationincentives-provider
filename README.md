![Seneca Ovationincentives-Provider](http://senecajs.org/files/assets/seneca-logo.png)

> _Seneca Ovationincentives-Provider_ is a plugin for [Seneca](http://senecajs.org)


Provides access to the Ovationincentives API using the Seneca *provider*
convention. Ovationincentives API entities are represented as Seneca entities so
that they can be accessed using the Seneca entity API and messages.

See [@seneca/entity](https://github.com/senecajs/seneca-entity) and the [Seneca Data
Entities
Tutorial](https://senecajs.org/docs/tutorials/understanding-data-entities.html) for more details on the Seneca entity API.

[![npm version](https://img.shields.io/npm/v/@seneca/ovationincentives-provider.svg)](https://npmjs.com/package/@seneca/ovationincentives-provider)
[![build](https://github.com/senecajs/seneca-ovationincentives-provider/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-ovationincentives-provider/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-ovationincentives-provider/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-ovationincentives-provider?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-ovationincentives-provider/badge.svg)](https://snyk.io/test/github/senecajs/seneca-ovationincentives-provider)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/19462/branches/505954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=19462&bid=505954)
[![Maintainability](https://api.codeclimate.com/v1/badges/f76e83896b731bb5d609/maintainability)](https://codeclimate.com/github/senecajs/seneca-ovationincentives-provider/maintainability)


| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|


## Quick Example


```js

// Setup - get the key values (<SECRET>) separately from a vault or
// environment variable.
const seneca = Seneca()
  .use('@seneca/entity')
  // Get API keys using the @seneca/env plugin
  .use('@seneca/env', {
    var: {
      $OVATION_CLIENT: String,
      $OVATION_SECRET: String,
    }
  })
  .use('@seneca/provider', {
    provider: {
      ovationincentives: {
        keys: {
          ovationClient: { value: '$OVATION_CLIENT' },
          ovationSecret: { value: '$OVATION_SECRET' },
        }
      }
    }
  })
  .use('@seneca/ovationincentives-provider')

await seneca.ready()

// Create a reward code.
let code = await seneca.entity('provider/ovationincentives/code')
  .data$({
    SchemeId: '<scheme-id>',
    Value: 10,
    CurrencyCode: 'EUR',
    CountryCode: 'IE',
    LanguageCode: 'EN',
    Recipient: { FirstName: 'Alice', LastName: 'Example', Email: 'alice@example.com' },
    SendEmail: true,
  })
  .save$()

console.log('CODE', code.Code)

```

## Install

Requires Seneca 4 and Node.js 24 or later.

```sh
$ npm install seneca@^4 @seneca/entity @seneca/provider @seneca/env @seneca/ovationincentives-provider
```



<!--START:options-->


## Options

*None.*


<!--END:options-->

<!--START:action-list-->


## Action Patterns

* ["sys":"entity","base":"ovationincentives","cmd":"save","name":"code","zone":"provider"](#-sysentitybaseovationincentivescmdsavenamecodezoneprovider-)
* ["sys":"provider","get":"info","provider":"ovationincentives"](#-sysprovidergetinfoproviderovationincentives-)


<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `"sys":"entity","base":"ovationincentives","cmd":"save","name":"code","zone":"provider"` &raquo;

No description provided.



----------
### &laquo; `"sys":"provider","get":"info","provider":"ovationincentives"` &raquo;

No description provided.



----------


<!--END:action-desc-->
