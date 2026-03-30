export const permissions = [
    // RBAC Module
    { module: "rbac", name: "view", description: "View roles and permissions" },
    { module: "rbac", name: "manage", description: "Create, update, and delete roles/permissions" },

    // Division Module
    { module: "division", name: "view", description: "View divisions" },
    { module: "division", name: "manage", description: "Manage divisions" },

    // Station Module
    { module: "station", name: "view", description: "View stations" },
    { module: "station", name: "manage", description: "Manage stations" },

    // Warehouse Module
    { module: "warehouse", name: "view", description: "View warehouses" },
    { module: "warehouse", name: "manage", description: "Manage warehouses" },


    // Product Module
    { module: "product", name: "view", description: "View products and categories" },
    { module: "product", name: "manage", description: "Manage product catalog" },

    // Stock Module
    { module: "stock", name: "view", description: "View real-time stock levels" },
    { module: "stock", name: "receive", description: "Receive new stock into warehouse" },
    { module: "stock", name: "issue", description: "Issue stock from warehouse" },
    { module: "stock", name: "transfer", description: "Transfer stock between warehouses" },
    { module: "stock", name: "adjust", description: "Manual stock adjustments" }
];
