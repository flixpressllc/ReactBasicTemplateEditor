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

## Develop Live (from Flixpress HQ)

> This section is somewhat deprecated. There is very little reason to develop this way, now that the [Develop Locally system](#develop-locally) works so well.

To develop code that you can actually run on the site for real server testing, you'll want to do the same as above, but instead of running the second command, run this one:

```
npm run dev -- --location "path/to/server/folder"
```

Path to server folder is the path to where the compiled (but not compressed) files should go so that the live server can access it. This path can be relative or absolute. For example on my computer, I'd use the following:

```
npm run dev -- --location "/Volumes/Don2/templates/Scripts"
```

The final folder is the one that `TextOnly.aspx` is using to get the file. (I mount my folder on the dev server at `/Volumes/Don2` on my local machine.)

```html
 <!-- TextOnly.aspx file-->

<script type="text/javascript" src="/templates/Scripts/templateEditor.js"></script>
```

Of course, you can set this script source to anything you like. Ultimately, it will be set to a local file and We'll have a `TextOnly.aspx` that will call out to a dev file. (More on that below)

Changes you make while the Terminal/Command Prompt is watching the files will be compiled (not compressed) and loaded into the directory you specified.

## Develop Locally

The process above is ok for testing live off the Flixpress dev server, but if you are mostly interested in tweaking the user interface (or you don't work at Flixpress and just want to play around with the thing), it is probably better and faster to use this command instead:

```
npm run start
```

This will spin up a local server and open your default browser to the url for the project. Without a query param in the url, it will default to template 1000 because that is the development template. Making changes to the code here will not require you to refresh the browser page. It'll just hot swap the code and the styles.

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

When you are all done testing via one of the methods above, kill the Terminal/Command Prompt process that is watching the files. Push your changes to GitHub via a Pull Request so that we can all see them and we don't either duplicate or clobber each other's work. I'll handle pulling things into the Master Branch until you are all familiar with the process. For now, just worry about pushing to the development branch.

Finally, at any time you are ready for a production build, run the following command:

```
npm run dist
```

This will build all the files you need into the `dist` folder. Just move those to the server and you should be set. Please note that the files that are created here are truly for production. They suppress all the helpful warnings that are not show-stopping bugs and they pull the css out into it's own file. They also offer compressed version of the script and css files that will save BIG TIME on bandwidth.

Incidentally, you can only get the css separately when building to production like this. If you use the development methods above this section, the css is actually embedded in the Javascript. This is a convenience for development and should not really be used in production.

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
