
// This #include statement was automatically added by the Particle IDE.
#include "neopixel/neopixel.h"


// This #include statement was automatically added by the Particle IDE.
#include "Nodebotanist_InternetButton.h"


// This #include statement was automatically added by the Particle IDE.
#include "Adafruit_TCS34725/Adafruit_TCS34725.h"

#include <math.h>

/* This SparkButton library has some useful functions.
Here we blink ALL the LEDs instead of just one.*/

InternetButton b = InternetButton();

int xValue = 0;
int yValue = 0;
int zValue = 0;

float pitch = 0;
float roll = 0;

Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_50MS, TCS34725_GAIN_4X);
uint16_t clear, red, green, blue;
int redValue = 0;
int blueValue = 0;
int greenValue = 0;

boolean eventDelay = true;
int eventTimer = 0;
    
Adafruit_NeoPixel strip2 = Adafruit_NeoPixel(36, A0, WS2812); // right sleeve
Adafruit_NeoPixel strip3 = Adafruit_NeoPixel(36, A1, WS2812); // left sleeve
Adafruit_NeoPixel strip4 = Adafruit_NeoPixel(43, D2, WS2812); // hood

int userHoodColor[3] = {50, 50, 50};
int userLeftColor[3] = {75, 0, 255};
int userRightColor[3] = {125, 125, 0};
int userButtonColor[3] = {150, 0, 0};

int userColorCycle[3] = {0, 0, 0};
int userColorIndex = 0;

boolean rerender = true;

byte gammatable[256];

void setup() {
    // Tell b to get everything ready to go
    // Use b.begin(1); if you have the original SparkButton, which does not have a buzzer or a plastic enclosure
    // to use, just add a '1' between the parentheses in the code below.
    Particle.variable("accelX", xValue);
    Particle.variable("accelY", yValue);
    Particle.variable("accelZ", zValue);
    Particle.function("setColor", set_color);
        
    b.begin();
    strip2.setBrightness(70);
    strip3.setBrightness(70);
    strip4.setBrightness(70);
    
    strip2.begin();
    strip3.begin();
    strip4.begin();

    if (!tcs.begin()) {
        Particle.publish("TCS_ERROR");
    }
    
    Particle.variable("red", redValue);
    Particle.variable("green", greenValue);
    Particle.variable("blue", blueValue);
    
    for (int i=0; i<256; i++) {
        float x = i;
        x /= 255;
        x = pow(x, 2.5);
        x *= 255;
        gammatable[i] = x;      
    }
}

int modeLight = 0;

