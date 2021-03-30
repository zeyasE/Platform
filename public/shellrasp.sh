#!/bin/bash

var1=$1

if [ -z "$var1" ]
then
        echo "Please input your name Raspberry Pi"
else
        sudo apt-get install mosquitto
        # sudo apt-get install mosquitto-clients
        sudo sed -i 's+include_dir /etc/mosquitto/conf.d+allow_anonymous false\npassword_file /etc/mosquitto/pwfile\nlistener 1883+g' /etc/mosquitto/mosquitto.conf
        sudo mosquitto_passwd -c /etc/mosquitto/pwfile $1
        read -p 'Enter your password: ' password
        read -p 'Enter your ip raspberry: ' iprasp
#         printf "var mqtt = require('mqtt');\nconst MQTT_SERVER = '${iprasp}';\nconst MQTT_PORT = '1883';\n//if your server don't have username and password let blank.\nconst MQTT_USER = '${var1}';\nconst MQTT_PASSWORD = '${password}';\n
# var client = mqtt.connect({\nhost: MQTT_SERVER,\nport: MQTT_PORT,\nusername: MQTT_USER,\npassword: MQTT_PASSWORD\n});\n
# module.exports = {\nclient\n}" >> variablemqtt.js
        # printf "MQTT_SERVER = '${iprasp}';\nconst MQTT_PORT = '1883';\n//if your server don't have username and password let blank.\nMQTT_USER = '${var1}';\MQTT_PASSWORD = '${password}'" >> variablemqtt.text
        sudo reboot
fi

