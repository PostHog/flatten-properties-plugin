
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
        if (Array.isArray(value)) {
            let objectFromArray = {}
            for (let i = 0; i < value.length; ++i) {
                objectFromArray[i] = value[i]
            }
            props[key] = {...objectFromArray}
            newProps = {...newProps, ...flattenProperties(props[key], sep, [...nestedChain, key])}
        } 
        else if (
            value !== null &&
            typeof value === 'object' &&
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
