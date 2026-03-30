export const createProducts = (catMap, subCatMap) => [
    {
        product_name: "Class S12 Engine",
        qr_code: "ENG-S12-001",
        unit: "pcs",
        categoryId: catMap["Mechanical"],
        subCategoryId: subCatMap["Locomotives"]
    },
    {
        product_name: "Brake Pad Type-B",
        qr_code: "BRK-B-500",
        unit: "pcs",
        categoryId: catMap["Mechanical"],
        subCategoryId: subCatMap["Carriages"]
    },
    {
        product_name: "Signal Lamp LED",
        qr_code: "SIG-LED-100",
        unit: "pcs",
        categoryId: catMap["Signal"],
        subCategoryId: subCatMap["Interlocking"]
    }
];
