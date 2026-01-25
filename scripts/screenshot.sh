#!/bin/sh

CYPRESS="./node_modules/.bin/cypress"
MAGICK=magick
OUTPUT_FILE=screenshot.gif

WIDTH=286
HEIGHT=624
X=722
Y=80

if [ ! -x "$CYPRESS" -o ! -f "$CYPRESS" ]; then
    echo 1>&2 "Please install Cypress first before running this script"
    exit 1
fi

command -v "$MAGICK" > /dev/null 2>&1
if [ "$?" != 0 ]; then
    echo 1>&2 "Please install ImageMagick first before running this script"
    exit 1
fi

$CYPRESS run --spec cypress/e2e/misc/screenshot.cy.ts

# Crop filter adapted from: https://video.stackexchange.com/a/4571
# GIF filters adapted from: https://superuser.com/a/556031

# TODO: Add video screenshot
# ffmpeg -y -ss 5 -i cypress/videos/screenshot.cy.ts.mp4 -filter:v "crop=$WIDTH:$HEIGHT:$X:$Y,fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 $OUTPUT_FILE

$MAGICK cypress/screenshots/screenshot.cy.ts/readme/screenshot.png -resize 50% screenshot.png
