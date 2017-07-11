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

import styles from './styles';
import Utils from './Utils';

class Markdown extends Component {
    static propTypes = {
        debug: React.PropTypes.bool,
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
        markdownStyles: {}
    }

    constructor(props) {
        super(props);

        const rules = SimpleMarkdown.defaultRules;
        this.parser = SimpleMarkdown.parserFor(rules);
        this.reactOutput = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rules, 'react'));
        const blockSource = this.props.children + '\n\n';
        const parseTree = this.parser(blockSource, {inline: this.props.parseInline});
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
            const parseTree = this.parser(blockSource, {inline: this.props.parseInline});
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
        const {styles} = this.state;

        if (this.props.renderImage) {
            return this.props.renderImage(node.props.src, node.props.alt, node.props.title);
        }

        return(
            <View style={styles.imageContainer}>
                <Image key={key} source={{uri: node.props.src}} style={styles.image}/>
            </View>
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

        if (Utils.isTextOnly(children)) {
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
        let extras = Utils.concatStyles(null, styles.link);
        let children = this.renderNodes(node.props.children, key, extras);

        if (this.props.renderLink) {
            return this.props.renderLink(node.props.href, node.props.title, children);
        }

        return(
            <TouchableOpacity style={styles.linkWrapper} key={key} onPress={() => Linking.openURL(node.props.href).catch(() => {})}>
                {children}
            </TouchableOpacity>
        );
    }

    renderBlockQuote(node, key) {

        const {styles} = this.state;

        return(
            <View style={styles.blockQuote}>
                {JSON.stringify(node, null, 4)}
            </View>
        );
    }

    renderBlock(node, key, extras) {
        const {styles} = this.state;

        const nodes = this.renderNodes(node.props.children, key, extras);

        if (Utils.isTextOnly(nodes)) {
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
            case 'h1': return this.renderText(node, key, Utils.concatStyles(extras, styles.h1));
            case 'h2': return this.renderText(node, key, Utils.concatStyles(extras, styles.h2));
            case 'h3': return this.renderText(node, key, Utils.concatStyles(extras, styles.h3));
            case 'h4': return this.renderText(node, key, Utils.concatStyles(extras, styles.h4))
            case 'h5': return this.renderText(node, key, Utils.concatStyles(extras, styles.h5));
            case 'h6': return this.renderText(node, key, Utils.concatStyles(extras, styles.h6));
            case 'div': return this.renderBlock(node, key, extras);
            case 'ul': return this.renderList(node, key, false);
            case 'ol': return this.renderList(node, key, true);
            case 'li': return this.renderListItem(node, key, index, extras);
            case 'a': return this.renderLink(node, key);
            case 'img': return this.renderImage(node, key);
            case 'strong': return this.renderText(node, key, Utils.concatStyles(extras, styles.strong));
            case 'del': return this.renderText(node, key, Utils.concatStyles(extras, styles.del));
            case 'em': return this.renderText(node, key, Utils.concatStyles(extras, styles.em));
            case 'blockquote': return this.renderBlockQuote(node, key);
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
            Utils.logDebug(content);
        }

        return(
            <View {...this.props}>
                {content}
            </View>
        );
    }
}

export default Markdown;
