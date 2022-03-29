import * as R from 'ramda';
import Configstore from 'configstore';
import { readFileSync } from 'fs';
import { default as axios } from 'axios'

const packageJson = JSON.parse(readFileSync('package.json'));

const config = new Configstore(packageJson.name)

export function list() {
    const env = config.get('env');
    return R.keys(env);
}

export function add(name, opts) {
    config.set(`env.${name}`, opts);
}

export function get(name) {
    return config.get(`env.${name}`);
}

export function del(name) {
    return config.delete(`env.${name}`);
}

export function clear() {
    config.delete('env');
}

export async function test(opts) {
    const url = `${opts.baseUrl}/api/product-modeling/v2/${opts.ticketName}/domain/list`;
    const token = Buffer.from(`${opts.username}:${opts.password}`).toString('base64');
    try {
        const result = await axios.get(url, {
            headers: {
                'Authorization': `Basic ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    } catch (e) {
        return Promise.reject('Configuration test failed');
    }
}
