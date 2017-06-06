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
import _ from 'lodash';

class Markdown extends Component {
    static propTypes = {
        debug: React.PropTypes.bool,
        useDefaultStyles: React.PropTypes.bool,
        parseInline: React.PropTypes.bool,
        markdownStyles: React.PropTypes.object,
        style: React.PropTypes.any,
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

        const defaultStyles = this.props.useDefaultStyles ? DEFAULT_STYLES : {};
        const styles = StyleSheet.create(Object.assign(defaultStyles, this.props.markdownStyles));

        this.state = {
            syntaxTree: outputResult,
            styles
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.children !== this.props.children) {
            const blockSource = nextProps.children + '\n\n';
            const parseTree = this.parser(blockSource, {inline: this.props.parseInline});
            const outputResult = this.reactOutput(parseTree);

            this.setState({
                syntaxTree: outputResult
            });
        }
    }

    shouldComponentUpdate(nextProps) {
        return this.props.children !== nextProps.children || this.props.markdownStyles !== nextProps.markdownStyles;
    }

    logDebug(nodeTree) {
        _.each(nodeTree, (node) => {
            console.log(node.key + ' - ' + node.type.displayName, node);
            if (Array.isArray(node.props.children)) {
                this.logDebug(node.props.children);
            }
        });
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

    renderListItem(node, key, index, extras) {

        const {styles} = this.state;

        return(
            <View style={styles.listItem} key={key}>
                {extras.ordered ? <Text style={styles.listItemNumber}>{index + '.'}</Text> : <View style={styles.listItemBullet}/>}
                <Text style={styles.listItemContent}>
                    {this.renderNodes(node.props.children, key, extras)}
                </Text>
            </View>
        );
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

        return(
            <TouchableOpacity style={styles.linkWrapper} key={key} activeOpacity={0.8} onPress={() => Linking.openURL(node.props.href).catch(() => {})}>
                {this.renderNodes(node.props.children, key, extras)}
            </TouchableOpacity>
        );
    }

    renderBlock(node, key, extras) {
        const {styles} = this.state;

        const nodes = this.renderNodes(node.props.children, key, extras);
        const children = nodes.map((node) => node.type.displayName);
        const uniq = _.uniq(children);

        if (uniq.length === 1 && uniq[0] === 'Text') {
            return(
                <Text key={key} style={styles.textBlock}>
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

        if (key === '2') {
            console.log("Node with key 2", node);
        }

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


export default Markdown;
