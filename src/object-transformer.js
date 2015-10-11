export class Single {
    data;
    schema;

    constructor(object, schema, listMode) {
        if (!listMode && typeof object !== 'object') throw new Error('Transformer received no valid object');
        if (!listMode && object instanceof Array) throw new Error('Transformer received no valid object');
        this.data = object;
        if (!schema) throw new Error('Transformer received no valid schema');
        this.schema = schema;
    }

    add(key, value) {
        this.schema[key] = value;
        return this;
    }

    remove(key) {
        delete this.schema[key];
        return this;
    }

    parse() {
        var response = {};
        for (var index in this.schema) {
            var split = this.schema[index].split('.');
            var value = this.data[split[0]];
            var breadcrumbs = split[0];

            if (!value && split.length > 1) {
                throw new Error('Malformed object, missing attribute "' +
                    breadcrumbs + '" when trying to get attribute ' +
                    breadcrumbs + '[' + split[1] + ']');
            }

            for (var i = 1; i < split.length; i++) {
                breadcrumbs += '[' + split[i] + ']';
                if (!value[split[i]] && i + 1 !== split.length) {
                    throw new Error('Malformed object, missing attribute "' +
                        breadcrumbs + '" when trying to get attribute ' +
                        breadcrumbs + '[' + split[i + 1] + ']');
                }
                value = value[split[i]];
            }
            response[index] = value;
        }
        return response;
    }
}

export class List extends Single {
    constructor(array, schema) {
        if (!(array instanceof Array)) throw new Error('Transformer received no valid array');
        super(array, schema, true);
    }

    parse() {
        var response = [];
        for (var i in this.data) {
            response.push(new Single(this.data[i], this.schema).parse());
        }
        return response;
    }
}
