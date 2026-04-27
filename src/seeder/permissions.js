export const permissions = [
    // RBAC Module
    { module: "rbac", name: "view", description: "View roles and permissions" },
    { module: "rbac", name: "manage", description: "Full control over roles and permissions" },

    // User Management
    { module: "user", name: "view", description: "View system users" },
    { module: "user", name: "manage", description: "Create, update, and deactivate users" },

    // Division Module
    { module: "division", name: "view", description: "View administrative divisions" },
    { module: "division", name: "manage", description: "Manage divisions and regional assignments" },

    // Station Module
    { module: "station", name: "view", description: "View railway stations" },
    { module: "station", name: "manage", description: "Manage stations and their properties" },

    // Warehouse Module
    { module: "warehouse", name: "view", description: "View storage locations/warehouses" },
    { module: "warehouse", name: "manage", description: "Manage warehouses and assignments" },

    // Product/Asset Catalog
    { module: "product", name: "view", description: "View product catalog and categories" },
    { module: "product", name: "manage", description: "Full control over product definitions" },
    { module: "product", name: "export", description: "Export catalog data" },

    // Inventory/Stock Operations
    { module: "stock", name: "view", description: "View real-time stock levels" },
    { module: "stock", name: "receive", description: "Approve and receive new stock" },
    { module: "stock", name: "issue", description: "Issue stock for maintenance/operations" },
    { module: "stock", name: "transfer", description: "Move stock between warehouses" },
    { module: "stock", name: "adjust", description: "Perform manual stock corrections" },
    { module: "stock", name: "audit", description: "Perform stock takes and audits" },

    // Reporting & Analytics
    { module: "report", name: "view", description: "View basic reports" },
    { module: "report", name: "advanced", description: "Access advanced analytics and cost reports" },

    // System Settings
    { module: "setting", name: "view", description: "View system configuration" },
    { module: "setting", name: "manage", description: "Modify system-wide settings" }
];
