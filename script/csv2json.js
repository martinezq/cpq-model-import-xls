import fs from 'fs';

const INPUT = './out/descriptions.txt'; // tab-delimited
const OUTPUT = './out/descriptions.json';

function run() {
    const inputData = fs.readFileSync(INPUT).toString();
    const rows = inputData.split('\r\n');
    const objects = rows
        .map(r => r.split('\t'))
        .map(r => ({
            characteristic: r[0]?.replace(/\"/g, ''),
            value: r[1]?.replace(/\"/g, ''),
            characteristicDescriptionDe: r[2]?.replace(/\"/g, ''),
            characteristicDescriptionEn: r[3]?.replace(/\"/g, ''),
            valueDescriptionDe: r[4]?.replace(/\"/g, ''),
            valueDescriptionEn: r[5]?.replace(/\"/g, '')
        }));

    console.log(objects);

    fs.writeFileSync(OUTPUT, JSON.stringify(objects, null, 2));
}

run();