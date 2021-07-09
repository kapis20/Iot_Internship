# IoT_Pitch_In_Internship
# Monitoring the temperature, humidity, distance with some extra functionality 

**Purpose:** 
This Arduino code uses various sensors and LCD, to transmit and receive data from the ttn (The Things Stack). The received data is used to control LEDs. I will also show the technique to control the angular movement of the servo. Similar principles can be applied to any Arduino board with different sensors mounted.

Additionally, Arduino was put into sleep mode and save some power. During the project, humidity, temperature and distance were send to ttn.

Then the data was retrived using node js and node red 

# Components and connections 
### Components 
-The things Uno: The Arduino Leonardo board with built in Microchip Lorawan module. (Arduino Uno or any other board with appropiate shield could be also used).
 Here is a [shield](https://www.thethingsnetwork.org/marketplace/product/iot-lora-node-shield) that can be used with European frequency (compatible with most of the Arduino boards)
-DHT 11- Humidity and Temperature Sensor 
- LCD1602 Module
- Ultrasonic Sensor - HC-SRO4
- 2 x LEDs 
- 3x push buttons 
-2x 10kOhm and 2x 220Ohm resistors  
- Passive Buzzer 
![Untitled design (5)](https://user-images.githubusercontent.com/87130809/124958099-af986c80-e011-11eb-87d8-a554cd1b261c.png)

### Connection

![image](https://user-images.githubusercontent.com/87130809/124958309-ef5f5400-e011-11eb-9cbb-cefd6337bfba.png)

![image](https://user-images.githubusercontent.com/87130809/124958568-364d4980-e012-11eb-8cc0-d804d58711a5.png)

# Code 
### Libraries used: 
```
<LiquidCrystal.h> - for LCD screen 
<avr/sleep.h> -  library contains the methods that controls the sleep modes
<DHT.h>
<DHT_U.h> - for Temp and Hum sensor 
<TheThingsNetwork.h> - to connect to Lora Network 
```
### Connecting to The Things Stack 
```
#define loraSerial Serial1
#define debugSerial Serial
// Replace REPLACE_ME with TTN_FP_EU868 or TTN_FP_US915
#define freqPlan TTN_FP_EU868

TheThingsNetwork ttn(loraSerial, debugSerial, freqPlan);
ttn.join(appEui, appKey); // in Setup, the rest above 
```
**NOTE**: In this [tutorial](https://www.thethingsnetwork.org/docs/devices/node/quick-start/) the way of registering the end node to The Things Network (although, it's not supported anymore). The method is the same for The things Stack 


### Sending data 

```
  void Transmit_Data(byte data[], int size1){
     ttn.sendBytes(data, size1);
      delay(1000);
    }
   //Function that collect an array and the size of it and sends bytes (that's the only way of transmiting)
   ```
   
   
### Receiving data 

``` 
In setup : 
 ttn.onMessage(message); // passing function to handle downlink data
 and function to control LEDs: 
 void message(const uint8_t *payload, size_t size, port_t port){ 
 if(payload[0]==1){
  digitalWrite(LED_GREEN, LOW); 
  digitalWrite(LED_RED, HIGH);
}
else if(payload[0] == 2) {
   digitalWrite(LED_GREEN, HIGH); 
  digitalWrite(LED_RED, HIGH); 
}
else {
   digitalWrite(LED_GREEN, LOW); 
   digitalWrite(LED_RED, LOW);
}
}
```
Similarly we can control the angular movement of Servo motor or any other sensor e.g
```
  myServo.write(payload[0]);
  delay(2000); //necessary delay for servo to move
   myServo.write(0); 
   ``` 
   
  ### Sleeping Mode 
  **NOTE**: Arduino allows using many different types of sleeping modes, but for this project, The Power Down mode was used (SLEEP_MODE_PWR_DOWN), mainly because it saves most of the power. Also, the LCD screen was turned off while in sleeping mode. The button was connected to interrupt to wake up Arduino (when pressed). 
  
  ```
  void Going_To_Sleep(){
    sleep_enable();//Enabling sleep mode
    attachInterrupt(digitalPinToInterrupt(2), wakeUp, LOW);//attaching a interrupt 1 to pin d2
    set_sleep_mode(SLEEP_MODE_PWR_DOWN);//Setting the sleep mode, in our case full sleep
    delay(1000); //wait a second to allow the led to be turned off before going to sleep
    digitalWrite(LED_RED,LOW);
    digitalWrite(LED_GREEN,LOW);
    analogWrite(Backlight,0); 
    analogWrite(Contrast,255); // both turn off the LCD screen 
    sleep_cpu();//activating sleep mode
    lcd.print("woke up");
    delay(2000);
    lcd.clear();
    
  }

void wakeUp(){
    analogWrite (Backlight,255);
    analogWrite (Contrast,100);

  delay(2000);
  lcd.clear();
   sleep_disable();//Disable sleep mode
  detachInterrupt(digitalPinToInterrupt(2)); //Removes the interrupt from pin 2;
}
```

-In [tutorial1](https://thekurks.net/blog/2018/1/24/guide-to-arduino-sleep-mode) is more about sleeping mode (used with Arduino Mega) 

-[Tutorial2](https://thekurks.net/blog/2016/4/25/using-interrupts) explains the concept of interrupts 

-[Tutorial3](https://thekurks.net/blog/2018/2/5/wakeup-rtc-datalogger) presents the way of using sleeping Mode with the real time clock RTC 

**NOTE**: For various boards, there are different interrupts pins available, presented in the table below: 
![image](https://user-images.githubusercontent.com/87130809/124982506-ae296d00-e02e-11eb-960c-0e498c5ac92e.png)

### Reminder Function 
Purpose: To decide whether generate a sound signal, the idea was to show that reminder, whether to take medicine, can be used with Arduino. Instead of the buzzer, it could be a loudspeaker, and instead of buttons, RTC can be used to set up an alarm at a specified time. 

```
void Take_Medicine_Reminder(){
  int button1 =0;
  int button2 = 0;
  while(1){
    button1=digitalRead(Get_data_button);
    button2 =digitalRead(button_to_skip_buzzer);
    if (button1== HIGH){
        tone(buzzer_pin, 1500); // Send 1KHz sound signal...
        delay(1000);        // ...for 1 sec
        noTone(buzzer_pin);     // Stop sound...
        delay(1000);        // ...for 1sec    
      return;
    }
    else if(button2 == HIGH){
      return;}
    }}
   
```
## The Things Stack
### Payload Formatters 
To display payload in readable format function formatters can be used. In the project, javascript was used to create the decoder function. They are different ways, but this is the most common and the easiest to comprehend. I used the code below: 
```
function Decoder(bytes, port) {
    if(bytes.length == 1) {
        var distance= (bytes[0]);
             return {   'Distance' : distance
            };
       
            
        
    } else if(bytes.length == 4) {
        var humidity = (bytes[0]<<8) | bytes[1];
        var temperature = (bytes[2]<<8) | bytes[3];
        return {
            'humidity': humidity/ 100,
            'temperature': temperature/100
        };
        
    }else if(bytes.length == 5){
        var Humidity = (bytes[0]<<8) | bytes[1];
        var Temperature = (bytes[2]<<8) | bytes[3];
        var Distance= (bytes[4]);
        return{
            'humidity': Humidity/ 100,
            'temperature': Temperature/100,
            'Distance' : Distance
        };
    
        
    } else {
     
             return {  
            'error': 'unknown '};
        }
    
}
```
**NOTE**: Used code is a little redundant because it reads data from a payload of 4 bytes as well as 1 byte and 5 bytes (different ways of transmitting data). For the project, data stored in a 5-byte payload was sent. The disadvantage of this method is that if another data stored in 5 bytes were sent (from different sensors) then an unexpected message could be displayed. Data for humidity and temperature was stored in high and low bytes. More about them can be found [here](https://chortle.ccsu.edu/java5/Notes/chap85/ch85_12.html)

Displayed data looks like this: 
![image](https://user-images.githubusercontent.com/87130809/125003680-9e6e5080-e04f-11eb-9658-67b3624e8ea3.png)

### Sending messege from ttn 
To transmit bytes from ttn we click the end node -> messeging -> Downlink -> Payload (**Hex** used for scheduling) 
![image](https://user-images.githubusercontent.com/87130809/125004029-7d5a2f80-e050-11eb-91d1-cb36ab172674.png)


#Retriving data from the Things Stack 
##Node Red 

It can be installed and set up by using this [tutorial](https://nodered.org/docs/getting-started/local) and then started by using [tutorial2](https://nodered.org/docs/tutorials/first-flow)

Messeges were received by using mqtt, and here is [tutorial3](https://www.thethingsindustries.com/docs/integrations/node-red/receive/) presenting that.

![image](https://user-images.githubusercontent.com/87130809/125010452-733f2d80-e05e-11eb-892d-60da5d2efdb9.png)

**Note**: Decoder used: 
```
msg.payload = {

    Temperature : msg.payload.uplink_message.decoded_payload["temperature"],
    Humidity : msg.payload.uplink_message.decoded_payload["humidity"],
    Distance : msg.payload.uplink_message.decoded_payload["Distance"]
}
return msg;
```

Shows object in the form: 
![image](https://user-images.githubusercontent.com/87130809/125010535-9e298180-e05e-11eb-867f-b37b8f6466f4.png)

## Node JS
The similar method by using mqtt can be applied in node js

**CODE**:
```
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
    ```
