import React, {Component} from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    Image,
    Linking,
    StyleSheet
} from 'react-native';
import SimpleMarkdown from 'simple-markdown';

import defaultStyles from './defaultStyles';

class Markdown extends Component {
    static propTypes = {
        debug: React.PropTypes.bool,
        style: React.PropTypes.any,
        parseInline: React.PropTypes.bool,
        markdownStyles: React.PropTypes.object,
        useDefaultStyles: React.PropTypes.bool,
        renderImage: React.PropTypes.func,
        renderLink: React.PropTypes.func,
        renderListBullet: React.PropTypes.func,
    }

    static defaultProps = {
        debug: false,
        useDefaultStyles: true,
        parseInline: false,
        markdownStyles: {},
    }

    constructor(props) {
        super(props);

        const rules = SimpleMarkdown.defaultRules;
        this.parser = SimpleMarkdown.parserFor(rules);
        this.reactOutput = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rules, 'react'));
        const blockSource = this.props.children + '\n\n';
        const parseTree = this.parser(blockSource, {inline: this.props.parseInline});
        const outputResult = this.reactOutput(parseTree);

        const defaultStyles = this.props.useDefaultStyles ? defaultStyles : {};
        const styles = StyleSheet.create(Object.assign(defaultStyles, this.props.markdownStyles));

        this.state = {
            syntaxTree: outputResult,
            styles
        };
    }

    componentWillReceiveProps(nextProps) {

        let newState = {};

        if (nextProps.children !== this.props.children) {
            const blockSource = nextProps.children + '\n\n';
            const parseTree = this.parser(blockSource, {inline: this.props.parseInline});
            const outputResult = this.reactOutput(parseTree);

            newState.syntaxTree = outputResult;
        }

        if (nextProps.markdownStyles !== this.props.markdownStyles) {
            const defaultStyles = this.props.useDefaultStyles ? defaultStyles : {};

            newState.styles = StyleSheet.create(Object.assign(defaultStyles, nextProps.markdownStyles));
        }

        if (Object.keys(newState).length !== 0) {
            this.setState(newState);
        }
    }

    shouldComponentUpdate(nextProps) {
        return this.props.children !== nextProps.children || this.props.markdownStyles !== nextProps.markdownStyles;
    }

    logDebug(nodeTree) {
        for (let i = 0; i < nodeTree.length; i++) {
            const node = nodeTree[i];
            console.log(node.key + ' - ' + node.type.displayName, node);
            if (Array.isArray(node.props.children)) {
                this.logDebug(node.props.children);
            }
        }
    }

    concatStyles(extras, newStyle) {
        let newExtras;
        if (extras) {
            newExtras = JSON.parse(JSON.stringify(extras));

            if (extras.style) {
                newExtras.style.push(newStyle);
            } else {
                newExtras.style = [newStyle];
            }
        } else {
            newExtras = {
                style: [newStyle]
            };
        }
        return newExtras;
    }

    renderImage(node, key) {
        const {styles} = this.state;

        if (this.props.renderImage) {
            return this.props.renderImage(node.props.src, node.props.alt, node.props.title);
        }

        return(
            <Image key={key} source={{uri: node.props.src}} style={styles.image}/>
        );
    }

    renderList(node, key, ordered) {

        const {styles} = this.state;

        return(
            <View key={key} style={styles.list}>
                {this.renderNodes(node.props.children, key, {ordered})}
            </View>
        );
    }

    renderListBullet(ordered, index) {

        const {styles} = this.state;

        if (ordered) {
            return(
                <Text style={styles.listItemNumber}>{index + '.'}</Text>
            );
        }

        return(
            <View style={styles.listItemBullet}/>
        );
    }

    renderListItem(node, key, index, extras) {

        const {styles} = this.state;

        let children = this.renderNodes(node.props.children, key, extras);
        const childrenTypes = children.map((node) => node.type.displayName);

        let isTextOnly = true;
        for (let i = 0; i < childrenTypes.length; i++) {
            if (childrenTypes[i] !== 'Text') {
                isTextOnly = false;
                break;
            }
        }

        if (isTextOnly) {
            return(
                <View style={styles.listItem} key={key}>
                    {this.props.renderListBullet ? this.props.renderListBullet(extras.ordered, index) : this.renderListBullet(extras.ordered, index)}
                    <Text style={[styles.listItemContent, styles.listItemTextContent]}>
                        {children}
                    </Text>
                </View>
            );
        } else {
            return(
                <View style={styles.listItem} key={key}>
                    {this.props.renderListBullet ? this.props.renderListBullet(extras.ordered, index) : this.renderListBullet(extras.ordered, index)}
                    <View style={styles.listItemContent}>
                        {children}
                    </View>
                </View>
            );
        }
    }

    renderText(node, key, extras) {

        const {styles} = this.state;

        let style = (extras && extras.style) ? [styles.text].concat(extras.style) : styles.text;

        if (node.props) {
            return(
                <Text key={key} style={style}>
                    {this.renderNodes(node.props.children, key, extras)}
                </Text>
            );
        } else {
            return(
                <Text key={key} style={style}>{node}</Text>
            );
        }
    }

    renderLink(node, key) {

        const {styles} = this.state;
        let extras = this.concatStyles(null, styles.link);
        let children = this.renderNodes(node.props.children, key, extras);

        if (this.props.renderLink) {
            return this.props.renderLink(node.props.href, node.props.title, children);
        }

        return(
            <TouchableOpacity style={styles.linkWrapper} key={key} activeOpacity={0.8} onPress={() => Linking.openURL(node.props.href).catch(() => {})}>
                {children}
            </TouchableOpacity>
        );
    }

    renderBlock(node, key, extras) {
        const {styles} = this.state;

        const nodes = this.renderNodes(node.props.children, key, extras);
        const childrenTypes = nodes.map((node) => node.type.displayName);

        let isTextOnly = true;
        for (let i = 0; i < childrenTypes.length; i++) {
            if (childrenTypes[i] !== 'Text') {
                isTextOnly = false;
                break;
            }
        }

        if (isTextOnly) {
            return(
                <Text key={key} style={[styles.block, styles.textBlock]}>
                    {nodes}
                </Text>
            );
        } else {
            return(
                <View key={key} style={styles.block}>
                    {nodes}
                </View>
            );
        }
    }

    renderNode(node, key, index, extras) {

        const {styles} = this.state;

        switch(node.type) {
            case 'h1': {
                let newExtras = this.concatStyles(extras, styles.h1);
                return this.renderText(node, key, newExtras);
            }
            case 'h2': {
                let newExtras = this.concatStyles(extras, styles.h2);
                return this.renderText(node, key, newExtras);
            }
            case 'h3': {
                let newExtras = this.concatStyles(extras, styles.h3);
                return this.renderText(node, key, newExtras);
            }
            case 'h4': {
                let newExtras = this.concatStyles(extras, styles.h4);
                return this.renderText(node, key, newExtras);
            }
            case 'h5': {
                let newExtras = this.concatStyles(extras, styles.h5);
                return this.renderText(node, key, newExtras);
            }
            case 'h6': {
                let newExtras = this.concatStyles(extras, styles.h6);
                return this.renderText(node, key, newExtras);
            }
            case 'div': return this.renderBlock(node, key, extras);
            case 'ul': return this.renderList(node, key, false);
            case 'ol': return this.renderList(node, key, true);
            case 'li': return this.renderListItem(node, key, index, extras);
            case 'a': return this.renderLink(node, key);
            case 'img': return this.renderImage(node, key);
            case 'strong': {
                let newExtras = this.concatStyles(extras, styles.strong);
                return this.renderText(node, key, newExtras);
            }
            case 'del': {
                let newExtras = this.concatStyles(extras, styles.del);
                return this.renderText(node, key, newExtras);
            }
            case 'em': {
                let newExtras = this.concatStyles(extras, styles.em);
                return this.renderText(node, key, newExtras);
            }
            case undefined: return this.renderText(node, key, extras);
            default: if (this.props.debug) console.log('Node type '+node.type+' is not supported'); return null;
        }
    }

    renderNodes(nodes, key, extras) {
        return nodes.map((node, index) => {
            const newKey = key ? key + '_' + index : index + '';
            return this.renderNode(node, newKey, index, extras);
        });
    }

    render() {
        let content = this.renderNodes(this.state.syntaxTree, null, null);

        if (this.props.debug) {
            this.logDebug(content);
        }

        return(
            <View style={this.props.style}>
                {content}
            </View>
        );
    }
}

export default Markdown;
