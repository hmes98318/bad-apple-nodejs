# bad-apple-nodejs
This is a Node.js script that plays the Bad Apple video in ASCII art.  
The script uses **FFmpeg** to extract the frames from the video and Jimp to resize and convert the frames to ASCII art.  
The resulting ASCII art frames are then played back in the console.  

## Installation
Clone the repository or download the code files.  
Install the dependencies by running `npm install` in the project directory.  

## Usage
Run the script by executing `npm run start` in the project directory.  
The script will start extracting the frames from the video and converting them to ASCII art.  
Once completed, the ASCII art frames will be displayed in the console and played back at a rate of 30 frames per second.  

Note: This script requires extracting every frame of the video for conversion, which may take some time depending on your computer's performance and the length of the video  