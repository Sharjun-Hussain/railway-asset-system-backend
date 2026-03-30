export const permissions = [
    // RBAC Module
    { module: "rbac", name: "view", description: "View roles and permissions" },
    { module: "rbac", name: "manage", description: "Create, update, and delete roles/permissions" },

    // Location Module
    { module: "location", name: "view", description: "View divisions, stations, and warehouses" },
    { module: "location", name: "manage", description: "Manage geographical hierarchy" },

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
