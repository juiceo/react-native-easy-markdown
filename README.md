# React Native Easy Markdown
React Native Easy Markdown is a simple React Native component for rendering [Github-flavoured markdown](https://help.github.com/articles/getting-started-with-writing-and-formatting-on-github/) as native components, and it works equally well on both Android and iOS. Parsing of the markdown is done with the robust [simple-markdown](https://github.com/Khan/simple-markdown). React Native Easy Markdown was created because other available libraries had problems reliably parsing the markdown, as well as their component trees were filled with e.g. nested ```<Text/>``` components, which made styling a nightmare. React Native Easy Markdown uses ```<View/>``` components wherever possible, and allows for easy custom styling.

For now, it supports the most common use cases, such as headings, lists, links, images and text styling. Any unsupported markdown will not crash your code, as it is simply ignored. If there is a more out-there use case you wish to have supported (such as code blocks etc.), the code is clean and simple to work on, and pull requests are most welcome.

The project is stable and the current feature-set should be enough for most use cases.

# Installation
```npm install --save react-native-easy-markdown```

# Usage
Import the component:
```import Markdown from 'react-native-easy-markdown```

And in your render method:
````
render() {
  return(
    <Markdown>
       # Why is markdown cool?
       * because it let's us do simple formatting **easily**
       * _without_ the need for complex CMS data structures
       * and you can outsource ~~your~~ work to the content creators!

       [We can add images!](http://placehold.it/300x300)
       [Or link to places](http://google.com)
    </Markdown>
  );
}
````

# Customization
The ```<Markdown/>``` component takes the following props:
Prop name  | Description | Type | Default value
------------- | ------------- | --------- | ---------
useDefaultStyles  | Use default styles (see below) | boolean | true
markdownStyles | Override the default styles for rendered components with your own (see style guide below) | object | {}
parseInline  | Parse markdown inline. Probably not needed for most ([see here](https://github.com/Khan/simple-markdown#simplemarkdowndefaultinlineparsesource)) | boolean | false
debug | Log the node tree as it renders to see if your problems are caused by the supplied markdown or the component (I hope not!) | boolean | false
style | Style prop for the ```<Markdown/>``` container | object | {}

# Styling
You can supply the component with your own ```markdownStyles``` prop to override the defaults. Available styles are:

Style | RN component | HTML equivalent | Description
------|--------------|-----------------|-------------
h1-h6 | <Text/>      | <h1/>           | # Heading 1-6, applies to all headings of the given level
text  | <Text/>      | <span/>         | Applies to all text components, (links, headings, etc.)
strong | <Text/>    | <b/>            | **Strong** (or "bold") text only
em     | <Text/>    | <i/>            | *italic* text only
del    | <Text/>    | <dunno/>        | ~~strikethrough~~ text only
linkWrapper | <TouchableOpacity/> | <div/>  | Touchable wrapper around link elements
link | <Text/> | <a/> | Link text
list | <View /> | <div/> | Wrapper around lists
listItem | <View/> | <div/> | Wrapper around list items
listItemContent | <Text/> | <span/> | List item content, excluding the bullet/number
listItemBullet | <View/> | <div/> | Bullet shown on unordered lists
listItemNumber | <Text/> | <span/> | Number shown on ordered lists
block | <View/> | <div/> | Paragraph wrapper, shows up around sections of content (depending on how your markdown is formatted)
image | <Image/> | <img/> | Image component

And the default styles as of writing this are:
```
    block: {
        marginBottom: 10
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
        justifyContent: 'flex-start',
        flexDirection: 'row'
    },
    link: {
        textDecorationLine: 'underline'
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
```
As this library is updated, the default styles might change (unlikely, but possible) and forget to update this, so feel free to check out the source code for the absolute truth.

# Contributing and roadmap
This project is stable and reliable with the current feature set, and I did not want to add support for some of the more obscure markdown components now as they are not needed for my personal use cases and I did not want to add something that is not 100% working. I am more than happy to accept pull requests for any components that you would like to see included in this library. Please make sure your code passes basic linting before submitting one, though!

Possible features to implement:
 [ ] Tables
 [ ] Blockquotes
 [ ] Nested lists
 [ ] Horizontal lines
 [ ] Task lists (like this one)
 [ ] (Your feature here)

 As mentioned, the code is quite simple to work on, and it won't take you long to figure out how to add support for various types of markdown. If you are looking to get into contributing to React Native, maybe this is a good first project for you? ;)

 # License (MIT)

Copyright 2017 Juuso Lappalainen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
