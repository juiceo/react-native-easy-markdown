import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {
    TouchableOpacity,
    Text,
    View,
    Image,
    Linking,
    StyleSheet
} from 'react-native';
import SimpleMarkdown from 'simple-markdown';

import styles from './styles';
import Utils from './Utils';

class Markdown extends Component {
    static propTypes = {
        debug: PropTypes.bool,
        parseInline: PropTypes.bool,
        markdownStyles: PropTypes.object,
        useDefaultStyles: PropTypes.bool,
        renderImage: PropTypes.func,
        renderLink: PropTypes.func,
        renderListBullet: PropTypes.func,
    }

    static defaultProps = {
        debug: false,
        useDefaultStyles: true,
        parseInline: false,
        markdownStyles: {}
    }

    constructor(props) {
        super(props);

        const rules = SimpleMarkdown.defaultRules;
        this.parser = SimpleMarkdown.parserFor(rules);
        this.reactOutput = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rules, 'react'));
        const blockSource = this.props.children + '\n\n';
        const parseTree = this.parser(blockSource, { inline: this.props.parseInline });
        const outputResult = this.reactOutput(parseTree);

        const defaultStyles = this.props.useDefaultStyles && styles ? styles : {};
        const _styles = StyleSheet.create(Object.assign(defaultStyles, this.props.markdownStyles));

        this.state = {
            syntaxTree: outputResult,
            styles: _styles
        };
    }

    componentWillReceiveProps(nextProps) {

        let newState = {};

        if (nextProps.children !== this.props.children) {
            const blockSource = nextProps.children + '\n\n';
            const parseTree = this.parser(blockSource, { inline: this.props.parseInline });
            const outputResult = this.reactOutput(parseTree);

            newState.syntaxTree = outputResult;
        }

        if (nextProps.markdownStyles !== this.props.markdownStyles) {
            const defaultStyles = this.props.useDefaultStyles && styles ? styles : {};
            newState.styles = StyleSheet.create(Object.assign(defaultStyles, nextProps.markdownStyles));
        }

        if (Object.keys(newState).length !== 0) {
            this.setState(newState);
        }
    }

    shouldComponentUpdate(nextProps) {
        return this.props.children !== nextProps.children || this.props.markdownStyles !== nextProps.markdownStyles;
    }

    renderImage(node, key) {
        const { styles } = this.state;

        if (this.props.renderImage) {
            return this.props.renderImage(node.props.src, node.props.alt, node.props.title);
        }

        return (
            <View style={styles.imageWrapper} key={'imageWrapper_' + key}>
                <Image source={{ uri: node.props.src }} style={styles.image} />
            </View>
        );
    }

    renderLine(node, key) {
        const { styles } = this.state;

        return (
            <View style={styles.hr} key={'hr_' + key} />
        );
    }

    renderList(node, key, ordered) {

        const { styles } = this.state;

        return (
            <View key={'list_' + key} style={styles.list}>
                {this.renderNodes(node.props.children, key, { ordered })}
            </View>
        );
    }

    renderListBullet(ordered, index) {

        const { styles } = this.state;

        if (ordered) {
            return (
                <Text key={'listBullet_' + index} style={styles.listItemNumber}>{index + 1 + '.'}</Text>
            );
        }

        return (
            <View key={'listBullet_' + index} style={styles.listItemBullet} />
        );
    }

    renderListItem(node, key, index, extras) {

        const { styles } = this.state;

        let children = this.renderNodes(node.props.children, key, extras);

        return (
            <View style={styles.listItem} key={'listItem_' + key}>
                {this.props.renderListBullet ? this.props.renderListBullet(extras.ordered, index) : this.renderListBullet(extras.ordered, index)}
                <View key={'listItemContent_' + key} style={styles.listItemContent}>
                    {children}
                </View>
            </View>
        );
    }

    renderText(node, key, extras) {

        const { styles } = this.state;

        let style = (extras && extras.style) ? [styles.text].concat(extras.style) : styles.text;

        if (node.props) {
            return (
                <Text key={key} style={style}>
                    {this.renderNodes(node.props.children, key, extras)}
                </Text>
            );
        } else {
            return (
                <Text key={key} style={style}>{node}</Text>
            );
        }
    }

    renderLink(node, key) {
        const { href } = node.props;
        let onPress;
        const { styles } = this.state;
        let extras = Utils.concatStyles(null, styles.link);
        let children = this.renderNodes(node.props.children, key, extras);

        if (/^http/.test(href)) {
            onPress = () => Linking.openURL(node.props.href).catch(() => { });

            if (this.props.renderLink) {
                return this.props.renderLink(node.props.href, node.props.title, children);
            }
        } else {
            const deepLinkedScreen = href.split('?')[0];
            const actualScreen = deepLinkedScreen.split('://')[1];
            
            let deepLinkExtras;
            const extraData = href.split('?')[1];
            if (extraData) {
                const key = extraData.split('=')[0];
                const value = extraData.split('=')[1];
                deepLinkExtras = {};
                deepLinkExtras[key] = value;
            }

            onPress = () => this.props.onPress(this.props.componentId, actualScreen, deepLinkExtras);
        }

        return (
            <TouchableOpacity style={styles.linkWrapper} key={'linkWrapper_' + key} onPress={onPress}>
                {children}
            </TouchableOpacity>
        );
    }

    renderStrongLink(node, key) {
        const { styles } = this.state;
        let extras = Utils.concatStyles(null, styles.strongLink);
        
        // remove the empty spaces (" ") which is the result of the bold markdown charactes from node's children
        for (let i = 0; i < node.props.children.length; i++) {
            if (node.props.children[i] === " ") {
                delete node.props.children[i];
            }
        }
        let children = this.renderNodes(node.props.children, key, extras);

        return (
            <TouchableOpacity style={styles.linkWrapper} key={'linkWrapper_' + key} onPress={() => Linking.openURL(node.props.href).catch(() => { })}>
                {children}
            </TouchableOpacity>
        );
    }

    renderBlockQuote(node, key, extras) {
        extras = extras ? Object.assign(extras, { blockQuote: true }) : { blockQuote: true };
        return this.renderBlock(node, key, extras);
    }

    renderBlock(node, key, extras) {
        const { styles } = this.state;

        let style = [styles.block];
        let isBlockQuote;
        if (extras && extras.blockQuote) {
            isBlockQuote = true;

            /* Ensure that blockQuote style is applied only once, and not for
             * all nested components as well (unless there is a nested blockQuote)
             */
            delete extras.blockQuote;
        }
        const nodes = this.renderNodes(node.props.children, key, extras);

        if (isBlockQuote) {
            style.push(styles.blockQuote)
            return (
                <View key={'blockQuote_' + key} style={[styles.block, styles.blockQuote]}>
                    <Text>{nodes}</Text>
                </View>
            );
        }
        else {
            return (
                <View key={'block_' + key} style={styles.block}>
                    {nodes}
                </View>
            );
        }
    }

    renderNode(node, key, index, extras) {
        if (node == null || node == "null" || node == "undefined" || node == "") {
            return null;
        }

        // check when a strong node hides a link inside
        if (node.type === 'strong' && typeof(node.props.children) === 'object' && node.props.children.length > 0) {
            for (let i = 0; i < node.props.children.length; i++) {
                // check for the link
                if (node.props.children[i].type && node.props.children[i].type === 'a') {
                    node.type = 'stronga';
                }
            }
        }

        const { styles } = this.state;


        switch (node.type) {
            case 'h1': return this.renderText(node, key, Utils.concatStyles(extras, styles.h1));
            case 'h2': return this.renderText(node, key, Utils.concatStyles(extras, styles.h2));
            case 'h3': return this.renderText(node, key, Utils.concatStyles(extras, styles.h3));
            case 'h4': return this.renderText(node, key, Utils.concatStyles(extras, styles.h4))
            case 'h5': return this.renderText(node, key, Utils.concatStyles(extras, styles.h5));
            case 'h6': return this.renderText(node, key, Utils.concatStyles(extras, styles.h6));
            case 'hr': return this.renderLine(node, key);
            case 'div': return this.renderBlock(node, key, extras);
            case 'ul': return this.renderList(node, key, false);
            case 'ol': return this.renderList(node, key, true);
            case 'li': return this.renderListItem(node, key, index, extras);
            case 'a': return this.renderLink(node, key);
            case 'img': return this.renderImage(node, key);
            case 'strong': return this.renderText(node, key, Utils.concatStyles(extras, styles.strong));
            case 'stronga': return this.renderStrongLink(node, key, Utils.concatStyles(extras, styles.strong));
            case 'del': return this.renderText(this.renderLink(node, key), key, Utils.concatStyles(extras, styles.del));
            case 'em': return this.renderText(node, key, Utils.concatStyles(extras, styles.em));
            case 'u': return this.renderText(node, key, Utils.concatStyles(extras, styles.u));
            case 'blockquote': return this.renderBlockQuote(node, key);
            case undefined: return this.renderText(node, key, extras);
            default: if (this.props.debug) console.log('Node type ' + node.type + ' is not supported'); return null;
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
            console.log('\n\n==== LOGGING NODE TREE ===');
            Utils.logDebug(content);
        }

        return (
            <View {...this.props}>
                {content}
            </View>
        );
    }
}

export default Markdown;
