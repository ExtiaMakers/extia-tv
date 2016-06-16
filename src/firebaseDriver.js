import xs from 'xstream'
import Firebase from 'firebase'

function reducer(state, action){
  switch(action.action){
    case 'add':
      return [...state, action.value]
    case 'remove':
      return state.filter(x => x._id !== action.id)
    default:
      return state
  }
}

function createSource(city){
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

        formations.on('child_added', f => listener.next({ type: 'formation', action:'add', value: { _id: f.getKey(), ...f.val() } }))
        formations.on('child_removed', f => listener.next({ type: 'formation', action:'remove', id: f.getKey() }))

        events.on('child_added', f => listener.next({ type: 'events', action:'add', value: { _id: f.getKey(), ...f.val() } }))
        events.on('child_removed', f => listener.next({ type: 'events', action:'remove', id: f.getKey() }))

        messages.on('child_added', f => listener.next({ type: 'message', value: { _id: f.getKey(), ...f.val() } }))
      }
    , stop: () => console.log("stopped")
    })
    .fold((state, action) => {
      switch(action.type){
        case 'agency':
          return Object.assign({}, state, action.value )
        case 'formation':
          return Object.assign({}, state, { formations: reducer(state.formations, action) })
        case 'events':
          return Object.assign({}, state, { events: reducer(state.events, action) })
        case 'message':
          return Object.assign({}, state, { messages: reducer(state.messages, action) })
        default:
          return state
      }
    }, initialState)

    return source
}

export function makeFireDriver(city) {
  const source = createSource(city)
  return (actions$) => {
    actions$.addListener({
      next: (action) => {
        switch(action.type){
          case 'push':
            Firebase.database().ref(action.path).child(city).push(action.payload)
            break
          case 'remove':
            Firebase.database().ref(`${action.path}/${city}/${action.id}`).remove()
            break
        }
      }
    , error: err => err
    , complete: () => true
    })
    return source
  }
}