void loop(){

    
    roll  = ((((atan2(-yValue, zValue)*180.0)/M_PI) + 180) / 360) * 256;
    pitch = ((((atan2(xValue, sqrt(yValue*yValue + zValue*zValue))*180.0)/M_PI) + 180) / 360) * 256;
    

    if(b.buttonOn(1)){
        if(eventDelay){
            Particle.publish("buttonpressup");
            eventDelay = false;
            eventTimer = 0;
        }
        
        //userColorCycle, userColorIndex
        if(modeLight == 0){
            if(userColorIndex == 0){
                userColorCycle[0] = userButtonColor[0];
                userColorCycle[1] = userButtonColor[1];
                userColorCycle[2] = userButtonColor[2];
                userColorIndex++;
            } else if(userColorIndex == 1){
                userColorCycle[0] = userLeftColor[0];
                userColorCycle[1] = userLeftColor[1];
                userColorCycle[2] = userLeftColor[2];
                userColorIndex++;
            } else if(userColorIndex == 2){
                userColorCycle[0] = userHoodColor[0];
                userColorCycle[1] = userHoodColor[1];
                userColorCycle[2] = userHoodColor[2];
                userColorIndex++;
            }  else if(userColorIndex == 3){
                userColorCycle[0] = userRightColor[0];
                userColorCycle[1] = userRightColor[1];
                userColorCycle[2] = userRightColor[2];
                userColorIndex = 0;
            }
        }
        
        if( modeLight <= 35 ){
            // 2 4 3 button
            strip2.setPixelColor(modeLight, strip2.Color(userColorCycle[0], userColorCycle[1], userColorCycle[2]));
            modeLight++;
        } else if ( modeLight <= 79 ){
            strip4.setPixelColor(modeLight - 36, strip2.Color(userColorCycle[0], userColorCycle[1], userColorCycle[2]));
            modeLight++;
        } else if ( modeLight <= 115 ){
            strip3.setPixelColor(modeLight - 80, strip2.Color(userColorCycle[0], userColorCycle[1], userColorCycle[2]));
            modeLight++;
        } else if ( modeLight <= 126 ){
            b.ledOn(modeLight - 116, userColorCycle[0], userColorCycle[1], userColorCycle[2]);
            modeLight++;
        } else {
            modeLight = 0;
        }
        
        
        strip2.show();
        strip3.show();
        strip4.show();
        delay(2);
        rerender = true;
    } else {
        modeLight = 0;
        userColorIndex = 0;
    }
    
    if(b.buttonOn(2)){
        if(eventDelay){
            Particle.publish("buttonpressright");
            eventDelay = false;
            eventTimer = 0;
        }
        
        xValue = b.readX16();
        yValue = b.readY16();
        zValue = b.readZ16();
        
        int rgb_1[3] = {0, 0, 0};
        int rgb_2[3] = {0, 0, 0};
        
        WheelRGB(pitch, rgb_1);
        WheelRGB(roll, rgb_2);

        b.allLedsOff();
        b.ledOn(b.lowestLed(), rgb_1[0], rgb_1[1], rgb_1[2]);
        b.ledOn(11 - b.lowestLed(), rgb_2[0], rgb_2[1], rgb_2[2]);
        
        int i = 0;
        
        for(i = 0; i < strip3.numPixels(); i++){
            strip3.setPixelColor(i, strip3.Color(rgb_1[0], rgb_1[1], rgb_1[2]));
            
            strip2.setPixelColor(i, strip3.Color(rgb_1[0], rgb_1[1], rgb_1[2]));
        }
        for(i = 0; i < strip4.numPixels(); i++){
            
            strip4.setPixelColor(i, strip3.Color(rgb_2[0], rgb_2[1], rgb_2[2]));
        }
        
        strip2.show();
        strip3.show();
        strip4.show();
        
        rerender = true;
        
        delay(50);
    }
    
    if(b.buttonOn(3)){
        if(eventDelay){
            Particle.publish("buttonpressdown");
            eventDelay = false;
            eventTimer = 0;
        }
        
        tcs.setInterrupt(false);      // turn on LED
        delay(60);  // takes 50ms to read 
        tcs.getRawData(&red, &green, &blue, &clear);
        tcs.setInterrupt(true);  // turn off LED
        
        // Figure out some basic hex code for visualization
        uint32_t sum = clear;
        float r, g, bl;
        
        r = red; r /= sum;
        g = green; g /= sum;
        bl = blue; bl /= sum;
        r *= 255; g *= 255; bl *= 255;    
        
        redValue = (int)r;
        greenValue = (int)g;
        blueValue = (int)bl;
        
        Particle.publish("color", (String)red + " " + (String)green + " " + (String)blue + " " + String(sum));
        
        b.allLedsOn(gammatable[(int)redValue], gammatable[(int)greenValue], gammatable[(int)blueValue]);
        int i = 0;
        byte color = strip3.Color(gammatable[(int)redValue], gammatable[(int)greenValue], gammatable[(int)blueValue]);
        for(i = 0; i < strip3.numPixels(); i++){
            strip2.setPixelColor(i, color);
            strip3.setPixelColor(i, color);
        }
        for(i = 0; i < strip4.numPixels(); i++){
            strip4.setPixelColor(i, color);
        }
        rerender = true;
        
        strip2.show();
        strip3.show();
        strip4.show();
    }
    
    if(b.buttonOn(4)){
        if(eventDelay){
            Particle.publish("buttonpressleft");
            eventDelay = false;
            eventTimer = 0;
        }

        rainbow(0);
        
        rerender = true;
        
        // delay(10);
    }

    if(!eventDelay){
        if(eventTimer > 40){
            eventTimer = 0;
            eventDelay = true;
        } else {
            eventTimer++;
        }
    }
    
    if(b.allButtonsOff() && rerender){
        // right left hood
        int i = 0;
        for(i = 0; i < strip3.numPixels(); i++){
            strip2.setPixelColor(i, strip3.Color(userRightColor[0], userRightColor[1], userRightColor[2]));
            strip3.setPixelColor(i, strip3.Color(userLeftColor[0], userLeftColor[1], userLeftColor[2]));
        }
        for(i = 0; i < strip4.numPixels(); i++){
            strip4.setPixelColor(i, strip3.Color(userHoodColor[0], userHoodColor[1], userHoodColor[2]));
        }
        b.allLedsOn(userButtonColor[0], userButtonColor[1], userButtonColor[2]);
        strip2.show();
        strip3.show();
        strip4.show();
        rerender = false;
    }
}

