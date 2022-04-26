# marshmallow-toasting
Toast a virtual marshmallow on a digital fire

## Introduction
This project compromises two parts:
*  A React Native application that displays a 3D model of a marshmallow
*  A bash script that runs on a Linux machine to emulate a Bluetooth Low Energy (BLE) beacon

## How to use
*  Setup some sort of fireplace on a screen. This can be footage of a real fire, a simulation, etc
*  Setup a linux device (tested on Raspberry Pi 4) and give it the hostname `campfire-1`
*  Place the device next to the screen and run the `start-beacon.sh` script. This will start advertising the device over BLE
*  A user opens the React Native app on their phone and gives permissions to access gyroscope and bluetooth
*  The phone is inserted in to a selfie stick 
*  As the user comes close to the screen/BLE device, the marshmallow will begin to toast
*  Tilting the selfie stick left and right will allow the user to rotate the marshmallow

## Important notes
*  Distance is established by averaging the RSSI values for any devices named `campfire-[number]` in the vicinity
*  Multiple beacons can be added, though each hostname should follow the sequential numbering format above
*  Thresholds can be configured in `App.js`
    *   Values above COOKING_RSSI will start slowly toasting the marshmallow
    *   Values above BURNING_RSSI will rapidly cook the marshmallow

## Future improvements
*  In this case, three Pis were placed in the centre of a stack of 3 virtual fire screens. This gave enough accuracy for a quick, fun experiment at a social event.
*  By placing the devices in corners of the room, calculating the distance from each and then triangulating the centre spot from those values, an even more accurate value could be achieved. See: https://www.atlantis-press.com/article/25858154.pdf
*  Due to time constraints, three additional features were not added in time:
    *  Android support!
    *  An orange spotlight in the Three.js world from the top of the screen, in order to indicate when within cooking range
    *  A volumetric fire effect that could grow once the user had charred the marshmallow beyond a certain point
