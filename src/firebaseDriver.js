import xs from 'xstream'
import Firebase from 'firebase'

export function makeFireDriver(city) {
  return () => {
    const initialState = {
      name: ''
    , formations: []
    , events: []
    , messages: []
    , video: ''
    }
    const agency = Firebase.database().ref('agencies/' + city)
    const formations = Firebase.database().ref('formations/' + city)
    const events = Firebase.database().ref('events/' + city)
    const messages = Firebase.database().ref('messages/' + city)
    const source = xs.create({
      start: listener => {
        agency.on('value', f => listener.next({ type: 'agency', value: f.val()}))
        formations.on('child_added', f => listener.next({ type: 'formation', value: f.val()}))
        events.on('child_added', f => listener.next({ type: 'event', value: f.val()}))
        messages.on('child_added', f => listener.next({ type: 'message', value: f.val()}))
      }
    , stop: () => console.log("stopped")
    })
    .fold((state, action) => {
      switch(action.type){
        case 'agency':
          return Object.assign({}, state, action.value )
        case 'formation':
          return Object.assign({}, state, { formations: [...state.formations, action.value] } )
        case 'event':
          return Object.assign({}, state, { events: [...state.events, action.value] } )
        case 'message':
          return Object.assign({}, state, { messages: [...state.messages, action.value] } )
        default:
          return state
      }
    }, initialState)
    return source
  }
}
