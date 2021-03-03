const {
    createEvent
} = require('@posthog/plugin-scaffold/test/utils.js')
const { processEventBatch } = require('../index')

const nestedEventProperties = {
    a: {
        b: {
            c: {
                d: {
                    e: {
                        f: 'nested under e'
                    },
                    z: 'nested under d'
                },
                z: 'nested under c'
            },
            z: 'nested under b'
        },
        z: 'nested under a'
    },
    w: {
        array: [{ z: 'nested in w array' }]
    },
    x: 'not nested',
    y: 'not nested either'
}


test('flattens all nested properties', async () => {

    const events = [
        createEvent({ event: 'test', properties: nestedEventProperties })
    ]
    
    const eventsOutput = await processEventBatch([...events], { config: { separator: '__' } })

    const expectedProperties = {
        a: nestedEventProperties.a,
        w: nestedEventProperties.w,
        x: 'not nested',
        y: 'not nested either',
        a__b__c__d__e__f: 'nested under e',
        a__b__c__d__z: 'nested under d',
        a__b__c__z: 'nested under c',
        a__b__z: 'nested under b',
        a__z: 'nested under a',
        w__array__0__z: 'nested in w array',
      }
    
    expect(eventsOutput[0]).toEqual( createEvent({ event: 'test', properties: expectedProperties }))

})

