const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');

const ffmpegPath = require('ffmpeg-static');
const Jimp = require('jimp');


const videoFile = './videos/bad-apple.mp4';
const outputDir = './output';
const decoder = 'auto'; // Check available hwaccel options: ffmpeg -hwaccels

const imageWidth = 160;
const imageHeight = 70;
const fps = 30;




/*--------------------------------------------------------------------------------*/

let totalFrame = 0;


(() => {
    const video = path.join(__dirname, videoFile);
    const outDir = path.join(__dirname, outputDir);

    if (!fs.existsSync(outDir)) {
        console.log('Output directory does not exist. Create a new one.');
        fs.mkdirSync(outDir);
    }
    else {
        console.log('Clearing output directory');
        fs.rmSync(outDir, { recursive: true });
        fs.mkdirSync(outDir);
        console.log('Output directory cleared');
    }

    // ffmpeg -hwaccel auto -i ./bad-apple.mp4 -vf "scale=iw/2:ih/2,eq=brightness=0.15:saturation=1.5" -f image2 ./output/frames-%05d.png
    const cmd = `${ffmpegPath} -hwaccel ${decoder} -i ${video} -vf "scale=iw/2:ih/2,eq=brightness=0.15:saturation=1.5" -f image2 ${outDir}/frames-%05d.png`;

    console.log('Start extracting frames');
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.log('ffmpeg error:', err);
            return;
        }

        console.log("All frames extracted");

        const framesFileCount = (dirPath) => {
            const prefix = 'frames';
            const extension = '.png';

            const count = fs.readdirSync(dirPath)
                .filter((file) => {
                    return path.extname(file).toLowerCase() === extension && file.startsWith(prefix);
                });

            return count.length;
        }

        totalFrame = framesFileCount(outDir);
        playAsciiArt(totalFrame, fps);
    });
})();




async function playAsciiArt(totalFrame, fps) {
    const asciiChars = [' ', ' ', ' ', ' ', /*'.', ':',*//* '⠈', '⠉',*/ '⠃', '⠰', '⠈', '⠄', '⠛', /*'⠻',*/'⢿', '⣿', '⡿',/* '⠟',*//*'⠇',*//* '⢤', '⣤', '⣦', '⣶', '⣷'*/];

    try {
        const asciiArts = [];

        for (let i = 1; i <= totalFrame; i++) {
            try {
                const imagePath = `${outputDir}/frames-${i.toString().padStart(5, '0')}.png`;
                const image = await Jimp.read(imagePath);
                image.resize(imageWidth, imageHeight);

                let asciiArt = '';
                image.scan(0, 0, imageWidth, imageHeight, function (x, y, idx) {
                    const { r, g, b } = Jimp.intToRGBA(this.getPixelColor(x, y));
                    const brightness = (r + g + b) / 3;
                    const asciiIndex = Math.round((brightness / 255) * (asciiChars.length - 1));
                    asciiArt += asciiChars[asciiIndex];
                    if (x === imageWidth - 1) {
                        asciiArt += '\n';
                    }
                });

                asciiArts.push(asciiArt);
                consoleOutputEditor(i);

            } catch (error) {
                console.error(`Error converting frame ${i}: ${error}`);
                asciiArts.push('');
            }
        }

        console.log('Buffering completed');
        await confirm();

        let startTime = Date.now();
        let frameIndex = 0;

        const outputAsciiArt = () => {
            const currentTime = Date.now();
            const frameDuration = 1000 / fps;
            const expectedFrameIndex = Math.floor((currentTime - startTime) / frameDuration);

            if (expectedFrameIndex > frameIndex) {
                console.clear();
                console.log(asciiArts[frameIndex]);
                frameIndex++;
            }

            if (frameIndex < asciiArts.length) {
                setTimeout(outputAsciiArt, 0);
            }
            else {
                console.log('-- ENDED --');
                process.exit(0);
            }
        }
        outputAsciiArt();

    } catch (error) {
        console.error(`Error playing ASCII Art: ${error}`);
    }
}


const consoleOutputEditor = (frameCount) => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`Frames converted: ${frameCount}/${totalFrame}`);
};


const confirm = () => {
    return new Promise((resolve, reject) => {
        console.log('press any key to start playing.');

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once('data', () => {
            process.stdin.setRawMode(false);
            console.log('Starting process...');
            resolve();
        });
    });
}
