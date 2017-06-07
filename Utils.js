class Utils = {

    static isTextOnly(nodes) {
        for (let i = 0; i < nodes.length; i++) {
            if (node[i].type.displayName !== 'Text') {
                return false;
            }
        }
    }

}

module.exports = Utils;
