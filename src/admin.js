import xs from 'xstream'
import Firebase from 'firebase'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, h } from '@cycle/dom'
import {parse} from 'url'

import { makeFireDriver } from './firebaseDriver'

const city = parse(window.location.href).path.replace('admin', '').replace(/\//g, '') || 'paris'
Firebase.initializeApp({
  apiKey: "AIzaSyDySLvApaaAV36h81A-ZUsUD3nthtfGofs",
  authDomain: "extia-tv-cb8a6.firebaseapp.com",
  databaseURL: "https://extia-tv-cb8a6.firebaseio.com",
  storageBucket: "extia-tv-cb8a6.appspot.com",
})

function main({ DOM, firebase }){
  const vtree$ = firebase
  .map(agency => {
    console.log(agency)
    return h('div', 'Hello')
  })
  return {
    DOM: vtree$
  }
}

run(main, {
  DOM: makeDOMDriver('#app')
, firebase: makeFireDriver(city)
})