int rgb_values[3] = {0, 0, 0};

void rainbow(int wait){

  uint16_t i, j, k, m;

  for(j=0; j<256; j++) {
    for(m=0; m<=11; m++) {
      WheelRGB(m+j, rgb_values);
      b.ledOn(m, rgb_values[0], rgb_values[1], rgb_values[2]);
    }    
    for(i=0; i<=strip2.numPixels(); i++) {
      strip2.setPixelColor(i, Wheel((i+j) & 255));
      strip3.setPixelColor(i, Wheel((i+j) & 255));
    }
    for(k=0; k<=strip4.numPixels(); k++) {
      strip4.setPixelColor(k, Wheel((k+j) & 255));
    }
    if(!b.buttonOn(4)){
        break;
    }
    strip2.show();
    strip3.show();
    strip4.show();
    delay(wait);
  }
}


// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
uint32_t Wheel(byte WheelPos) {
  if(WheelPos < 85) {
   return strip2.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
  } else if(WheelPos < 170) {
   WheelPos -= 85;
   return strip2.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  } else {
   WheelPos -= 170;
   return strip2.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
}

void WheelRGB(byte WheelPos, int rgb[]) {
  if(WheelPos < 85) {
   rgb[0] = WheelPos * 3;
   rgb[1] = 255 - WheelPos * 3;
   rgb[2] = 0;
  } else if(WheelPos < 170) {
   WheelPos -= 85;
   rgb[0] = 255 - WheelPos * 3;
   rgb[1] = 0;
   rgb[2] = WheelPos * 3;
  } else {
   WheelPos -= 170;
   rgb[0] = 0;
   rgb[1] = WheelPos * 3;
   rgb[2] = 255 - WheelPos * 3;
  }
}

int set_color(String color){
    int bar = color.indexOf('|');
    String part = color.substring(0, bar);
    long indexNum;
    int stopPoint;
    boolean all;
    
    long red, green, blue;
    int i = bar + 1;
    String newColor = color.substring(i, i + 2);
    red = strtol(newColor, NULL, 16);
    newColor = color.substring(i + 2, i + 4);
    green = strtol(newColor, NULL, 16);
    newColor = color.substring(i + 4, i + 6);
    blue = strtol(newColor, NULL, 16);

    if(part == "hood"){
        userHoodColor[0] = red;
        userHoodColor[1] = green;
        userHoodColor[2] = blue;
    } else if (part == "right") {
        userRightColor[0] = red;
        userRightColor[1] = green;
        userRightColor[2] = blue;
    } else if (part == "left") {
        userLeftColor[0] = red;
        userLeftColor[1] = green;
        userLeftColor[2] = blue;
    } else if (part == "button") {
        userButtonColor[0] = red;
        userButtonColor[1] = green;
        userButtonColor[2] = blue;
    }
    
    return 1;
}
