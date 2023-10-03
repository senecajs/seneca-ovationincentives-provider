/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'

// const Fetch = require('node-fetch')


const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

import OvationIncentivesProvider from '../src/ovationincentives-provider'
import OvationIncentivesProviderDoc from '../src/OvationIncentivesProvider-doc'

const BasicMessages = require('./basic.messages.js')


// Only run some tests locally (not on Github Actions).
let Config = undefined
if (Fs.existsSync(__dirname + '/local-config.js')) {
  Config = require('./local-config')
}


describe('ovationincentives-provider', () => {

  test('happy', async () => {
    expect(OvationIncentivesProvider).toBeDefined()
    expect(OvationIncentivesProviderDoc).toBeDefined()

    const seneca = await makeSeneca()

    expect(await seneca.post('sys:provider,provider:ovationincentives,get:info'))
      .toMatchObject({
        ok: true,
        name: 'ovationincentives',
      })
  })


  test('messages', async () => {
    const seneca = await makeSeneca()
    await (SenecaMsgTest(seneca, BasicMessages)())
  })


  test('get-token', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()

    let res = await seneca.post('sys:provider,get:keymap,provider:ovationincentives')

    if (!res.ok) { throw this.fail('keymap') }

    let ClientId = res.keymap.ovationClient.value
    let Secret = res.keymap.ovationSecret.value

    const codeRes = await seneca.entity("provider/ovationincentives/code").data$({

        "ValidFrom": "2024-10-02T23:01:17.146Z",
        "ValidTo": "2024-10-02T23:01:17.146Z",
        "SendEmail": true,
        "Recipient": {
          "FirstName": "string",
          "LastName": "string",
          "Email": "garethpower92@gmail.com"
        },
        "SchemeId": 502,
        "Value": 10,
        "CurrencyCode": "EUR",
        "CountryCode": "IE",
        "LanguageCode": "EN",
        "IsSingleCountry": true,
        "ClaimIdentifier":"7890"

    }).save$()

    console.log('CODERES', codeRes)

    expect(codeRes['Code'] != undefined).toBeTruthy()
  })

})


async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use('env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $OVATION_CLIENT: String,
        $OVATION_SECRET: String,
      }
    })
    .use('provider', {
      provider: {
        ovationincentives: {
          keys: {
            ovationClient: { value: '$OVATION_CLIENT' },
            ovationSecret: { value: '$OVATION_SECRET' }
          }
        }
      }
    })
    .use(OvationIncentivesProvider, {
      // fetch: Fetch,
    })

  return seneca.ready()
}
