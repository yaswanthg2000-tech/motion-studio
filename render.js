const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
    const framesDir = path.join(__dirname, 'frames');
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });

    // HTML Content with Animation
    await page.setContent(`
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    background: linear-gradient(135deg, #0f172a, #1e1b4b);
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    overflow: hidden;
                }
                .card {
                    text-align: center;
                    color: white;
                    opacity: 0;
                    transform: scale(0.5);
                    animation: popIn 1.5s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                h1 {
                    font-size: 80px;
                    margin: 0 0 20px 0;
                    background: linear-gradient(to right, #38bdf8, #818cf8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                p {
                    font-size: 35px;
                    color: #94a3b8;
                }
                @keyframes popIn {
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Hello Yaswanth</h1>
                <p>Motion Studio Automation</p>
            </div>
        </body>
        </html>
    `);

    const fps = 30;
    const durationSeconds = 3;
    const totalFrames = fps * durationSeconds;

    console.log('Capturing frames...');
    for (let i = 0; i < totalFrames; i++) {
        const framePath = path.join(framesDir, `frame_${String(i).padStart(4, '0')}.png`);
        await page.screenshot({ path: framePath });
        await new Promise(resolve => setTimeout(resolve, 1000 / fps));
    }

    await browser.close();
    console.log('Frames captured successfully. Rendering video with FFmpeg...');

    const outputVideo = path.join(__dirname, 'output.mp4');
    const ffmpegCommand = `ffmpeg -y -framerate ${fps} -i "${framesDir}/frame_%04d.png" -c:v libx264 -pix_fmt yuv420p "${outputVideo}"`;
    
    execSync(ffmpegCommand, { stdio: 'inherit' });
    console.log('Video rendering complete: output.mp4');
}

run();