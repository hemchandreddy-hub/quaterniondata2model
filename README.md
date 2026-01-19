# 3D Character Bone Control

This project shows a 3D human character in the browser.
You can use buttons to move the character’s **right hand** and **right leg**.


## Project Structure

The project contains:

* `index.html` – main webpage
* `style.css` – button and UI design
* `script.js` – 3D logic and bone movement
* `model.glb` – 3D character model



##  What This Project Does

* Loads a 3D character
* Shows it in the browser
* Lets you:

  * Raise and lower the right hand
  * Raise and lower the right leg
  * Reset the character to normal pose


## User Controls

Buttons are provided to:

* Raise right hand
* Lower right hand
* Raise right leg
* Lower right leg
* Reset pose


## How It Works

* The 3D model has bones
* The code rotates those bones
* Original pose is saved
* Movements are applied safely
* Reset brings the model back to normal


## Required Bones

The model should have bones for:

* Right hand
* Right leg
* Hand IK
* Foot IK


## Summary

This is a simple Three.js project that lets you control a 3D character’s bones using buttons.
It is useful for learning **3D character posing** and **bone control**.

