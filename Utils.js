const Utils = {
    isTextOnly(nodes) {
        if (nodes.length) {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i] &&
                    nodes[i].hasOwnProperty('type') &&
                    nodes[i].type.hasOwnProperty('displayName')) {
                    if (nodes[i].type.displayName !== 'Text') {
                        return false;
                    }
                }

            }
        }
        return true;
    },

    concatStyles: function concatStyles(extras, newStyle) {
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
    },

    logDebug: function logDebug(nodeTree, level = 0) {
        for (let i = 0; i < nodeTree.length; i++) {
            const node = nodeTree[i];

            if (node) {
                let prefix = Array(level).join('-');
                console.log(prefix + '> ' + node.key + ', NODE TYPE: ' + node.type.displayName);
                if (Array.isArray(node.props.children)) {
                    this.logDebug(node.props.children, level + 1);
                }
            }
        }
    }
}

module.exports = Utils;
