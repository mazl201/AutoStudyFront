var kafka = require('kafka-node');
var Producer = kafka.Producer;
var KeyedMessage = kafka.KeyedMessage;
var Client =new kafka.KafkaClient({kafkaHost:'106.12.10.241:9092'});
var producer = new Producer(Client);

producer.on('ready', function() {
     var payloads = [{
    topic: 'auto-study-2',
        messages: ['start kafka 106.12.10.241:9092'], // multi messages should be a array, single message can be just a string or a KeyedMessage instance
        // key: 'theKey', // string or buffer, only needed when using keyed partitioner
        partition: 0, // default 0
        attributes: 0, // default: 0
        timestamp: Date.now() // <-- defaults to Date.now() (only available with kafka v0.10+)
   }]

    producer.send(payloads,function(err,data){
        if(err){
            console.log(err);
        }
        console.log(data);
    })

//create topics
    // producer.createTopics(['t1'], function (err, data) {
    //     console.log(data);
    // });
});

producer.sendMsg = function(msg){
    var payloads = [{
        topic: 'auto-study-2',
        messages: [msg], // multi messages should be a array, single message can be just a string or a KeyedMessage instance
        // key: 'theKey', // string or buffer, only needed when using keyed partitioner
        partition: 0, // default 0
        attributes: 0, // default: 0
        timestamp: Date.now() // <-- defaults to Date.now() (only available with kafka v0.10+)
    }]

    producer.send(payloads,function(err,ret){
        if(err){
            console.log(err);
        }
        console.log(ret);
    });
}

module.exports = producer;