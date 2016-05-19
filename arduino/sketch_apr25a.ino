#include <Adafruit_NeoPixel.h>
#include <Adafruit_GPS.h>

#include "Adafruit_BluefruitLE_UART.h"
#include "Adafruit_BLE.h"

#define PIN 6
#define BLUEFRUIT_HWSERIAL_NAME      Serial1
#define BLUEFRUIT_UART_MODE_PIN        -1
#define BLE_READPACKET_TIMEOUT         500   // Timeout in ms waiting to read a response
#define FACTORYRESET_ENABLE         1
#define VERBOSE_MODE                   true
#define BUFSIZE                        128
#define MODE_LED_BEHAVIOUR          "MODE"
#define MINIMUM_FIRMWARE_VERSION    "0.6.6"
#define GPSECHO false



SoftwareSerial mySerial(10, 9);
Adafruit_GPS GPS(&mySerial);
Adafruit_NeoPixel strip = Adafruit_NeoPixel(60, PIN, NEO_GRB + NEO_KHZ800);
Adafruit_BluefruitLE_UART ble(BLUEFRUIT_HWSERIAL_NAME, BLUEFRUIT_UART_MODE_PIN);

uint32_t rouge = strip.Color(255,0,0);
uint32_t orange = strip.Color(237,165,0);
uint32_t jaune = strip.Color(255,255,0);
uint32_t vert = strip.Color(0,255,0);
uint32_t timer = millis();
char tableau[10];
int index = 0;
bool horloge = false;
bool batterie = false;

int hour = 0;
int minute = 0;
int seconde = 0;

void setup() {
  #if defined (__AVR_ATtiny85__)
    if (F_CPU == 16000000) clock_prescale_set(clock_div_1);
  #endif

  
  strip.begin();
  
  setLedRingColor(1.0);
  initBle();
}
 
 
void loop() {h
  transmitData();
  if(horloge){
    changeHorloge();
  }
  delay(5000);
  if(horloge){
    seconde = seconde + 5;
  }
}

void changeHorloge(){
  for(int i = 0; i < 12; i++){
      strip.setPixelColor(i,0,0,0);
  }
  if(seconde == 60){
    seconde = 0;
    minute++;
  }
  if(minute == 60){
    minute = 0;
    hour++;
  }
  if(hour == 12){
    hour = 0;
  }
  /*Serial.print("LED hour : ");
  Serial.print(hour);
  Serial.print(" LED minute : ");
  Serial.print(minute / 5);
 
  Serial.print(" LED seconde : ");
  Serial.println(seconde / 5); */
  strip.setPixelColor(seconde / 5, vert);

  
  if((minute/5) == hour){
    strip.setPixelColor(hour, orange);
  }else{
    strip.setPixelColor(minute / 5, jaune);
    strip.setPixelColor(hour, rouge);
  }
  
  strip.show();
}

void setLedRingColor(double percent){
  for(int i = 0; i < 12; i++){
      strip.setPixelColor(i,0,0,0);
  }
  if(percent < 0 || percent > 100){
    for(int i = 0; i < 12; i++)
      strip.setPixelColor(i,0,0,0);
  } else if(percent == 100){
    for(int i = 0; i < 12; i++){
      strip.setPixelColor(i, vert);
    }
  } else {
    int nb = (int)floor((percent/100.0)*12.0);
    for(int i = 0; i < 12; i++){
      if(isColored(nb, i)){
        if(i < 3){
          strip.setPixelColor(i, rouge);
        }else if(i < 6){
          strip.setPixelColor(i, orange);
        } else if(i < 9){
          strip.setPixelColor(i, jaune);
        } else {
          strip.setPixelColor(i, vert);
        }
      }
    }
  }
  strip.show();
}

bool isColored(int nb, int pos){
  if(pos < nb)
    return true;
  return false;
}

void error(const __FlashStringHelper*err) {
  //Serial.println(err);
  while (1);
}

void initBle(){  
  if ( !ble.begin(VERBOSE_MODE) ){
    error(F("Couldn't find Bluefruit, make sure it's in CoMmanD mode & check wiring?"));
  }

  if ( FACTORYRESET_ENABLE ){
    if ( ! ble.factoryReset() ){
      error(F("Couldn't factory reset"));
    }
  }
  ble.echo(false);
  ble.info();
  ble.verbose(false);  // debug info is a little annoying after this point!
  bool pair = true;
  while (! ble.isConnected()) {
    for(int i =0; i < 12; i++){
      strip.setPixelColor(i, rouge);
      strip.setPixelColor(i+1, 0,0,0);
      i++;
      strip.show();
    }
    delay(500);
    for(int i = 1; i < 12; i++){
      strip.setPixelColor(i, rouge);
      strip.setPixelColor(i-1, 0,0,0);
      i++;
      strip.show();
    }
    delay(500);
  }
  setLedRingColor(1.0);
  if ( ble.isVersionAtLeast(MINIMUM_FIRMWARE_VERSION) ){
    ble.sendCommandCheckOK("AT+HWModeLED=" MODE_LED_BEHAVIOUR);
  }

  ble.setMode(BLUEFRUIT_MODE_DATA);
}

void transmitData(){
  // Check for user input
  char n, inputs[BUFSIZE+1];
  uint16_t timeout = BLE_READPACKET_TIMEOUT;
  uint16_t origtimeout = timeout;
    
  /*if (Serial.available()) {
    n = Serial.readBytes(inputs, BUFSIZE);
    inputs[n] = 0;
    // Send characters to Bluefruit
    //Serial.print("Sending: ");
    //Serial.println(inputs);

    // Send input data to host via Bluefruit
    ble.print(inputs);
  }
*/
  while (timeout--) {
    while (ble.available()) {
      char c = ble.read();
      if(c == '!'){
        index = 0;
        horloge = false;
          batterie= false;
        if(tableau[0] == 't'){
          horloge = true;
          char tmp[3];
          tmp[2] = '\0';
          tmp[0] = tableau[1];
          tmp[1] = tableau[2];
          hour = atoi(tmp);
          tmp[0] = tableau[3];
          tmp[1] = tableau[4];
          minute = atoi(tmp);
          tmp[0] = tableau[5];
          tmp[1] = tableau[6];
          seconde = atoi(tmp);
          seconde = (seconde / 5)*5;
          Serial.println("horloge");
          Serial.println(hour);          
          Serial.println(minute);
          Serial.println(seconde);
          changeHorloge();
        }else if(tableau[0] = 'b'){
          batterie= true;
          char tmp[3];
          tmp[2] = '\0';    
          tmp[0] = tableau[1];
          tmp[1] = tableau[2];
          Serial.println("batterie");
          Serial.println(atoi(tmp));
          setLedRingColor((double)atoi(tmp));
        }
        //Serial.println(tmp);
//        ble.write("ok");
      } else {
        tableau[index] = c;
        index++;
      }
    }
  }
}



