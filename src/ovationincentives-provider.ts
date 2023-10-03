/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Pkg = require('../package.json')


type OvationProviderOptions = {
  url: string
  authurl: string
  proxyurl: string
  fetch: any
  debug: boolean
  entity: Record<string, Record<string, any>>
  retry: {
    config: Record<string, any>
  }
}


function OvationProvider(this: any, options: OvationProviderOptions) {
  const seneca: any = this

  // Shared config reference.
  const config: any = {
    headers: {
      'x-unbx-proxy-url': options.url
    }
  }

  let refreshToken: any

  const makeUtils = this.export('provider/makeUtils')

  const {
    makeUrl,
    get,
    post,
    entityBuilder,
    origFetcher,
    asyncLocalStorage,
  } = makeUtils({
    name: 'ovation',
    url: ('' == options.proxyurl ? options.url : options.proxyurl),
    config,
    retry: {
      config: {
        retryOn,
        ...options.retry.config,
      }
    }
  })


  // console.log('makeUtils', 'get', get)

  async function get_info(this: any, _msg: any) {
    return {
      ok: true,
      name: 'ovationincentives',
      version: Pkg.version,
      sdk: {
        name: 'ovationincentives',
      },
    }
  }

  seneca.message('sys:provider,provider:ovationincentives,get:info', get_info)


  const entity: any = {
    code: { cmd: { save: {} } }
  }

  entity.code.cmd.save.action =
    async function(this: any, entize: any, msg: any) {
      try {
        let body = {
          //customer_context: {
          //...(options.entity?.customer?.save || {}),
          ...(msg.ent.data$(false)),
          //}
        }


        // console.log('GARETH123')

        // console.log(msg)

        let json = await post(makeUrl('api/Code'), {
          body,
          headers: {
            'Content-Type': 'application/json',
          }
        },)

        // console.log('SAVE CODE JSON', json)
        let entdata = json
        //entdata.id = entdata.customer_id
        return entize(entdata)
      }
      catch (e: any) {
        // console.log('SAVE CUSTOMER', e)
        // let res = e.provider?.response

        throw e
      }
    }


  entityBuilder(this, {
    provider: {
      name: 'ovationincentives',
    },
    entity
  })



  async function retryOn(attempt: number, _error: any, response: any) {
    if (4 <= attempt) {
      return false
    }

    if (500 <= response.status && attempt <= 3) {
      return true
    }

    if (401 === response.status) {
      try {
        // console.log('GET ACCESS', config.headers)

        let accessConfig = {
          method: 'POST',
          headers: {
            Authorization: seneca.shared.headers.Authorization,
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-unbx-proxy-url': options.authurl
          },
          body: `grant_type=client_credentials&scope=ovation_sandbox`
        }


        let url = '' == options.proxyurl ? options.authurl : options.proxyurl
        let accessResult =
          await origFetcher(url, accessConfig)

        // console.log('ACCESS RES', accessConfig, accessResult)

        // console.log('access res', accessResult.status)
        if (401 === accessResult.status || 403 === accessResult.status) {
          refreshToken = null
          return true
        }

        let accessJSON = await accessResult.json()
        // console.log('ACCESS JSON', accessJSON)

        let accessToken = accessJSON.access_token

        let store = asyncLocalStorage.getStore()
        // console.log('store', store)
        let currentConfig = store.config

        let authContent = 'Bearer ' + accessToken

        currentConfig.headers['Authorization'] = authContent
        config.headers['Authorization'] = authContent

        currentConfig.headers['X-Client-Id'] = seneca.shared.clientid
        config.headers['X-Client-Id'] = seneca.shared.clientid

        // console.log('store end', store)

        return true

      }
      catch (e) {
        console.log('RETRY', e)
        throw e
      }
    }
  }


  seneca.prepare(async function(this: any) {
    let res = await this.post(
      'sys:provider,get:keymap,provider:ovationincentives'
    )

    let clientid = res.keymap.ovationClient.value
    let clientsecret = res.keymap.ovationSecret.value

    this.shared.clientid = clientid


    let basic = clientid + ':' + clientsecret
    let auth = Buffer.from(basic).toString('base64')

    // console.log('BASIC', basic, auth)

    this.shared.headers = {
      'X-Client-Id': clientid,
      Authorization: 'Basic ' + auth
    }

  })

  return {
    exports: {
      sdk: () => null
    },
  }
}


// Default options.
const defaults: OvationProviderOptions = {

  // NOTE: include trailing /
  url: 'https://external-sandbox.ovationincentives.com/',

  authurl: 'https://auth.ovationincentives.com/connect/token',

  proxyurl: '',

  // Use global fetch by default - if exists
  fetch: ('undefined' === typeof fetch ? undefined : fetch),

  // TODO: Enable debug logging
  debug: false,

  // See @seneca/provider
  retry: {
    config: {
      retryDelay: 100,
    }
  },

  entity: {}
}

Object.assign(OvationProvider, { defaults })

export default OvationProvider

if ('undefined' !== typeof module) {
  module.exports = OvationProvider
}
