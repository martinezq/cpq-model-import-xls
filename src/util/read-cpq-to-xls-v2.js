import * as R from 'ramda';
import Excel from 'exceljs';
import { readFileSync } from 'fs';

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
    const input = JSON.parse(readFileSync('out/descriptions.json'));

    const translationLanguages = R.uniq(moduleData.variantResourceList.map(ref => R.keys(ref.variant.descriptionTranslations)).flat());

    const findModule = v => moduleData.moduleResourceList.find(mRef => mRef.module.name === v.parentModuleNamedReference.name)?.module;
    const findInInput = v => input.find(x => x.characteristic === findModule(v).name && String(x.value) === v.name);

    function buildModuleDescription(variant, lang) {
        const isYesNo = Boolean(variant.parentModuleNamedReference.name.match(/.*\_YES\_NO/));

        if (isYesNo) {
            const yesNoDesc = lang === 'De' ? '(Ja/Nein)' : '(Yes/No)';
            const [ _, charName, charValue ] = variant.parentModuleNamedReference.name.match(/([A-Za-z0-9_]+)\_\_([A-Za-z0-9_]+)\_\_YES\_NO/);
            const src = input.find(x => x.characteristic === charName && String(x.value) === charValue);
            
            if (!src) return;
            
            return `${src['characteristicDescription' + lang]}: ${src['valueDescription' + lang]} ${yesNoDesc}`
        } else {
            return findInInput(variant)?.[`characteristicDescription${lang}`];
        }
    }

    function buildVariantDescription(variant, lang) {
        const isYesNo = Boolean(variant.parentModuleNamedReference.name.match(/.*\_YES\_NO/));

        if (isYesNo) {
            if (lang === 'De') {
                return variant.name === 'Yes' ? 'Ja' : 'Nein';
            } else {
                return variant.name;
            } 
        } else {
            return findInInput(variant)?.[`valueDescription${lang}`];
        }
    }

    const standardColumnResolvers = {
        'Module: name': v => findModule(v).name,
        'OLD Module: description': v => findModule(v).description,
        'Module: description': v => buildModuleDescription(v, 'En') || findModule(v).description,
        'Module: description_de': v => buildModuleDescription(v, 'De') || findModule(v).descriptionTranslations?.['de'],
        ...R.mergeAll(translationLanguages.map(l => ({
            [`OLD Module: description_${l}`]: v => findModule(v).descriptionTranslations?.[l]
        }))),
        'Variant: name': v => v.name,
        'OLD Variant: description': v => v.description,
        'Variant: description': v => buildVariantDescription(v, 'En') || v.description,
        ...R.mergeAll(translationLanguages.map(l => ({
            [`OLD Variant: description_${l}`]: v => v.descriptionTranslations?.de
        }))),
        'Variant: description_de': v => buildVariantDescription(v, 'De') || v.descriptionTranslations?.de,
    };

    const featureColumnResolvers = R.mergeAll(
        globalFeatureData.featureResourceList.map(ref => ref.feature).map(f =>({
            [`Feature: ${f.name}`]: v => v.variantValueList.find(val => val.featureNamedReference.name === f.name)?.value
        }))
    );

    const columnResolvers = { ...standardColumnResolvers };

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

