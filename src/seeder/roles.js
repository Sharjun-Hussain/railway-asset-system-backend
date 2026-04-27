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
            permMap["division.view"], permMap["division.manage"],
            permMap["station.view"], permMap["station.manage"],
            permMap["warehouse.view"],
            permMap["product.view"],
            permMap["stock.view"],
            permMap["user.view"],
            permMap["report.view"]
        ]
    },
    {
        name: "Station Master",
        description: "Station level oversight",
        permissions: [
            permMap["division.view"],
            permMap["station.view"],
            permMap["warehouse.view"], permMap["warehouse.manage"],
            permMap["product.view"],
            permMap["stock.view"],
            permMap["stock.receive"], permMap["stock.issue"],
            permMap["report.view"]
        ]
    },

    {
        name: "Warehouse Manager",
        description: "Warehouse level operations",
        permissions: [
            permMap["product.view"],
            permMap["stock.view"],
            permMap["stock.receive"], permMap["stock.issue"], permMap["stock.transfer"],
            permMap["stock.audit"]
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
    },
    {
        name: "Auditor",
        description: "System-wide view access for auditing",
        permissions: [
            permMap["product.view"],
            permMap["stock.view"],
            permMap["report.view"],
            permMap["division.view"],
            permMap["station.view"],
            permMap["warehouse.view"],
            permMap["rbac.view"],
            permMap["user.view"],
            permMap["system.bypass_scope"]
        ]
    }
];
