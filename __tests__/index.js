const { createEvent } = require('@posthog/plugin-scaffold/test/utils.js')
const { processEvent } = require('../index')

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
    const event = createEvent({ event: 'test', properties: nestedEventProperties })

    const eventsOutput = await processEvent(event, { config: { separator: '__' } })

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
        w__array__0__z: 'nested in w array'
    }

    expect(eventsOutput).toEqual(createEvent({ event: 'test', properties: expectedProperties }))
})

test('test autocapture', async () => {
    const event = createEvent({
        event: '$autocapture',
        properties: {
            $elements: [
                { tag_name: 'span', nth_child: 1 },
                { tag_name: 'div', nth_child: 1 }
            ]
        }
    })

    const eventsOutput = await processEvent(event, { config: { separator: '__' } })

    const expectedProperties = {
        $elements: [
            { tag_name: 'span', nth_child: 1 },
            { tag_name: 'div', nth_child: 1 }
        ]
    }

    expect(eventsOutput).toEqual(createEvent({ event: '$autocapture', properties: expectedProperties }))
})
