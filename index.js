async function processEvent(event, { config }) {
    if (event.event !== '$autocapture' && event.properties) {
        event.properties = flattenProperties(event.properties, config.separator)
    }
    return event
}

const flattenProperties = (props, sep, nestedChain = []) => {
    let newProps = {}
    for (const [key, value] of Object.entries(props)) {
        if (key === '$elements') {
            // Don't expand $elements on $autocapture events as those will be removed anyway
        } else if (Array.isArray(value)) {
            let objectFromArray = {}
            for (let i = 0; i < value.length; ++i) {
                objectFromArray[i] = value[i]
            }
            props[key] = { ...objectFromArray }
            newProps = { ...newProps, ...flattenProperties(props[key], sep, [...nestedChain, key]) }
        } else if (value !== null && typeof value === 'object' && Object.keys(value).length > 0) {
            newProps = { ...newProps, ...flattenProperties(props[key], sep, [...nestedChain, key]) }
        } else {
            if (nestedChain.length > 0) {
                newProps[nestedChain.join(sep) + `${sep}${key}`] = value
            }
        }
    }
    if (nestedChain.length > 0) {
        return { ...newProps }
    }
    return { ...props, ...newProps }
}

module.exports = {
    processEvent
}
