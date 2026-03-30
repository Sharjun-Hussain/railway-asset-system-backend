export const createRoles = (permMap) => [
    {
        name: "Super Admin",
        description: "Full system access",
        permissions: Object.values(permMap) // All permissions
    },
    {
        name: "Division Manager",
        description: "Regional oversight",
        permissions: [
            permMap["location.view"], permMap["location.manage"],
            permMap["product.view"],
            permMap["stock.view"]
        ]
    },
    {
        name: "Station Master",
        description: "Station level oversight",
        permissions: [
            permMap["location.view"],
            permMap["product.view"],
            permMap["stock.view"],
            permMap["stock.receive"], permMap["stock.issue"]
        ]
    },
    {
        name: "Warehouse Manager",
        description: "Warehouse level operations",
        permissions: [
            permMap["product.view"],
            permMap["stock.view"],
            permMap["stock.receive"], permMap["stock.issue"], permMap["stock.transfer"]
        ]
    },
    {
        name: "Staff",
        description: "Basic operations",
        permissions: [
            permMap["product.view"],
            permMap["stock.view"],
            permMap["stock.receive"]
        ]
    }
];
