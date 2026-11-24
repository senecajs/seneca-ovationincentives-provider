/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'
import * as Http from 'http'

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

// The env plugin needs the Ovation client id and secret: test/local-env.js
// (see local-env-template.js) or the environment variables OVATION_CLIENT
// and OVATION_SECRET. Without them it gets dummy values. The active tests
// make no call to Ovation: code-save runs against a local mock of the
// Ovation API.
process.env.OVATION_CLIENT ??= 'test-client'
process.env.OVATION_SECRET ??= 'test-secret'


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

    await seneca.close()
  })


  test('messages', async () => {
    const seneca = await makeSeneca()
    await (SenecaMsgTest(seneca, BasicMessages)())
    await seneca.close()
  })


  // Live, this test would create a reward code, so it runs only against
  // the mock. It covers the token refresh: the first request has no access
  // token, so the API answers 401 and the plugin gets a token with the
  // client credentials, then retries.
  test('code-save', async () => {
    const mock = await makeMockOvationApi()

    try {
      const seneca = await makeSeneca({
        url: mock.url + '/',
        authurl: mock.url + '/connect/token',

        // retry.config passes through to fetch-retry.
        retry: { config: { retryDelay: 10, retries: 3 } },
      })

      const keymap = (await seneca.post(
        'sys:provider,get:keymap,provider:ovationincentives')).keymap
      mock.basic = Buffer.from(keymap.ovationClient.value + ':' +
        keymap.ovationSecret.value).toString('base64')
      mock.clientid = keymap.ovationClient.value

      const code = await seneca.entity('provider/ovationincentives/code')
        .data$({
          SendEmail: false,
          Recipient: {
            FirstName: 'Alice',
            LastName: 'Example',
            Email: 'alice@example.com',
          },
          SchemeId: 502,
          Value: 10,
          CurrencyCode: 'EUR',
          CountryCode: 'IE',
          LanguageCode: 'EN',
          IsSingleCountry: true,
          ClaimIdentifier: '7890',
        })
        .save$()

      expect(code.Code).toEqual('MOCK-CODE-1')
      expect(code.Value).toEqual(10)

      expect(mock.calls).toEqual([
        { method: 'POST', path: '/api/Code', auth: 'none', status: 401 },
        { method: 'POST', path: '/connect/token', auth: 'basic', status: 200 },
        { method: 'POST', path: '/api/Code', auth: 'bearer', status: 200 },
      ])
      expect(mock.tokenRequest).toEqual({
        grant_type: 'client_credentials',
        scope: 'ovation_sandbox',
      })
      expect(mock.codeRequest).toMatchObject({
        SchemeId: 502,
        Recipient: { Email: 'alice@example.com' },
      })

      await seneca.close()
    }
    finally {
      await mock.close()
    }
  })

  /*
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
  */

})


async function makeSeneca(options?: any) {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('@seneca/entity')
    .use('@seneca/env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
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
            ovationSecret: { value: '$OVATION_SECRET' }
          }
        }
      }
    })
    .use(OvationIncentivesProvider, {
      // fetch: Fetch,
      ...options,
    })

  await seneca.ready()
  return seneca
}


type MockCall = {
  method?: string
  path: string
  auth: string
  status: number
}

type MockOvationApi = {
  url: string
  calls: MockCall[]
  basic: string
  clientid: string
  tokenRequest: any
  codeRequest: any
  close: () => Promise<void>
}


// A local stand-in for the Ovation Incentives calls that the plugin makes
// to create a code: POST /api/Code, which needs a bearer access token and
// the X-Client-Id header, and the OAuth client-credentials token request,
// POST /connect/token with HTTP Basic client authentication. The token
// response is the standard OAuth 2 one; the code response echoes the
// request with a Code, the field that the original live test read.
async function makeMockOvationApi(): Promise<MockOvationApi> {
  const ACCESS_TOKEN = 'mock-access-token'
  let codeCount = 0

  const server = Http.createServer((req, res) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const path = new URL(req.url || '/', 'http://127.0.0.1').pathname
      const text = Buffer.concat(chunks).toString()
      const authorization = req.headers.authorization || ''

      // The credentials never reach the record of calls.
      const call: MockCall = {
        method: req.method,
        path,
        auth: authorization.split(' ')[0].toLowerCase() || 'none',
        status: 0,
      }
      mock.calls.push(call)

      const send = (status: number, out: any) => {
        call.status = status
        res.writeHead(status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(out))
      }

      if ('POST' === req.method && '/connect/token' === path) {
        if (authorization !== 'Basic ' + mock.basic) {
          return send(401, { error: 'invalid_client' })
        }
        mock.tokenRequest = Object.fromEntries(new URLSearchParams(text))
        return send(200, {
          access_token: ACCESS_TOKEN,
          expires_in: 3600,
          token_type: 'Bearer',
          scope: mock.tokenRequest.scope,
        })
      }

      if ('POST' === req.method && '/api/Code' === path) {
        if (authorization !== 'Bearer ' + ACCESS_TOKEN ||
          req.headers['x-client-id'] !== mock.clientid) {
          return send(401, {})
        }
        mock.codeRequest = JSON.parse(text)
        return send(200, {
          ...mock.codeRequest,
          Code: 'MOCK-CODE-' + (++codeCount),
        })
      }

      send(404, {})
    })
  })

  await new Promise<void>((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve()))

  const port = (server.address() as { port: number }).port

  const mock: MockOvationApi = {
    url: `http://127.0.0.1:${port}`,
    calls: [],
    basic: '',
    clientid: '',
    tokenRequest: null,
    codeRequest: null,
    close: () => new Promise<void>((resolve) => {
      server.closeAllConnections()
      server.close(() => resolve())
    })
  }

  return mock
}
