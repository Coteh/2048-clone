# 2048-clone

[![Run Tests](https://github.com/Coteh/2048-clone/actions/workflows/run-tests.yml/badge.svg)](https://github.com/Coteh/2048-clone/actions/workflows/run-tests.yml)

### [**Click here to play**](https://coteh.github.io/2048-clone)

A clone of [2048](https://play2048.co/), and also a remake of my first side project on GitHub, [2048Clone](https://github.com/Coteh/2048Clone).

![Browser Game Screenshot](screenshot.png "Browser Game Screenshot")

## Setup

### Browser

[Click here to play on the browser](https://coteh.github.io/2048-clone)

## Features

- Base game
- Animations, with ability to toggle them on/off
- Share score (using OS-native share sheet or copy to clipboard as fallback)
- Themes
    - Standard
    - Light
    - Dark
    - 2048Clone (unlock by achieving 2048 in any theme)
        - All tile color sets from 2048Clone return as tilesets for this theme
            - Modern
            - Classic
            - Colorful
            - Initial Commit (unlock by achieving 2048 in 2048Clone theme)
- Block styles
    - Standard (default - blocks are relatively large)
    - Compact (blocks are smaller)
- Confetti animation when player achieves 2048 (using [canvas-confetti](https://github.com/catdad/canvas-confetti) library)

## Development

Clone this repository, then run the following:

```
npm install
```

At this point, run the following to start a local dev server:

```sh
npm run dev
```

The game should render when navigating to http://localhost:5173.

### HTTPS Local Development

The share feature uses the share sheet provided by the browser/OS and can also fall back to the browser's clipboard feature if the share sheet isn't available. Both of these features need a secure context to operate, requiring the use of a local HTTPS server when developing them. However, the game can still run on a HTTP server, where it will default to legacy clipboard functionality.

Using [mkcert](https://github.com/FiloSottile/mkcert), run the following commands to setup local certificates to be used by local HTTPS server:

```sh
mkdir ssl
cd ssl

# run this on elevated shell on Windows
mkcert -install

mkcert localhost 127.0.0.1 ::1
```

Then run the following to start up the local HTTPS server:

```sh
npm run devs
```

The game should render when navigating to https://localhost:5173.

## Testing

Run the following to launch unit tests:

```
npm run test
```

Cypress tests can be accessed by running the following:

```
npm run cypress open
```

This will launch the tests in the Cypress UI. 

Alternatively, you can run the tests directly on CLI:

```
npm run cypress run
```

## Future Improvements

### In-Progress Features

Features I started but have decided to cut for the initial release. Will come back and finish these whenever I feel like it.

- Changelog Dialog ([changelog-dialog](https://github.com/Coteh/2048-clone/tree/changelog-dialog))
    - Shows the contents of [CHANGELOG.md](CHANGELOG.md) in a dialog box in-game
    - Uses [marked](https://github.com/markedjs/marked) to parse the changelog markdown file into HTML to be displayed in the dialog
- How to Play Dialog ([expanded-how-to-play](https://github.com/Coteh/2048-clone/tree/expanded-how-to-play))
    - Shows a How to Play dialog when clicking help button instead of the tutorial animation
- Share Image feature ([share-image](https://github.com/Coteh/2048-clone/tree/share-image))
    - Allows player to share an image of their game board upon game over instead of just their score
    - Currently uses [html-to-image](https://github.com/bubkoo/html-to-image) to take a snapshot of the DOM to save as image that is then exported to share sheet
- Custom app icons based on theme([theme-icons](https://github.com/Coteh/2048-clone/tree/theme-icons))
    - Allow player to install app to home screen with a different app icon based on theme
    - Still need to sort out OS-specific issues
        - AFAIK apple-touch-icon for iOS can be dynamically changed easily, but for Android, the `manifest.json` is needed, which is a bit trickier to change on the fly.
        - Also, AFAIK, iOS web app icon is cached, so players would need to essentially re-add the app and lose their progress if they want to change the icon.

### Wishlist (Not Started)

- CLI interface
- Landscape mode
- Snow theme
- Undo feature (currently partially implemented for debugging purposes - enable debug mode when running locally to access)
- Sound effects
