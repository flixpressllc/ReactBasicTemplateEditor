# Styling the UI

## Quick Overview

The style files are written using [SASS](http://sass-lang.com) which supports style nesting and variables. Regular, old css will work just fine inside a file ending in `.scss`. Some of the files I have created end in `.sass`, which is run through the same SASS processor, but has a different syntax. Those files probably ought not be edited anyway. Not until you really understand SASS.

The styles for each of the components in this project live next to the components themselves. For example, if you want to change some style in the `AccountBalance` component which lives at `src/components/AccountBalance.js`, then you'd edit the neighboring SASS file at `src/components/AccountBalance.scss`.
