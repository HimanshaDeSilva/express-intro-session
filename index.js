const logEvents= require('./logEvents'); //./ because custome module

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {};

// Initialize object
const myEmitter = new MyEmitter();

// add listener for the log event
myEmitter.on('log', (msg)=> logEvents(msg));

setTimeout(()=>{
    // Emit event
    myEmitter.emit('log', 'Log event emitted!')
},2000);