# Erlangga - Bioskop 360

This project is a VR Cinema experience built with [A-Frame](https://aframe.io/). It allows users to immerse themselves in a virtual cinema environment and watch 360° videos.

## Features

- **VR Cinema Environment**: Realistic 3D cinema scene using GLTF models.
- **360° Video Playback**: Streams a sample video (`Big Buck Bunny`) onto a large virtual screen.
- **Interactive Controls**: Gaze-based cursor with fuse animation for VR interaction.
- **Loading Screen**: Displays a loading overlay until all assets (models and video) are ready.
- **Lighting**: Ambient and directional lights for realistic scene illumination.
- **NPC Model**: Animated non-player character (NPC) included in the environment.

## How It Works

- The scene loads a cinema environment and an NPC model.
- A video is projected onto a large screen in the scene.
- Users can look around and interact using gaze-based controls.
- The video starts playing when the user gazes at the screen.
- The loading overlay disappears once all assets are loaded.

## Technologies Used

- [A-Frame](https://aframe.io/) for VR scene creation.
- [aframe-extras](https://github.com/n5ro/aframe-extras) for additional controls and features.
- GLTF models for 3D assets.

## Getting Started

1. Open `index.html` in a WebVR-compatible browser.
2. Wait for the loading screen to disappear.
3. Look at the video screen to start playback.
4. Explore the VR cinema environment.

## Asset Credits

- Cinema environment and NPC models are loaded from external URLs.
- Sample video: [Big Buck Bunny](https://peach.blender.org/).

---

_This project demonstrates a basic VR cinema using web technologies. For customization, replace the video source or 3D models as needed._
