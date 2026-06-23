export const createProducts = (catMap, subCatMap) => [
    {
        asset_name: "Class S12 Engine",
        qr_code: "ENG-S12-001",
        unit: "pcs",
        categoryId: catMap["Mechanical"],
        subCategoryId: subCatMap["Locomotives"]
    },
    {
        asset_name: "Brake Pad Type-B",
        qr_code: "BRK-B-500",
        unit: "pcs",
        categoryId: catMap["Mechanical"],
        subCategoryId: subCatMap["Carriages"]
    },
    {
        asset_name: "Signal Lamp LED",
        qr_code: "SIG-LED-100",
        unit: "pcs",
        categoryId: catMap["Signal"],
        subCategoryId: subCatMap["Interlocking"]
    }
];
