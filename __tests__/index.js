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

test('test set and set once', async () => {
    const event = createEvent({
        event: '$identify',
        properties: {
            $set: {
                example: {
                    company_size: 20,
                    category: ['a', 'b']
                }
            },
            $set_once: {
                example: {
                    company_size: 20,
                    category: ['a', 'b']
                }
            }
        }
    })

    const eventsOutput = await processEvent(event, { config: { separator: '__' } })

    const expectedProperties = {
        $set: {
            example: {
                company_size: 20,
                category: ['a', 'b']
            },
            example__company_size: 20,
            example__category__0: 'a',
            example__category__1: 'b'
        },
        $set_once: {
            example: {
                company_size: 20,
                category: ['a', 'b']
            },
            example__company_size: 20,
            example__category__0: 'a',
            example__category__1: 'b'
        }
    }

    expect(eventsOutput.properties).toEqual(expectedProperties)
})
