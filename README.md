# React Native Easy Markdown
React Native Easy Markdown is a simple React Native component for rendering [Github-flavoured markdown](https://help.github.com/articles/getting-started-with-writing-and-formatting-on-github/) as native components, and it works equally well on both Android and iOS. Parsing of the markdown is done with the robust [simple-markdown](https://github.com/Khan/simple-markdown). React Native Easy Markdown was created because other available libraries had problems reliably parsing the markdown, as well as their component trees were filled with e.g. nested ```<Text/>``` components, which made styling a nightmare. React Native Easy Markdown uses ```<View/>``` components wherever possible, and allows for easy custom styling.

For now, it supports the most common use cases, such as headings, lists, links, images and text styling. Any unsupported markdown will not crash your code, as it is simply ignored. If there is a more out-there use case you wish to have supported (such as code blocks etc.), the code is clean and simple to work on, and pull requests are most welcome.

The project is stable and the current feature-set should be enough for most use cases.

* [Installation](#installation)
* [Usage](#usage)
* [Props](#props)
* [Styling](#styling)
* [Caveats](#caveats)
* [Changelog](#changelog)
* [Contributing](#contributing-and-roadmap)

# Installation

```npm install --save react-native-easy-markdown```

# Usage
````
import Markdown from 'react-native-easy-markdown

....

render() {
  return(
    <Markdown>
       # Why is markdown cool?

       * because it lets us do simple formatting **easily**
       * _without_ the need for complex CMS data structures
       * and you can outsource ~~your~~ work to the content creators!

       ![We can add images!](http://placehold.it/300x300)
       [Or link to places](http://foobar.com)
    </Markdown>
  );
}
````

# Props

Prop name  | Description | Type | Default value
------------- | ------------- | --------- | ---------
`useDefaultStyles`  | Whether to use default styles (see below) | boolean | true
`markdownStyles` | Override the default styles with your own (see style guide below) | object | {}
`parseInline`  | Parse markdown inline, which is useful for simple markdown snippets intended to be displayed on a single line. ([see here for details](https://github.com/Khan/simple-markdown#simplemarkdowndefaultinlineparsesource)) | boolean | false
`debug` | Output logs that show the component tree that is being rendered based on the supplied markdown. | boolean | false
`style` | Style for the ```<Markdown/>``` component | object | {}
`renderImage`| Custom renderer for images | function(src, alt, title) | none
`renderLink` | Custom renderer for links | function(href, title, children) | none
`renderListBullet` | Custom rendered for list bullets | function(ordered, index) | none

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
You can supply the component with your own ```markdownStyles``` prop to override the defaults. Note that styles will be overriden only for the supplied properties, and other properties will use the default styles if ```useDefaultStyles``` is true. Styles are applied to elements in order of specificity, so for example a **strong** text node would have both `text` and `strong` styles, in that order. Available styles are:

Style | RN component | Description
------|--------------|-------------
h1-h6  | `<Text/>`      | # Heading 1-6
text   | `<Text/>`      | Base styles for all text components
strong | `<Text/>`      | Additional styles for **Strong** text only
em     | `<Text/>`      | Additional styles for *italic* text only
del    | `<Text/>`      | Additional styles for ~~strikethrough~~ text only
linkWrapper | `<TouchableOpacity/>` | Touchable wrapper for links
link | `<Text/>` | Additional styles for text within links
list | `<View />` | Wrapper around lists
listItem | `<View/>` | Wrapper around list items
listItemContent | `<View/>` | List item content wrapper, excluding the bullet/number
listItemTextContent | `<Text/>`| Additional styles applied to list item content wrappers where children are only text nodes.
listItemBullet | `<View/>` | Bullet shown on unordered lists
listItemNumber | `<Text/>` | Number shown on ordered lists
block | `<View/>` | Wrapper around sections of content
textBlock | `<Text/>` | Additional styles applied to blocks where children are only text nodes.
image | `<Image/>` | Image component

And the default styles are:
```
const DEFAULT_STYLES = {
    block: {
        marginBottom: 10,
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    image: {
        width: 200,
        height: 200
    },
    h1: {
        fontSize: 30,
        marginTop: 20,
        marginBottom: 8
    },
    h2: {
        fontSize: 20,
        marginTop: 16,
        marginBottom: 8
    },
    h3: {
        fontSize: 20,
        marginTop: 16,
        marginBottom: 8
    },
    h4: {
        fontSize: 20,
        marginTop: 16,
        marginBottom: 8
    },
    h5: {
        fontSize: 20,
        marginTop: 12,
        marginBottom: 6
    },
    h6: {
        fontSize: 20,
        marginTop: 12,
        marginBottom: 6
    },
    text: {
        alignSelf: 'flex-start'
    },
    textBlock: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        marginBottom: 10
    },
    strong: {
        fontWeight: 'bold',
    },
    em: {
        fontStyle: 'italic',
    },
    del: {
        textDecorationLine: 'line-through',
    },
    linkWrapper: {
        alignSelf: 'flex-start'
    },
    link: {
        textDecorationLine: 'underline',
        alignSelf: 'flex-start'
    },
    list: {
        marginBottom: 20
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: 5,
    },
    listItemContent: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
    },
    listItemTextContent: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
    },
    listItemBullet: {
        width: 4,
        height: 4,
        backgroundColor: '#000000',
        borderRadius: 2,
        marginRight: 10
    },
    listItemNumber: {
        marginRight: 10
    }
};
```
As this library is updated, the default styles might change (unlikely, but possible) and I might forget to update this, so feel free to check out the source code for the absolute truth.


# Caveats

* Complex structures within list items, such as nested lists, should technically work but may yield unexpected results.

# Changelog

**1.1.1**
* You can now supply custom renderers for images, links and list bullets as props.
* Improved styling options and layouting.
* Replace lodash dependency with vanilla methods
* Component now updates properly if markdownStyles are changed, which makes previewing styling with hot reloading possible.

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
This project is stable and reliable with the current feature set, and I did not want to add support for some of the more obscure markdown components now as they are not needed for my personal use cases and I did not want to add something that is not 100% working. I am more than happy to accept pull requests for any components that you would like to see included in this library. Please make sure your code passes basic linting before submitting one, though!

Possible features to implement:

 - [ ] Tables
 - [ ] Blockquotes
 - [ ] Horizontal lines
 - [ ] Task lists (like this one)
 - [ ] (Your feature here)

 # License (MIT)

Copyright 2017 Juuso Lappalainen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
