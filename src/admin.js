import xs from 'xstream'
import Firebase from 'firebase'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, h } from '@cycle/dom'
import {parse} from 'url'
import dateformat from 'dateformat'

import { makeFireDriver } from './firebaseDriver'

const city = parse(window.location.href).path.replace('admin', '').replace(/\//g, '') || 'paris'
Firebase.initializeApp({
  apiKey: "AIzaSyDySLvApaaAV36h81A-ZUsUD3nthtfGofs",
  authDomain: "extia-tv-cb8a6.firebaseapp.com",
  databaseURL: "https://extia-tv-cb8a6.firebaseio.com",
  storageBucket: "extia-tv-cb8a6.appspot.com",
})
Firebase.auth().signInWithEmailAndPassword('wcastandet@kilix.fr', 'extia-makers').catch(function(error) {
  const errorCode = error.code
  const errorMessage = error.message
  console.log(errorCode, errorMessage)
})

function createActions(DOM) {
  const delete$ = DOM.select('.clear')
  .events('click', {useCapture: true})
  .map(ev => ({ id: ev.target.dataset.id, path: ev.target.dataset.path }))
  .map(data => ({
      type: 'remove'
    , path: data.path
    , id: data.id
    })
  )

  const addFormation$ = DOM.select('form#addF')
  .events('submit', {useCapture: true})
  .map(ev => {
    ev.preventDefault()
    const v = ev.target.text.value
    const d = ev.target.date.value
    const t = ev.target.time.value
    ev.target.text.value = ''
    return {
      type: 'push'
    , path: 'formations'
    , payload: { created_at: Date.now(), date: d, time: t, text: v }
    }
  })
  const addEvents$ = DOM.select('form#addE')
  .events('submit', {useCapture: true})
  .map(ev => {
    ev.preventDefault()
    const v = ev.target.text.value
    const d = ev.target.date.value
    const t = ev.target.time.value
    ev.target.text.value = ''
    return {
      type: 'push'
    , path: 'events'
    , payload: { created_at: Date.now(), date: d, time: t, text: v }
    }
  })

  return xs.merge(addFormation$, addEvents$, delete$)
}

function main({ DOM, firebase }){
  const actions$ = createActions(DOM)
  const vtree$ = firebase
  .map(agency => {
    const d = dateformat(Date.now(), 'yyyy-mm-dd')
    const hh = dateformat(Date.now(), 'HH:MM')
    return h('div', [
      h('h1', `Agence Extia ${agency.name}`)
    , h('div#lists', [
        h('div.list' , [
          h('h4', 'Les formations')
        , h('ul',
          [ ...agency.formations
            .map(y => h('li.item', [
              h('span', y.text)
            , h('span', y.date)
            , h('span', y.time)
            , h('i.material-icons.clear', { attrs: { 'data-id': y._id, 'data-path': 'formations' } }, 'clear')
            ]))
          , h('li.item.add', [
              h('form#addF', [
                h('input.main', { props: { type: 'text', name:'text', placeholder: 'Nouvelle formation', autocomplete: 'off' } })
              , h('input', { props: { type: 'time', name:'time', value: hh } })
              , h('input', { props: { type: 'date', name:'date', value: d } })
              , h('button', { props: { type: 'submit' } }, 'Ajouter')
              ])
            ])
          ])
        ])
      , h('div.list', [
          h('h4', 'Les évènements')
        , h('ul',
          [ ...agency.events
            .map(y => h('li.item', [
              h('span', y.text)
            , h('span', y.date)
            , h('span', y.time)
            , h('i.material-icons.clear', { attrs: { 'data-id': y._id, 'data-path': 'events' } }, 'clear')
            ]))
          , h('li.item.add', [
              h('form#addE', [
                h('input', { props: { type: 'text', name:'text', placeholder: 'Nouveau events', autocomplete: 'off' } })
              , h('input', { props: { type: 'time', name:'time', value: hh } })
              , h('input', { props: { type: 'date', name:'date', value: d } })
              , h('button', { props: { type: 'submit' } }, 'Ajouter')
              ])
            ])
          ])
        ])
      ])
    ])
  })
  return {
    DOM: vtree$
  , firebase: actions$
  }
}

run(main, {
  DOM: makeDOMDriver('#app')
, firebase: makeFireDriver(city)
})
