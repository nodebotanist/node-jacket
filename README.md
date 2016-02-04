# Node Jacket

This repo is for the firmware, server software, and notes for the Node Jacket.

## What is the Node Jacket?

The Node Jacket is a JS track jacket that I modified to put Neopixel LEDs in the sleeves, and I made a hood and put neopixels in that, too.

The brain is a Particle Photon, using an Internet Button shield.

TODO: Add photos.

## How does it work?

The UI is as such: the default state shows the four colors (left sleeve, right sleeve, hood, and button) chosen by users via the web UI in the server. 

When the 'Up' button is pressed, the jacket wipes to each individual user-chosen color.

When the 'Down' button is pressed, the RGB color sensor is used and all the neopixels turn to the detected color.

When the 'Right' button is pressed, the leds cycle through a hue wheel (I call it Rainbow Fun Mode)

When the 'Left' button is pressed, the leds on the button shut off except for the lowest LED via the accelerometer and the inverse LED. The hues are based on the pitch and roll of the Internet Button. The hood is set to the color represented by the pitch, the sleeves the color set by the roll.

TODO: All buttons?

## How do I build this?

I'll be adding my build notes and photos to notes/build.

TODO: that.

## Running the server?

Check out server/README.md

TODO: that too.