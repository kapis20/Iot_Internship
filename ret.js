let mqtt = require('mqtt');
let application_id = '0004a30b001c2043@ttn';
let device_id = 'arduino-test'
let topic_base = `v3/${application_id}@ttn/devices/${device_id}`
options = {
    username: '0004a30b001c2043@ttn',
    password: 'NNSXS.TJDBRV2AZSLXJWVVAF5Q54ARGGU4GDJMWGTPVMI.DYJ3PBZZFYWAFIIKJ2PWWXBXECOAQ52HTP7HYTCIMC4VOBELLTHQ'
}
let client = mqtt.connect('mqtt://eu1.cloud.thethings.network:1883', options)
client.on("error",function(error){ console.log("Can't connect"+error)});
client.subscribe(`${topic_base}/up`, (err, message) => {
    if (err) {
        console.log(`Failed to subscribe to topic: ${err}`);
    } else {
        console.log(`Subscribed to topic ${topic_base}/up`);
    }
})
client.on('message', (topic, message, packet) => {
    console.log(`Received Message: \nTOPIC: ${topic}\nMESSAGE: ${message}`);
})