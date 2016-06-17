import xs from 'xstream'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, h } from '@cycle/dom'
import {parse} from 'url'

import { makeFireDriver } from './firebaseDriver'
function parseVideo(url){
  const u = parse(url)
  return url.indexOf('embed') === -1
  ? `${u.protocol}//${u.hostname}/embed/${u.query.replace('v=', '')}`
  : url
}

function renderVideo(agency){
  if(agency.video !== null && agency.video !== '' && agency.video !== undefined){
    const url = parseVideo(agency.video)
    return h('iframe#video', { attrs: { width: 382, height: 215, src: url, frameborder:0, allowfullscreen: true } })
  }
  else return h('div.empty', '')
}

function main({ DOM, firebase }){
  const vtree$ = firebase
  .map(agency => {
    return h('div', [
      h('h1', [
        h('span', `Agence`)
      , h('span', [
          h('span', 'Extia ')
        , h('span', `${agency.name}`)
        ])
      ])
    , h('div#lists', [
        h('div.list' , [
          h('h4', 'Les formations de la semaine')
        , h('ul', agency.formations.map(y => h('li.item', [
              h('span', y.text)
            , h('span', y.date)
            , h('span', y.time)
            ]))
          )
        ])
      , h('div.list', [
          h('h4', 'Les évènements')
        , h('ul', agency.events.map(y => h('li.item', [
              h('span', y.text)
            , h('span', y.date)
            , h('span', y.time)
            ]))
          )
        ])
      ])
    , h('div#bottom', [
        h('div#messages', [
          h('div.wrapper', [
            h('ul',
              agency.messages.map(y => h('li.item', y.text ))
            )
          ])
        ])
      , renderVideo(agency)
      ])
    ])
  })
  return {
    DOM: vtree$
  }
}
const city = window.location.pathname.replace('/', '') || 'paris'
run(main, {
  DOM: makeDOMDriver('#app')
, firebase: makeFireDriver(city, {
    apiKey: "AIzaSyDySLvApaaAV36h81A-ZUsUD3nthtfGofs",
    authDomain: "extia-tv-cb8a6.firebaseapp.com",
    databaseURL: "https://extia-tv-cb8a6.firebaseio.com",
    storageBucket: "extia-tv-cb8a6.appspot.com",
  })
})
