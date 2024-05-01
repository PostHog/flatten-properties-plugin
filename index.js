async function processEvent(event, { config }) {
    try {
        if (event.event !== '$autocapture' && event.properties) {
            event.properties = flattenProperties(event.properties, config.separator)
        }
    } catch (e) {
        throw e
    }
    return event
}

const propertyDenyList = ['$elements', '$elements_chain', '$groups', '$active_feature_flags', '$heatmap_data']

const flattenProperties = (props, sep, nestedChain = []) => {
    let newProps = {}
    for (const [key, value] of Object.entries(props)) {
        if (propertyDenyList.includes(key)) {
            // Hide 'internal' properties used in event processing
        } else if (key === '$set') {
            newProps = { ...newProps, $set: { ...props[key], ...flattenProperties(props[key], sep) } }
        } else if (key === '$set_once') {
            newProps = { ...newProps, $set_once: { ...props[key], ...flattenProperties(props[key], sep) } }
        } else if (key === '$group_set') {
            newProps = { ...newProps, $group_set: { ...props[key], ...flattenProperties(props[key], sep) } }
        } else if (Array.isArray(value)) {
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
