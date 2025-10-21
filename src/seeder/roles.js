import Department from '../models/departments.js'
import Warehouse from '../models/warehouse.js'
import Permission from '../models/permission.js'


export const getRoles = async () => {
  // Get all permissions
  const perms = await Permission.find({});
  const permMap = perms.reduce((acc, perm) => {
    acc[perm.name] = perm._id;
    return acc;
  }, {});

  // Get departments
  const maradana = await Department.findOne({ name: "Colombo-Maradana" });
  const jaffna = await Department.findOne({ name: "Jaffna" });
  
  // Get warehouses
  const maradanaStore = await Warehouse.findOne({ name: "Maradana Central Store" });
  const jaffnaStore = await Warehouse.findOne({ name: "Jaffna Main Warehouse" });

  return [
    // 1. Super Admin Role (global)
    {
      name: "Super Admin",
      permissions: Object.values(permMap), // All permissions
      branchId: maradana._id, // Linked to main branch
    },
    // 2. Branch Manager Role (specific to a branch)
    {
      name: "Jaffna Branch Manager",
      permissions: [permMap.view_reports, permMap.manage_warehouses, permMap.manage_users],
      branchId: jaffna._id,
    },
    // 3. Warehouse Manager Role (specific to a warehouse)
    {
      name: "Maradana Store Manager",
      permissions: [permMap.manage_assets, permMap.adjust_inventory, permMap.view_reports],
      warehouseId: maradanaStore._id,
    },
    // 4. Staff Role (specific to a warehouse)
    {
      name: "Jaffna Warehouse Staff",
      permissions: [permMap.adjust_inventory],
      warehouseId: jaffnaStore._id,
    }
  ];
};