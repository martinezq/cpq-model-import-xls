import { default as axios } from 'axios'

export async function createRemote(conf, type, data) {
    const url = `${conf.baseUrl}/api/product-modeling/v2/${conf.ticketName}/${type}/list`;
    const token = Buffer.from(`${conf.username}:${conf.password}`).toString('base64');
    const result = await axios.post(url, data, {
        headers: {
            'Authorization': `Basic ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    if (result.status != 200) {
        return Promise.reject(result.data | `Error code: ${result.status}`);
    }

    return result;
}

export async function listRemote(conf, type) {
    const url = `${conf.baseUrl}/api/product-modeling/v2/${conf.ticketName}/${type}/list`;
    const token = Buffer.from(`${conf.username}:${conf.password}`).toString('base64');
    const result = await axios.get(url, {
        headers: {
            'Authorization': `Basic ${token}`,
            'Accept': 'application/json'
        }
    });

    if (result.status != 200) {
        return Promise.reject(result.data | `Error code: ${result.status}`);
    }

    return result.data;
}

export async function getRemote(conf, type, id) {
    const url = `${conf.baseUrl}/api/product-modeling/v2/${conf.ticketName}/${type}/${id}`;
    const token = Buffer.from(`${conf.username}:${conf.password}`).toString('base64');
    const result = await axios.get(url, {
        headers: {
            'Authorization': `Basic ${token}`,
            'Accept': 'application/json'
        }
    });

    if (result.status != 200) {
        return Promise.reject(result.data | `Error code: ${result.status}`);
    }

    return result.data;
}

export async function getRemoteByName(conf, type, name) {
    const url = `${conf.baseUrl}/api/product-modeling/v2/${conf.ticketName}/${type}/?name=${name}`;
    const token = Buffer.from(`${conf.username}:${conf.password}`).toString('base64');
    const result = await axios.get(url, {
        headers: {
            'Authorization': `Basic ${token}`,
            'Accept': 'application/json'
        }
    });

    if (result.status != 200) {
        return Promise.reject(result.data | `Error code: ${result.status}`);
    }

    return result.data;
}


// ----------------------------------------------------------------------------

export async function getModuleXml(conf, moduleName) {
    const url = `${conf.baseUrl}/api/ticket/${conf.ticketName}/module/${moduleName}`;
    const token = Buffer.from(`${conf.username}:${conf.password}`).toString('base64');
    const result = await axios.get(url, {
        headers: {
            'Authorization': `Basic ${token}`,
            'Accept': 'text/xml'
        }
    });

    if (result.status != 200) {
        return Promise.reject(result.data | `Error code: ${result.status}`);
    }

    return result.data;
}

export async function putModuleXml(conf, moduleName, data, reties) {
    const url = `${conf.baseUrl}/api/ticket/${conf.ticketName}/module/${moduleName}`;
    const token = Buffer.from(`${conf.username}:${conf.password}`).toString('base64');
    const result = await axios.put(url, data, {
        headers: {
            'Authorization': `Basic ${token}`
        }
    });

    if (result.status != 204) {
        if (retries > 0) {
            console.log('Got response status', result.status, 'trying again');
            return await putVariantXml(conf, moduleName, variantName, data, reties - 1);
        } else {
            return Promise.reject(result.data | `Error code: ${result.status}`);
        }
    }

    return result.data;
}

export async function getVariantXml(conf, moduleName, variantName) {
    const url = `${conf.baseUrl}/api/ticket/${conf.ticketName}/module/${moduleName}/variant/${variantName}`;
    const token = Buffer.from(`${conf.username}:${conf.password}`).toString('base64');
    const result = await axios.get(url, {
        headers: {
            'Authorization': `Basic ${token}`,
            'Accept': 'text/xml'
        }
    });

    if (result.status != 200) {
        return Promise.reject(result.data | `Error code: ${result.status}`);
    }

    return result.data;
}

export async function putVariantXml(conf, moduleName, variantName, data, reties) {
    const url = `${conf.baseUrl}/api/ticket/${conf.ticketName}/module/${moduleName}/variant/${variantName}`;
    const token = Buffer.from(`${conf.username}:${conf.password}`).toString('base64');
    const result = await axios.put(url, data, {
        headers: {
            'Authorization': `Basic ${token}`
        }
    });

    if (result.status != 204) {
        if (retries > 0) {
            console.log('Got response status', result.status, 'trying again');
            return await putVariantXml(conf, moduleName, variantName, data, reties - 1);
        } else {
            return Promise.reject(result.data | `Error code: ${result.status}`);
        }
    }

    return result.data;
}

// ----------------------------------------------------------------------------


export async function postChange(conf, change) {
    const url = `${conf.baseUrl}/api/ticket/${conf.ticketName}/changes`;
    const token = Buffer.from(`${conf.username}:${conf.password}`).toString('base64');

    const dataXML = `
        <change>
            <type>${change.type}</type>
            <path>${change.path}</path>
            <value>${change.value}</value>
        </change>    
    `;

    const result = await axios.post(url, dataXML, {
        headers: {
            'Authorization': `Basic ${token}`
        }
    });

    if (result.status != 204) {
        if (retries > 0) {
            console.log('Got response status', result.status, 'trying again');
            return await putVariantXml(conf, moduleName, variantName, data, reties - 1);
        } else {
            return Promise.reject(result.data | `Error code: ${result.status}`);
        }
    }

    return result.data;
}