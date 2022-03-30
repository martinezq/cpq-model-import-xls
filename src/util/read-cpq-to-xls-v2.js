import * as R from 'ramda';
import Excel from 'exceljs';

import { listRemote } from './promo-api.js';

// ----------------------------------------------------------------------------

export async function readCpq(conf) {
    const moduleData = await listRemote(conf, 'module');
    const globalFeatureData = await listRemote(conf, 'global-feature');
    return { moduleData, globalFeatureData };
}

export async function saveXls(moduleData, globalFeatureData, path) {
    const workbook = new Excel.Workbook();

    createGlobalFeaturesTable(workbook, moduleData, globalFeatureData);

    await workbook.xlsx.writeFile(path);
}

function createGlobalFeaturesTable(workbook, moduleData, globalFeatureData) {
    const worksheet = workbook.addWorksheet('Module variants (v2)');

    const standardColumns = [
        { name: 'Module name', key: 'moduleName', width: 30, filterButton: true },
        { name: 'Module description', key: 'moduleDescription', width: 30, filterButton: true },
        { name: 'Variant name', key: 'variantName', width: 30, filterButton: true },
        { name: 'Variant description', key: 'variantDescription', width: 30, filterButton: true }
    ];

    const featureColumns = globalFeatureData.featureResourceList.map(ref => ({
        name: ref.feature.name, 
        key: ref.feature.name, 
        width: 20,
        filterButton: true
    }));

    const featuresNames = globalFeatureData.featureResourceList.map(ref => ref.feature.name);

    const rows = moduleData.variantResourceList.map(ref => {
        const moduleRef = moduleData.moduleResourceList.find(mRef => mRef.module.name === ref.variant.parentModuleNamedReference.name);
        
        const featuresValues = featuresNames.map(featureName => {
            const val = ref.variant.variantValueList.find(val => val.featureNamedReference.name === featureName);
            return val ? val.value : undefined;
        });

        return [
            moduleRef.module.name,
            moduleRef.module.description,
            ref.variant.name,
            ref.variant.description
        ].concat(featuresValues);
     });

    worksheet.addTable({
        name: 'VariantsTable',
        ref: 'A1',
        headerRow: true,
        totalsRow: false,
        style: {
            theme: 'TableStyleLight1',
            showRowStripes: true,
        },
        columns: standardColumns.concat(featureColumns),
        rows
    });

    worksheet.columns.forEach(col => col.width = 30);
}