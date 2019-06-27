var kafka = require("kafka-node");
var Consumer = kafka.Consumer;
var consumerClient = new kafka.KafkaClient({"kafkaHost":'106.12.10.241:9092'});
var consumer = new Consumer(consumerClient,[{topic:"auto-study-2"}],{
    autoCommit:true,
    encoding:"utf8",
    valueEncoding:"utf8"
})

consumer.on("message",function(msg){
    console.log(msg);
})

consumer.on("error",function(err){
    console.log(err);
})