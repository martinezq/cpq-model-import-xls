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
    const translationLanguages = R.uniq(moduleData.variantResourceList.map(ref => R.keys(ref.variant.descriptionTranslations)).flat());

    const findModule = v => moduleData.moduleResourceList.find(mRef => mRef.module.name === v.parentModuleNamedReference.name)?.module;

    const standardColumnResolvers = {
        'Module: name': v => findModule(v).name,
        'Module: description': v => findModule(v).description,
        ...R.mergeAll(translationLanguages.map(l => ({
            [`Module: description_${l}`]: v => findModule(v).descriptionTranslations?.[l]
        }))),
        'Variant: name': v => v.name,
        'Variant: description': v => v.description,
        ...R.mergeAll(translationLanguages.map(l => ({
            [`Variant: description_${l}`]: v => v.descriptionTranslations?.de
        })))
    };

    const featureColumnResolvers = R.mergeAll(
        globalFeatureData.featureResourceList.map(ref => ref.feature).map(f =>({
            [`Feature: ${f.name}`]: v => v.variantValueList.find(val => val.featureNamedReference.name === f.name)?.value
        }))
    );

    const columnResolvers = { ...standardColumnResolvers, ...featureColumnResolvers };

    const columnNames = R.keys(columnResolvers);

    // ------------------------------------------------------------------------

    const xlsColumns = columnNames.map(c => ({
        name: c, 
        key: c, 
        width: 20,
        filterButton: true
    }));

    const xlsRows = moduleData.variantResourceList.map(ref => {
        return R.values(R.mapObjIndexed(resolver => resolver(ref.variant), columnResolvers));
     });

    // ------------------------------------------------------------------------

    const worksheet = workbook.addWorksheet('Module variants (v2)');

    worksheet.addTable({
        name: 'VariantsTable',
        ref: 'A1',
        headerRow: true,
        totalsRow: false,
        style: {
            theme: 'TableStyleLight1',
            showRowStripes: true,
        },
        columns: xlsColumns,
        rows: xlsRows
    });

    worksheet.columns.forEach(col => col.width = 30);
}

