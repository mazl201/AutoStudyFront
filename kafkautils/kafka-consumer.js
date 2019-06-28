var kafka = require("kafka-node");
var Consumer = kafka.Consumer;
var consumerClient = new kafka.KafkaClient({"kafkaHost":'106.12.10.241:9092'});
var consumer = new Consumer(consumerClient,[{topic:"auto-study-2",partition:0,offset:0}],{
    // autoCommit: true,
    // autoCommitIntervalMs: 5000,
    // // The max wait time is the maximum amount of time in milliseconds to block waiting if insufficient data is available at the time the request is issued, default 100ms
    // fetchMaxWaitMs: 100,
    // // This is the minimum number of bytes of messages that must be available to give a response, default 1 byte
    // fetchMinBytes: 1,
    // // The maximum bytes to include in the message set for this partition. This helps bound the size of the response.
    // fetchMaxBytes: 1024 * 1024,
    // If set true, consumer will fetch message from the given offset in the payloads
    fromOffset: true,
    // If set to 'buffer', values will be returned as raw buffer objects.
    encoding: 'utf8',
    keyEncoding: 'utf8'
})

consumer.on("message",function(msg){
    console.log(msg);
})

consumer.on("error",function(err){
    console.log(err);
})