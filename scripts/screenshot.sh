#!/bin/sh

OUTPUT_FILE=screenshot.gif

WIDTH=286
HEIGHT=624
X=722
Y=80

# Install Cypress first before running this script

# TODO: Fix screenshots not being taken when run in headless (run in non-headless for now)
./node_modules/.bin/cypress run --spec cypress/e2e/misc/screenshot.cy.ts

# Crop filter adapted from: https://video.stackexchange.com/a/4571
# GIF filters adapted from: https://superuser.com/a/556031

# TODO: Add video screenshot
# ffmpeg -y -ss 5 -i cypress/videos/screenshot.cy.ts.mp4 -filter:v "crop=$WIDTH:$HEIGHT:$X:$Y,fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 $OUTPUT_FILE

magick convert cypress/screenshots/readme/screenshot.png -resize 50% screenshot.png
