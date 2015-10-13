import JSONQuery from 'json-query';

export class Single {
    data;
    schema;
    locals;

    constructor(object, schema, locals) {
        if (typeof object !== 'object') throw new Error('Transformer received no valid object');
        if (object instanceof Array) throw new Error('Transformer received no valid object');
        this.data = object;
        if (!schema) throw new Error('Transformer received no valid schema');
        this.schema = schema;
        this.locals = locals;
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
            var targetKey = this.schema[index];
            var value = JSONQuery(targetKey, {data: this.data, locals: this.locals}).value;
            if (typeof value !== 'undefined' && value !== null) {
                response[index] = value;
            }
        }
        return response;
    }
}

export class List extends Single {
    constructor(array, schema, locals) {
        if (!(array instanceof Array)) throw new Error('Transformer received no valid array');
        super({}, schema, locals);
        this.data = array;
    }

    parse() {
        var response = [];
        for (var i in this.data) {
            response.push(new Single(this.data[i], this.schema, this.locals).parse());
        }
        return response;
    }
}
