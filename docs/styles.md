# Styling the UI

## Quick Overview

The style files are written using [SASS](http://sass-lang.com) which supports style nesting and variables. Regular, old css will work just fine inside a file ending in `.scss`. Some of the files I have created end in `.sass`, which is run through the same SASS processor, but has a different syntax. Those files probably ought not be edited anyway. Not until you really understand SASS.

The styles for each of the components in this project live next to the components themselves. For example, if you want to change some style in the `AccountBalance` component which lives at `src/components/AccountBalance.js`, then you'd edit the neighboring SASS file at `src/components/AccountBalance.scss`.

## Naming conventions and methodology

The structure of the main component files inside this project are heavily influenced by [Jarno Rantanen's article on css arcitecture](https://github.com/jareware/css-architecture). If you read that, you'll easily understand what is going on here.

In short, *never* use elements in the css. Always use a distinct, unique class name. For example, this is bad:

```css
.reactBasicTemplateEditor-AccountBalance span {
  /* Styles */
}
```

And this is good:

```css
.reactBasicTemplateEditor-AccountBalance .reactBasicTemplateEditor-AccountBalance-amount {
  /* Styles */
}
```

And this is better: 

```css
.reactBasicTemplateEditor-AccountBalance-amount {
  /* Styles */
}
```

If elements must be used for some reason (like you are importing code that doesn't behave in a way that lets you specify a class name), then always use the [child selector](https://css-tricks.com/almanac/selectors/c/child/) (greater than symbol) to prevent other deeply nested elements from inheriting the styles just meant for a few elements above them.

```css
.reactBasicTemplateEditor-AccountBalance > span {
  /* Styles */
}
```

## Constructing a class name

In the examples above, I created some strange looking classes. Really, they are a hypen-separated list of these three parts:

1. The application name (camelCase)
2. The component name (CamelCaps <- note the first letter is capitalized)
3. The descriptor for the given element (camelCase)

In the case of this project, every single class begins with 'reactBasicTemplateEditor'. This immediately keeps our styles from creeping out of the app and causing problems in other parts of the webpage that Flixpress displays.

For the containing element of a component, just use parts one and two.

By simply looking at the name of the class in dev tools, we know *exactly* where the style lives.
