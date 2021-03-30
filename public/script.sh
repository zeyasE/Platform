#!/bin/bash

sudo apt-get install mosquitto-clients
read -p 'Enter your hostname raspberry : ' hostname
read -p 'Enter your password mqtt : ' password
read -p 'Enter your ip raspberry pi : ' ip
read -p 'Enter your name iot(not repeat with another) : ' topic
read -p 'Enter your command : ' program
read -p 'Choose your timespamp (second): ' timespamp
#output=$($program)
#echo "$output"
while true
do
        output=$($program)
        echo "$output"
        now="$(date +'%Y-%m-%d %T')"
        mosquitto_pub -d -h $ip -p 1883 -u $hostname -P $password -t $topic -m "$now,$output"
        sleep $timespamp
done