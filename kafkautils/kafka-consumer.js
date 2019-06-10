var Kafka = require("kafka-node");
var Consumer = Kafka.Consumer;
var client = new Kafka.KafkaClient({kafkahost:"106.12.10.241:9092"});
consumer = new Consumer(client,[{topic:"auto-study-2",partition:0}],{
    autoCommit:false,
    encoding:"utf8",
    valueEncoding:"utf8"
})

consumer.on("message",function(msg){
    console.log(msg);
})

consumer.on("error",function(err){
    console.log(err);
})