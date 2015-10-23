| ![Transformer](logo.svg) | <h1>Transformer</h1> |
|--------------------------|----------------------|

### An advanced utility for transforming nested object structures.

- ES2016
- Forked from [manuelvulp/object-transformer](https://github.com/manuelvulp/object-transformer)
with heavy alteration.
- Implements [mmckegg/json-query](http://github.com/mmckegg/json-query)
for nested path resolution and advanced queries.

## Install

```bash
npm i --save @resistdesign/transformer
```

## Test

```bash
npm test
```

## Example

```javascript
import { Single, List } from '@resistdesign/transformer';

const models = [
    {
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
    },
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

// Schemas that will be used to transform the model

const singleSchema = {
    'title': 'user.name',
    'street': 'user.address.street'
};

const listSchema = {
    'message': 'message',
    'address': 'user.address'
};

const single = new Single(models[0], singleSchema).parse();

console.log(single); // Output: { title: 'John', street: 'FooStreet' }

const list = new List(models, listSchema /* [,] Optional `locals` for `json-query` */ ).parse();

console.log(list);  

/* Output:
[
    {
        message: 'bar',
        address: {
            street: 'FooStreet',
            house: 1,
            apartment: 2
        }
    },
    { 
        message: 'baz',
        address: {
            street: 'BarStreet',
            house: 3,
            apartment: 4
        }
    }
]
*/
```
## Nested Schema Example

```javascript
const nestedModel = {
    name: 'Vlad',
    sports: {
        boxing: {
            label: 'Boxing',
            awards: [
                {
                    // This data is seriously deep down in there isn't it?!
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

const nestedSchema = {
    firstName: 'name',
    goldBoxingAwards: {
        // The value here can be a `json-query`.
        data: 'sports.boxing.awards',
        // Only select objects in an array with values matching those specified in the filter.
        filter: {
            type: 'gold'
        },
        // A sub-schema with paths relative to the `data` path.
        schema: {
            label: 'name'
        },
        // Optional locals for `json-query`.
        locals: undefined
    }
};

const transformer = new Single(nestedModel, nestedSchema /* [,] Optional `locals` for `json-query` */ );

console.log(transformer.parse());

/* Output:
{
    "firstName": "Vlad",
    "goldBoxingAwards": [
        {
            "label": "Shiney Gold"
        },
        {
            "label": "Metallic Gold"
        }
    ]
}
*/
```
