/*
 * Mixins.test.js
 *
 * Test the mixins used to create API objects.
 */
import { APIItem, APIList } from '../Mixins';

// myObject - a simple class that we can easily test.
class myClass {
    constructor(props) {
        this.props = props
    }
}

class myTestClass extends APIItem {
    get myAttributes() {
        return [
            'simple1',
            'simple2',
            'object',
            'listOfObjects',
            'dictionaryOfObjects',
        ]
    }
    // There are 3 types of property => instance mapping:
    // 1. value => class instance.
    // 2. list value => list of instances.
    // 3. object - the value for each key in the object is instantiated with
    //    the given class.
    get myClasses() {
        return {
            'object': myClass,
            'listOfObjects': [myClass],
            'dictionaryOfObjects': { valueClass: myClass },
        }
    }
}

function TH_itHasTheRightGetters(instance) {
    it("has the right getter methods", () => {
        expect(Object.getOwnPropertyNames(instance)).toEqual([
            'worker',
            'builtFrom',
            'data',
            'opCount',
            'simple1',
            'simple2',
            'object',
            'listOfObjects',
            'dictionaryOfObjects'
        ])
    })
}

describe("item test, no parameters", () => {
    const instance = new myTestClass();
    TH_itHasTheRightGetters(instance);
});

describe("item test, has some parameters", () => {
    // The instance should have properties it is given in its data. It should
    // not have anything stored for properties it hasn't been given.
    const instance = new myTestClass(
        {
            simple1: "simple string #1",
            simple2: "simple string #2",
        }
    );

    TH_itHasTheRightGetters(instance);

    it("has data simple1", () => {
        expect('simple1' in instance.data).toBe(true);
        expect(instance.data.simple1).toBe("simple string #1");
    });
    it("has data simple2", () => {
        expect('simple2' in instance.data).toBe(true);
        expect(instance.data.simple2).toBe("simple string #2");
    });
    it("does not have data.object", () => {
        expect('object' in instance.data).toBe(false);
    });
    it("does not have data.listOfObjects", () => {
        expect('listOfObjects' in instance.data).toBe(false);
    });
    it("does not have data.dictionaryOfObjects", () => {
        expect('dictionaryOfObjects' in instance.data).toBe(false);
    });
})

describe("item test, has object instances", () => {
    // The instance should have properties it is given in its data. It should
    // not have anything stored for properties it hasn't been given.
    const instance = new myTestClass(
        {
            object: "just a string.",
            listOfObjects: ['one', 'two', 'three'],
            dictionaryOfObjects: {
                'my complex key': 'complex 1',
                simple: 'value',
            }
        }
    );

    TH_itHasTheRightGetters(instance);
    // ignore the simple parameters; we've tested there is no auto-vivification.

    it("has data.object", () => {
        expect('object' in instance.data).toBe(true);
        expect(instance.data.object).toBeInstanceOf(myClass);
        expect(instance.data.object.props).toEqual("just a string.");
    });
    it("has data.listOfObjects", () => {
        expect('listOfObjects' in instance.data).toBe(true);
        expect(instance.data.listOfObjects).toBeInstanceOf(Array);
        expect(instance.data.listOfObjects[0]).toBeInstanceOf(myClass);
        expect(instance.data.listOfObjects[1]).toBeInstanceOf(myClass);
        expect(instance.data.listOfObjects[2]).toBeInstanceOf(myClass);
        expect(instance.data.listOfObjects[0].props).toEqual("one");
        expect(instance.data.listOfObjects[1].props).toEqual("two");
        expect(instance.data.listOfObjects[2].props).toEqual("three");
    });
    it("has data.dictionaryOfObjects", () => {
        expect('dictionaryOfObjects' in instance.data).toBe(true);
        expect(instance.data.dictionaryOfObjects).toBeInstanceOf(Object);
        expect(instance.data.dictionaryOfObjects['my complex key']).toBeInstanceOf(myClass);
        expect(instance.data.dictionaryOfObjects['simple']).toBeInstanceOf(myClass);
        expect(instance.data.dictionaryOfObjects['my complex key'].props).toEqual('complex 1')
        expect(instance.data.dictionaryOfObjects['simple'].props).toEqual('value')
    });

})