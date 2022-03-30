import * as R from 'ramda';
import Excel from 'exceljs';

function convertSheetToRawData(sheet) {
    const table = [];

    const val = (row, colNum) => row.getCell(colNum).result || row.getCell(colNum).value

    let columnNames = [];
    let featureNames = [];
    let count = 0;

    sheet.eachRow((row, rowNum) => {
        if (rowNum === 1) {
            for (let i=0; val(row, i) !== null; i++) {
                columnNames.push(val(row, i));
                count++;
            }
        }

        if (rowNum > 1) {
            let item = {
                moduleName: val(row, 1),
                moduleDescription: val(row, 2),
                variantName: val(row, 3),
                variantDescription: val(row, 4),
                featureValues: {}
            }

            for (let i=0; i<count; i++) {
                item.featureValues[featureNames[i]] = val(row, i + 5);
            }

            // console.log(item);

            table.push(item);
        }
    });

    return table;
}

function extractModules(data) {
    const groupByModuleName = R.groupBy(item => item.moduleName);
    const moduleGroups = groupByModuleName(data);

    const moduleNames = R.keys(moduleGroups);

    return moduleNames.map(key => {
        const group = moduleGroups[key];
        const head = R.head(group);
        return {
            name: head.moduleName,
            description: head.moduleDescription
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

        return group.map(v => ({
            name: v.variantName,
            description: v.variantDescription,
            status: 'Active',
            parentModuleNamedReference: {
                name: v.moduleName
            },
            variantPartList: [],
            variantValueList: R.keys(v.featureValues).map(f => ({
                value: v.featureValues[f],
                featureNamedReference: {
                    name: f
                }

            }))
        }));

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
