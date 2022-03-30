import * as R from 'ramda';
import Excel from 'exceljs';

function convertSheetToRawData(sheet) {
    const table = [];

    const val = (row, colNum) => row.getCell(colNum).result || row.getCell(colNum).value

    let columnNames = [];

    sheet.eachRow((row, rowNum) => {
        if (rowNum === 1) {
            for (let i=1; val(row, i) !== null; i++) {
                columnNames.push(val(row, i));
            }

            // console.log(columnNames);
        }

        if (rowNum > 1) {
            const item = R.mergeAll(columnNames.map((c, i) => ({
                [c]: val(row, i + 1)
            })));

            // console.log(item);

            table.push(item);
        }
    });

    return table;
}

function extractModules(data) {
    const groupByModuleName = R.groupBy(item => item['Module: name']);
    const moduleGroups = groupByModuleName(data);

    const moduleNames = R.keys(moduleGroups);

    return moduleNames.map(key => {
        const group = moduleGroups[key];
        const head = R.head(group);

        const descriptionLanguages = R.uniq(R.keys(head).map(x => x.match(/Module: description\_([a-z]+)/)?.[1]).filter(R.identity));

        // console.log(descriptionLanguages);

        return {
            name: head['Module: name'],
            description: head['Module: description'],
            descriptionTranslations: R.mergeAll(descriptionLanguages.map(l => ({
                [l]: head[`Module: description_${l}`]
            })))
        }
    })
}


function extractVariants(data) {
    const groupByModuleName = R.groupBy(item => item.moduleName);
    const moduleGroups = groupByModuleName(data);

    const moduleNames = R.keys(moduleGroups);

    const result = moduleNames.map(key => {
        const group = moduleGroups[key];
        const head = R.head(group);

        return group.map(v => {
            const descriptionLanguages = R.uniq(R.keys(v).map(x => x.match(/Variant: description\_([a-z]+)/)?.[1]).filter(R.identity));
            
            const featureNames = R.keys(v).map(c => c.match(/Feature: (.*)/)?.[1]).filter(R.identity);
            // const featuresObject = R.pickBy((v, n) => n.match(/Feature: .*/), v);
            // const x = R.mapObjIndexed()
            // console.log(featureNames);

            return {
                name: v['Variant: name'],
                description: v['Variant: description'],
                descriptionTranslations: R.mergeAll(descriptionLanguages.map(l => ({
                    [l]: v[`Variant: description_${l}`]
                }))),
                parentModuleNamedReference: {
                    name: v['Module: name']
                },
                variantValueList: featureNames.map(f => ({
                    value: v[`Feature: ${f}`],
                    featureNamedReference: {
                        name: f
                    }

                }))
            }
        });

    });

    return R.flatten(result);
}

// ----------------------------------------------------------------------------

function getWorksheetNames(xlsFile) {
    return xlsFile.worksheets.map(w => w.name);
}

async function resolveWorksheet(xlsFile, opts) {
    opts = opts || {};

    if (opts.selectWorksheet === true && xlsFile.worksheets.length > 1) {
        const worksheetNames = getWorksheetNames(xlsFile);

        if (!opts.selectWorksheetFunc) {
            throw "selectWorksheet option requires selectWorksheetFunc(string[]): string function";
        }

        const sheetName = await opts.selectWorksheetFunc(worksheetNames);

        return xlsFile.getWorksheet(sheetName);
    } else {
        return xlsFile.getWorksheet(1);
    }
}

export async function convertXlsToCPQ(filename, opts) {
    const workbook = new Excel.Workbook();
    const xlsFile = await workbook.xlsx.readFile(filename);

    const sheet = await resolveWorksheet(xlsFile, opts);

    const data = convertSheetToRawData(sheet);

    const domains = []; // extractDomains(data);
    const modules = extractModules(data);
    const features = []; // extractFeatures(data);
    const variants = extractVariants(data);

    return {
        domains,
        modules,
        features,
        variants
    }
}
