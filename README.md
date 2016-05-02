If you don't work at Flixpress, this document won't be much help to you. Of course, if you are interested in React, you can scope out what we have done here... but it's really nothing special, and it is pretty specific to us. Just a front end to the server side video work we do at Flixpress. :wink:

# Flixpress Template Editor

## Installation

To develop on a local machine, install [Node.js](http://nodejs.org) and [Git](https://git-scm.com/), clone this repo, and then run the following command in the root directory of the cloned repo:

```
npm install
```

```
git checkout develop
```

Alternatively, you could use some kind of GUI Git program, like the one offered at GitHub to switch to the development branch.

From there, you can start making changes to the javascript (`src/components` for the most part) and the css (`src/styles/editor.scss`). Please be sure to check out the development branch of the repo, and not the master branch. (If you are unfamiliar with Git, [this 15 minute starter](https://try.github.io/levels/1/challenges/1) is good.) The master branch ought to be reserved for code that all works and can readily be run in production. Of course, to see what your changes are actually doing, it is best to do one of the following below...

## Develop Live

To develop code that you can actually run on the site for real server testing, you'll want to do the same as above, but instead of running the second command, run this one:

```
npm run dev -- --location "path/to/server/folder"
```

Path to server folder is the path to where the compiled (but not compressed) files should go so that the live server can access it. This path can be relative or absolute. For example on my computer, I'd use either of the following:

```
npm run dev -- --location "/Users/Don/Dropbox/Public/flixreact"
```

```
npm run dev -- --location "../../Dropbox/Public/flixreact"
```

In either case, the final folder is the one that `TextOnlyNoFlash.aspx` is using to get the file.

```html
// TextOnlyNoFlash.aspx -- Editor View:

<script type="text/javascript" src="https://dl.dropboxusercontent.com/u/20859562/flixreact/templateEditor.js"></script>
```

Of course, you can set this script source to anything you like. Ultimately, it will be set to a local file and We'll have a `TextOnlyNoFlashDev.aspx` that will call out to a dev file. (More on that below)

Changes you make while the Terminal/Command Prompt is watching the files will be compiled (not compresed) and loaded into the diretory you specified. Since I used Dropbox, I just had to then wait for the file to be uploaded to the cloud. This is the best way for us all to work on the file from remote locations right now.

## Develop Locally

The process above is great for testing live, but if you are mostly interested in tweaking the user interface, it is probably better and faster to use this command instead:

```
npm run start
```

This will spin up a local server and will not do much interaction with Flixpress. Right now it is hard coded to think it is on template 79, since that one has the most stuff in it of all the templates I've already moved over. Making changes to the code here will not require you to refresh the browser page. It'll just hot swap the code and the styles. Pretty nice.

## Build for Production

When you are all done testing via one of the methods above, kill the Terminal/Command Prompt process that is watching the files. Push your changes to GitHub via a Pull Request so that we can all see them and we don't either duplicate or clobber each other's work. I'll handle pulling things into the Master Branch until you are all familiar with the process. For now, just worry about pushing to the development branch.

Finally, at any time you are ready for a production build, run the following command:

```
npm run dist
```

This will build all the files you need into the `dist` folder. Just move those to the server and you should be set. Please note that the files that are created here are truly for production. They surpress all the helpful warnings that are not showstopping bugs and they pull the css out into it's own file. They also offer compressed version of the script and css files that will save BIG TIME on bandwidth.

Incidentally, you can only get the css separately when building to production like this. If you use the development methods above this section, the css is actually embeded in the Javascript. This is a convenince for development and should not really be used in production.

# Working with CSS

The editor.scss file is written using [SASS](http://sass-lang.com) which supports style nesting and variables. Regular, old css will work just fine inside this file, and I'd suggest putting any changes at the bottom until you are familiar with Sass. Running any of the commands described above will transpile the file into regular old css.

# Implementation

Below is the bare minimum needed on the page.

```html
<head>
  
  ...
  
  <!-- required -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="path/to/jquery.min.js"></script>
  <script src="path/to/flixpress.js"></script>
  <!-- the script in question -->
  <script type="text/javascript" src="path/to/templateEditor.js"></script>
  <!-- after all other styles -->
  <link rel="stylesheet" type="text/css" href="Styles/editor.css">
</head>

...

<div class="MainDiv">
  <div id="Template_FlashContent_Div"></div>
</div>

...

<!-- below are many variables that are already in use in the old, SetupRndTemplateFlash script. -->
<script type="text/javascript">
  ReactDOM.render(
    React.createElement(EditorUserInterface, {
      uiSettingsJsonUrl: "/templates/Template79.js", 
      userSettingsData: {
        templateType: "text", // Always 'text' for now
        username: 'DonDenton',
        templateId: 79,
        minutesRemainingInContract: 170.2819,
        minimumTemplateDuration: 0.1667,
        mode: 'Add',
        previewVideoUrl: '',
        isChargePerOrder: 'False',
        renderCost: 8,
        creditRemaining: 8 // This one is new, but Izzy knows how to generate it.
      }
    }),
    document.getElementById('Template_FlashContent_Div')
  );
</script>

```