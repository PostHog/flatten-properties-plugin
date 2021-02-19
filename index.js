
async function processEventBatch(events, { config }) {
    for (let event of events) {
        if (event.properties) {
            event.properties = flattenProperties(event.properties, config.separator)
        }
    }
    return events
}


const flattenProperties = (props, sep, nestedChain = []) => {
    let newProps = {}
    for (const [key, value] of Object.entries(props)) {
        if (
            value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            Object.keys(value).length > 0
        ) {
            newProps = {...newProps, ...flattenProperties(props[key], sep, [...nestedChain, key])}
        } else {
            if (nestedChain.length > 0) {
                newProps[nestedChain.join(sep) + `${sep}${key}`] = value
            } 
        }
    }
    if (nestedChain.length > 0) {
        return {...newProps}
    }
    return {...props, ...newProps}
}

module.exports = {
    processEventBatch
}