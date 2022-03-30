export function merge(oldData, newData) {
    return {
        modules: newData.modules,
        features: oldData.moduleData.featureResourceList.map(x => x.feature),
        variants: mergeVariants(oldData.moduleData.variantResourceList.map(x => x.variant), newData.variants)
    };
}

function mergeVariants(oldVariants, newVariants) {
    return newVariants.map(v => {
        const oldVariant = oldVariants.find(x => x.name === v.name && x.parentModuleNamedReference.name === v.parentModuleNamedReference.name);
        const replacedValues = v.variantValueList;
        
        const keepVariantValueList = oldVariant?.variantValueList.filter(x => !Boolean(replacedValues.find(y => y.featureNamedReference.name === x.featureNamedReference.name))) || [];
        const variantValueList = keepVariantValueList.concat(replacedValues);
        
        return {
            status: 'Active',
            ...(oldVariant || {}),
            ...v,
            variantValueList
        }
    });
}