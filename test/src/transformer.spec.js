import path from 'path';
import expect from 'must';
import { Single, List } from '../../index';

describe('Transformer', () => {

    let model,
        models,
        schema,
        nestedModel,
        nestedSchema;

    beforeEach(() => {
        model = {
            id: '00eb000a0de000b000baa0ea',
            user: {
                id: '11eb111a1de111b111baa1eb',
                name: 'John',
                address: {
                    street: 'FooStreet',
                    house: 1,
                    apartment: 2
                }
            },
            message: 'bar'
        };

        models = [
            model,
            {
                id: '00eb000a0de000b000baa0ea',
                user: {
                    id: '11eb111a1de111b111baa1eb',
                    name: 'Doe',
                    address: {
                        street: 'BarStreet',
                        house: 3,
                        apartment: 4
                    }
                },
                message: 'baz'
            }
        ];

        schema = {
            'title': 'user.name',
            'street': 'user.address.street'
        };
    });

    describe('Single', () => {

        it('should throw if no object is given', () => {
            expect(() => {
                new Single();
            }).to.throw();
        });

        it('should throw if no schema is given', () => {
            expect(() => {
                new Single(model);
            }).to.throw();
        });

        it('should throw if array is given instead of an object', () => {
            expect(() => {
                new Single(models);
            }).to.throw();
        });

        it('should accept valid object and schema', () => {
            expect(() => {
                new Single(model, schema);
            }).to.not.throw();
        });

        it('should add new key to schema', () => {
            const transformer = new Single(model, schema);

            transformer.add('test', 'user.id');
            transformer.schema['test'].must.equal('user.id');
        });

        it('should remove key from schema', () => {
            const transformer = new Single(model, schema);

            transformer.remove('title');
            expect(transformer.schema['title']).to.be.undefined();
        });

        it('should parse valid response from object based on schema', () => {
            const transformer = new Single(model, schema);
            const parsed = transformer.parse();

            parsed.must.have.keys(['title', 'street']);
        });

        it('should not have schema key if trying to parse object with missing key', () => {
            model = {
                this: 'fails'
            };
            schema = {
                'title': 'certainly.fails'
            };

            const transformer = new Single(model, schema);
            const parsed = transformer.parse();

            parsed.must.not.have.keys(['title']);
        });

        it('should not have schema key if trying to parse object with missing deep key', () => {
            model = {
                this: 'fails'
            };
            schema = {
                'title': 'this.certainly.fails'
            };

            const transformer = new Single(model, schema);
            const parsed = transformer.parse();

            parsed.must.not.have.keys(['title']);
        });
    });

    describe('List', () => {

        it('should throw if no array is given', () => {
            expect(() => {
                new List();
            }).to.throw();
        });

        it('should throw if no schema is given', () => {
            expect(() => {
                new List(models);
            }).to.throw();
        });

        it('should accept valid array and schema', () => {
            expect(() => {
                new List(models, schema);
            }).to.not.throw();
        });

        it('should parse all array members', () => {
            const transformer = new List(models, schema);
            const parsed = transformer.parse();

            expect(parsed.length).to.equal(2);
        });
    });

    describe('Single w/ Nested Schemas', () => {

        beforeEach(() => {
            nestedModel = {
                name: 'Vlad',
                sports: {
                    boxing: {
                        label: 'Boxing',
                        awards: [
                            {
                                name: 'Shiney Gold',
                                type: 'gold'
                            },
                            {
                                name: 'Metallic Gold',
                                type: 'gold'
                            },
                            {
                                name: 'Shabby Trinket',
                                type: 'bronze'
                            }
                        ]
                    }
                }
            };
        });

        it('should find a nested array and transform it', () => {
            nestedSchema = {
                firstName: 'name',
                goldBoxingAwards: {
                    data: 'sports.boxing.awards',
                    filter: {
                        type: 'gold'
                    },
                    schema: {
                        label: 'name'
                    }
                }
            };

            const transformer = new Single(nestedModel, nestedSchema);
            const parsed = transformer.parse();

            expect(parsed.goldBoxingAwards.length).to.equal(2);
            expect(parsed.goldBoxingAwards[1].label).to.equal('Metallic Gold');
        });

        it('should find a nested object and transform it', () => {
            nestedSchema = {
                firstName: 'name',
                mainSport: {
                    data: 'sports.boxing',
                    schema: {
                        title: 'label'
                    }
                }
            };

            const transformer = new Single(nestedModel, nestedSchema);
            const parsed = transformer.parse();

            expect(parsed.mainSport.title).to.equal('Boxing');
        });

    });

});