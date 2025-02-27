# 2048-clone

[![CI](https://github.com/Coteh/2048-clone/actions/workflows/ci.yml/badge.svg)](https://github.com/Coteh/2048-clone/actions/workflows/ci.yml)

### [**Click here to play**](https://coteh.github.io/2048-clone)

A clone of [2048](https://play2048.co/) created using TypeScript, HTML, and CSS. This was created as a throwback to my first side project on GitHub, [2048Clone](https://github.com/Coteh/2048Clone).

![Browser Game Screenshot](screenshot.png "Browser Game Screenshot")

## Features

- Base game
- Animations, with ability to toggle them on/off
- Fullscreen mode (for desktop devices)
- Mobile-friendly web app (can be added to mobile home screens as an app, runs in fullscreen)
- Share score (using OS-native share sheet or copy to clipboard as fallback)
- Themes
    - Standard
    - Light
    - Dark
    - Snow
        - Includes the following tilesets:
            - Snow
            - Christmas
    - 2048Clone (unlock by achieving 2048 in any theme)
        - All tile color sets from 2048Clone return as tilesets for this theme:
            - Modern
            - Classic
            - Colorful
            - Initial Commit (unlock by achieving 2048 in 2048Clone theme)
- Block styles
    - Standard (default - blocks are relatively large)
    - Compact (blocks are smaller)
- Confetti animation when player achieves 2048 (using [canvas-confetti](https://github.com/catdad/canvas-confetti) library)
- Changelog Dialog
    - Shows the contents of [CHANGELOG.md](CHANGELOG.md) in a dialog box in-game
    - Uses [marked](https://github.com/markedjs/marked) during build time to parse the changelog markdown file into HTML to be displayed in the dialog

## Development Setup

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

### Optional Components

#### Nonprod App Icon

With [ImageMagick](https://imagemagick.org/) installed, both the build script and the dev server are capable of generating a version of the app icon with a label (e.g., "LOCAL", "DEV") at the bottom. This helps distinguish the local version of the app from the production build when saving it to the home screen.

![prod app icon](public/icon128.png)
![local app icon](dist/icons/icon128_LOCAL.png)

For systems without ImageMagick, the pregenerated version of the icon in the repo is used.

To generate icons with different labels, set the `DEPLOY_ENV` environment variable to the desired label before running the build script or the dev server.

Example:
```sh
# Deployment environment, (e.g. DEV) leave blank for production
DEPLOY_ENV=DEV
```

In this example, the build script will use `DEPLOY_ENV` to create icons with the "DEV" label.

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

- Undo feature
    - Currently partially implemented for debugging purposes
    - Enable debug mode when running locally to access

### Wishlist (Not Started)

- CLI interface
- Landscape mode
- Sound effects
