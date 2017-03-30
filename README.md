If you don't work at Flixpress, this document won't be much help to you. Of course, if you are interested in React, you can scope out what we have done here... but it's really nothing special, and it is pretty specific to us. Just a front end to the server side video work we do at Flixpress. :wink:

# Flixpress Template Editor

## Installation

To develop on a local machine, install [Node.js](http://nodejs.org) and [Git](https://git-scm.com/), clone this repo, and then run the following command in the root directory of the cloned repo:

```
npm install
```

Alternatively, you could use some kind of GUI Git program, like the one offered at GitHub to switch to the development branch.

From there, you can start making changes to the javascript (`src/components` for the most part). Please be sure to check out a new branch of the repo, and not the master branch. (If you are unfamiliar with Git, [this 15 minute starter](https://try.github.io/levels/1/challenges/1) is good.) The master branch ought to be reserved for code that all works and can readily be run in production. We now use the [Github Flow](https://guides.github.com/introduction/flow/index.html) process at Flixpress.

To see what your changes are actually doing, it is best to do one of the following below...

## Develop Locally

The process above is ok for testing live off the Flixpress dev server, but if you are mostly interested in tweaking the user interface (or you don't work at Flixpress and just want to play around with the thing), it is probably better and faster to use this command instead:

```
npm run start
```

This will spin up a local server and open your default browser to the url for the project. Without a query param in the url, it will default to template 1000 because that is the development template. Making changes to the code here will not require you to refresh the browser page. It'll just hot swap the code and the styles.

## Publish Dev to AWS

We can build and push the non-minified file to AWS via `npm run aws`. You must have a `.env` file in the root directory of this repo that matches the structure of the `.env.example` file. The `.env` file is ignored by Git. This is important because it contains S3 credentials.

### Convenience Commands

To open a specific browser, use the `openWith` option:

```
npm run start -- --openWith "google chrome"
```

If your browser doesn't open, then you specified a name that the script didn't recognize. For example, "chrome" would not work on macOS. It must be "google chrome". I do not know where these strings are defined, so a little experimentation may be required to get it right on your machine. Leaving the option out entirely will always work by opening your system default.

There is also a convenience command that will automatically run the command above:

```
npm run chrome
```

## Build for Production

When you are all done testing via one of the methods above, kill the Terminal/Command Prompt process that is watching the files.

```
npm run build
```

This will build all the files you need into the `build` folder. Just move those to the server and you should be set. Please note that the files created here are truly for production. They suppress all the helpful warnings that are not show-stopping bugs. They also are compressed.

# Working with CSS

The style files are written using [SASS](http://sass-lang.com) which supports style nesting and variables. Regular, old css will work just fine inside a file ending in `.scss`. Some of the files I have created end in `.sass`, which is run through the same SASS processor, but has a different syntax. Those files probably ought not be edited anyway. Not until you really understand SASS.

The styles for each of the components in this project live next to the components themselves. For example, if you want to change some style in the `AccountBalance` component which lives at `src/components/AccountBalance.js`, then you'd edit the neighboring SASS file at `src/components/AccountBalance.scss`.

# Implementation

Below is the bare minimum needed on the page.

```html
<head>

  ...
  <!-- optional, but a good idea: -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <!-- required: -->
  <script src="path/to/jquery.min.js"></script>
  <!-- the script that this project creates: -->
  <script type="text/javascript" src="path/to/templateEditor.js"></script>
</head>

...

<div id="Template_FlashContent_Div"></div>

...

<!-- below are many variables that are already in use in the old, SetupRndTemplateFlash script. -->
<script type="text/javascript">
  ReactDOM.render(
    React.createElement(EditorUserInterface, {
      uiSettingsJsonUrl: "/templates/Template79.js",
      userSettingsData: {
        templateType: 'text', // Always 'text' for now
        username: 'DonDenton',
        templateId: 79,
        minutesRemainingInContract: 170.2819,
        minimumTemplateDuration: 0.1667,
        previewVideoUrl: '',
        isChargePerOrder: false,
        renderCost: 8 // Only useful if isChargePerOrder is true
      }
    }),
    document.getElementById('Template_FlashContent_Div') // Just needs to point to the div to replace.
  );
</script>

```
