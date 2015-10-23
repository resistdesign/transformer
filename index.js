import JSONQuery from 'json-query';

export class Single {
    data;
    schema;
    locals;

    constructor (object, schema, locals) {
        if (typeof object !== 'object') throw new Error('Transformer received no valid object');
        if (object instanceof Array) throw new Error('Transformer received no valid object');
        this.data = object;
        if (!schema) throw new Error('Transformer received no valid schema');
        this.schema = schema;
        this.locals = locals;
    }

    add (key, value) {
        this.schema[key] = value;
        return this;
    }

    remove (key) {
        delete this.schema[key];
        return this;
    }

    parse () {
        const response = {};

        let index;

        for (index in this.schema) {
            let target = this.schema[index],
                options = {data: this.data, locals: this.locals};

            if (typeof target === 'object') {
                let newData = this.data,
                    newSchema = this.schema,
                    newLocals = this.locals;

                if (typeof target.data === 'string') {
                    newData = JSONQuery(target.data, options).value;
                    newSchema = target.schema || newSchema;
                    newLocals = target.locals || newLocals;
                }

                if (newData instanceof Array) {
                    response[index] = new List(newData, newSchema, newLocals, target.filter).parse();
                } else {
                    response[index] = new Single(newData, newSchema, newLocals).parse();
                }
            } else {
                let value = JSONQuery(target, options).value;

                if (typeof value !== 'undefined' && value !== null) {
                    response[index] = value;
                }
            }
        }
        return response;
    }
}

export class List extends Single {
    filter;

    constructor (array, schema, locals, filter) {
        if (!(array instanceof Array)) throw new Error('Transformer received no valid array');
        super({}, schema, locals);
        this.data = array;
        if (typeof filter !== 'undefined' && typeof filter !== 'object') {
            throw new Error('Transformer received an invalid filter');
        }
        this.filter = filter;
    }

    parse () {
        const response = [];

        this.data.forEach(item => {
            if (this.filter) {
                let k;

                for (k in this.filter) {
                    if (item[k] !== this.filter[k]) {
                        return;
                    }
                }
            }
            response.push(new Single(item, this.schema, this.locals).parse());
        });
        return response;
    }
}
