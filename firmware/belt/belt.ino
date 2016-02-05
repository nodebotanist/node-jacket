/*
 * This is a minimal example, see extra-examples.cpp for a version
 * with more explantory documentation, example routines, how to
 * hook up your pixels and all of the pixel types that are supported.
 *
 */

#include "application.h"
#include "neopixel/neopixel.h"

SYSTEM_MODE(AUTOMATIC);

// IMPORTANT: Set pixel COUNT, PIN and TYPE
#define PIXEL_PIN A0
#define PIXEL_COUNT 256
#define PIXEL_TYPE WS2812B

Adafruit_NeoPixel strip = Adafruit_NeoPixel(PIXEL_COUNT, PIXEL_PIN, PIXEL_TYPE);

int currentFrameIndex = 0;
String currentFrame;

int colors[8] = {
    strip.Color(255, 0, 0),
    strip.Color(255, 127, 0),
    strip.Color(255, 255, 0),
    strip.Color(0, 255, 0),
    strip.Color(0, 0, 255),
    strip.Color(75, 0, 130),
    strip.Color(143, 0, 255),
    strip.Color(50, 50, 50)
};

String frames[21] = {
    "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000101000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "0000002020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000001110000011011001000100001101100011100000001000000000000000000000000000000000000000000000000000000000000000000000000000",
    "0000020002200000000000220000030003030000000003000000000000000000000000000000000000000000000000000000000000000000000000000001100000111100011111100110011001000010011001100111111000111100000110000000000000000000000000000000000000000000000000000000000000000000",
    "0000220022220000003002222200333033033000000300033303300000003330003000000000000000000000000000000000000000000000000000000001100000111100011111100110011001000010011001100111111000111100000110000000000000000000000000000000000000000000000000004000000000000040",
    "0000220022223300033332222233333333003300003000033300330000333333033330000500330000000505050000000000000000000000000000000001100000111100011111100110011001000010011001100111111000111100000110000000000000000000000000000000000000000000000000044400000000000040",
    "0000220022223300033332222233333333003300003000033300330005333333003335555055330000005000505500000000055505000000000000000001100000111100011111100110011001000010011001100111111000111100000110000000000000000000000000606060000044000060000004444444000000004400",
    "0000220022223300033332222233333333003300003000033300335055333333003335555000330000050000500550070705555555550007000005500001100000111100011111100110011001000010011001100111111000111100000110000000006066600000000066060006000044006606666004444444006000004400",
    "0000220022223300033332222233333333003300003000033300335055333333003335555000330777050000500557700075555555550770770005500001100700111100011111100110011001000010011001100111111000111100066110080800666666666008000660060000600044066006666664444444666606604400",
    "0000220022223300033332222233333333003300003000033300335055333337733335555000337777750000500557700075555555550770777005500001107770111100011111100110011001000010011001100111111888111100066118800080666666666880880660060000600844066006666664444444666606604400",
    "0000220022223300033332222233333333003300003000033300335055333337733335555000337777750000500557700075555555550770777005500001107770111100011111100110011001000010011001100111111888111100066118000008666666666800888660060000688844066006666664444444666606604400",
    "0000220022223300033332222233333333003300003000033300335055333337733335555000337777750000500557700075555555550770777005500001107770111100011111100110011001000010011001100111111888111100066118800080666666666880880660060000600844066006666664444444666606604400",
    "0000220022223300033332222233333333003300003000033300335055333333003335555000330777050000500557700075555555550770770005500001100700111100011111100110011001000010011001100111111000111100066110080800666666666008000660060000600044066006666664444444666606604400",
    "0000220022223300033332222233333333003300003000033300335055333333003335555000330000050000500550070705555555550007000005500001100000111100011111100110011001000010011001100111111000111100000110000000006066600000000066060006000044006606666004444444006000004400",
    "0000220022223300033332222233333333003300003000033300330005333333003335555055330000005000505500000000055505000000000000000001100000111100011111100110011001000010011001100111111000111100000110000000000000000000000000606060000044000060000004444444000000004400",
    "0000220022223300033332222233333333003300003000033300330000333333033330000500330000000505050000000000000000000000000000000001100000111100011111100110011001000010011001100111111000111100000110000000000000000000000000000000000000000000000000044400000000000040",
    "0000220022220000003002222200333033033000000300033303300000003330003000000000000000000000000000000000000000000000000000000001100000111100011111100110011001000010011001100111111000111100000110000000000000000000000000000000000000000000000000004000000000000040",
    "0000020002200000000000220000030003030000000003000000000000000000000000000000000000000000000000000000000000000000000000000001100000111100011111100110011001000010011001100111111000111100000110000000000000000000000000000000000000000000000000000000000000000000",
    "0000002020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000001110000011011001000100001101100011100000001000000000000000000000000000000000000000000000000000000000000000000000000000",
    "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000101000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
};

void setup()
{
  strip.begin();
  strip.show(); // Initialize all pixels to 'off'
  strip.setBrightness(50);

  Particle.function("addColor", addColor);
}
void loop()
{
  //clean slate!
  strip.clear();
  
  //get the current frame
  currentFrame = frames[currentFrameIndex];

    for(int index = 0; index < currentFrame.length(); index++){
        int currentColor = atoi((String)currentFrame[index]);
        if(currentColor != 0){
            // Particle.publish("pixel", (String)index);
            strip.setPixelColor(index, colors[currentColor - 1]);
        }
    }
    
    if(currentFrameIndex == 20){
        currentFrameIndex = 0;
    } else {
        currentFrameIndex += 1;
    }

    strip.show();
    delay(100);
}


int addColor(String color)
{
    long red, green, blue;
    int i = 0;
    String newColor = color.substring(i, i + 2);
    red = strtol(newColor, NULL, 16);
    newColor = color.substring(i + 2, i + 4);
    green = strtol(newColor, NULL, 16);
    newColor = color.substring(i + 4, i + 6);
    blue = strtol(newColor, NULL, 16);
    
    Particle.publish("red", (String)red);
    Particle.publish("green", (String)green);
    Particle.publish("blue", (String)blue);

    colors[0] = colors[1];
    colors[1] = colors[2];
    colors[2] = colors[3];
    colors[3] = colors[4];
    colors[4] = colors[5];
    colors[5] = colors[6];
    colors[6] = colors[7];
    colors[7] = strip.Color(red, green, blue);
    
    return 1;  
}
    //   strip.setPixelColor(i, Wheel((i+j) & 255));

