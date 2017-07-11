# React Native Easy Markdown
React Native Easy Markdown is a simple React Native component for rendering [Markdown](https://help.github.com/articles/getting-started-with-writing-and-formatting-on-github/) as native components, and it works equally well on both Android and iOS. 

RNEM was created because other available libraries seemed to be somewhat inconsistent in how the parsed markdown is displayed, and they would render component trees filled with e.g. nested ```<Text/>``` components where that was not necessary, which made styling difficult. RNEM also provides a possibility to supply your own render methods for certain components, such as images and links, so you can style and layout them however you wish.

For now, the following markdown is supported: 

* Text formatting (headings, strong, italics, strikethrough...)
* Lists (ordered / unordered )
* Images
* Links

Any unsupported markdown will not crash your app, as it is simply ignored. If there is a more out-there use case you wish to have supported (such as code blocks etc.), the code is clean and simple to work on, and pull requests are most welcome. The project is stable and the current feature set should be enough for most use cases. 

* [Installation](#installation)
* [Usage](#usage)
* [Props](#props)
* [Styling](#styling)
* [Caveats](#caveats)
* [Change Log](#change-log)
* [Contributing](#contributing-and-roadmap)

# Installation

```npm install --save react-native-easy-markdown```

# Usage

````
import Markdown from 'react-native-easy-markdown';

....

render() {
  return(
    <Markdown>
     {
        '# Why is markdown cool?\n\n' +

        '* because it lets us do simple formatting **easily** \n' +
        '* _without_ the need for complex CMS data structures \n' +
        '* and you can outsource ~~your~~ work to the content creators! \n\n' +

        '![We can add images!](http://placehold.it/300x300) \n' +
        '[Or link to places](http://foobar.com) \n'
      }
    </Markdown>
  );
}
````

# Props

Prop name           | Description   | Type      | Default value
--------------------|---------------|-----------|----------------
`useDefaultStyles`  | Whether to use default styles (see below) | boolean | true
`markdownStyles`    | Override the default styles with your own (see style guide below) | object | {}
`parseInline`       | Parse markdown inline, which is useful for simple markdown snippets intended to be displayed on a single line. ([see here for details](https://github.com/Khan/simple-markdown#simplemarkdowndefaultinlineparsesource)) | boolean | false
`debug`             | Output logs that show the component tree that is being rendered based on the supplied markdown. | boolean | false
`style`             | Style for the ```<Markdown/>``` component | object | {}
`renderImage`       | Custom renderer for images | function | none
`renderLink`        | Custom renderer for links | function | none
`renderListBullet`  | Custom rendered for list bullets | function | none

If you need more control over how some of the components are rendered, you may provide the custom renderers outlined above like so:

```
renderImage(src, alt, title) {
    return(
        <MyImageComponent source={{uri: src}}/>
    );
}

renderLink(href, title, children) {
    return(
        <MyTouchableThing onPress={() => console.log("Opening link: " + href)}>
            {children}
        </MyTouchableThing>
    );
}

renderListBullet(ordered, index) {
    return(
        <View style={{width: 20, height: 20, backgroundColor: 'red}}/>
    );
}
```

Notice the `children` parameter passed to `renderLink`, which contains whatever children would otherwise be rendered within the link. In the default implementation, those children will be rendered within a `<TouchableOpacity/>` but this gives you the possibility to provide your own touchable component.

# Styling
You can supply the component with your own ```markdownStyles``` prop to override the defaults. Note that styles will be overridden only for the supplied properties, and other properties will use the default styles if ```useDefaultStyles``` is true. Styles are applied to elements in order of specificity, so for example a **strong** text node would have both `text` and `strong` styles, in that order. Available styles are:

Style               | RN component          | Description
--------------------|-----------------------|-------------
h1-h6               | `<Text/>`             | # Heading 1-6
text                | `<Text/>`             | Base styles for all text components
strong              | `<Text/>`             | Additional styles for **Strong** text only
em                  | `<Text/>`             | Additional styles for *italic* text only
del                 | `<Text/>`             | Additional styles for ~~strikethrough~~ text only
linkWrapper         | `<TouchableOpacity/>` | Touchable wrapper for links
link                | `<Text/>`             | Additional styles for text within links
list                | `<View />`            | Wrapper around lists
listItem            | `<View/>`             | Wrapper around list items
listItemContent     | `<View/>`             | List item content wrapper, excluding the bullet/number
listItemTextContent | `<Text/>`             | Additional styles applied to list item content wrappers where children are only text nodes.
listItemBullet      | `<View/>`             | Bullet shown on unordered lists
listItemNumber      | `<Text/>`             | Number shown on ordered lists
block               | `<View/>`             | Wrapper around paragraphs
textBlock           | `<Text/>`             | Additional styles applied to paragraphs where children are only text nodes.
imageWrapper        | `<View/>`             | Wrapper around images, for easier layouting
image               | `<Image/>`            | Image component

See [default styles](https://github.com/lappalj4/react-native-easy-markdown/blob/master/styles.js) for reference.

# Caveats

* Complex structures within list items, such as nested lists, should technically work but may yield unexpected results.
* HTML-style raw text input will not be parsed correctly. Strings coming from an API or CMS etc. will work normally, but if you wish to supply the markdown component text directly as in the example, use the same format used there.

# Change Log

**1.1.3**
* Update default styles and move them to separate file.

**1.1.2**
* You can now supply custom renderers for images, links and list bullets as props.
* Improved styling options and layouting.
* Replace lodash dependency with vanilla methods
* Component now updates properly if markdownStyles are changed, which makes previewing styling with hot reloading possible.

**1.1.1**
* Minor bug fixes

**1.1.0**
* Significant improvements to text layouting. Links are now displayed inline by default.
* Fixed issue: 'Nesting `<View>` within `<Text>` is not supported on Android'
* Updated default styles.

**1.0.5**
* Removed video support, which was not working correctly.

**1.0.4**
* Improved layout for text-only sections. Now wrapped in a Text component instead of a View, which makes sure nested text wraps properly.

**1.0.3**
* Fixed missing return statement in componentShouldUpdate that was throwing a warning

# Contributing and roadmap
This project is stable and reliable with the current feature set, and I did not want to add support for some of the more obscure markdown components now as they are not needed for my personal use cases and I did not want to add something that is not 100% working. I am more than happy to accept pull requests for any components that you would like to see included in this library.

Possible features to implement:

 - [ ] Tables
 - [ ] Blockquotes
 - [ ] Horizontal lines
 - [ ] Task lists
 - [ ] [More ideas](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

# License (MIT)

Copyright 2017 Juuso Lappalainen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
