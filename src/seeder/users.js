import Role from '../models/role.js'
import bcrypt from 'bcryptjs';

export const getUsers = async () => {
  // Get roles
  const superAdminRole = await Role.findOne({ name: "Super Admin" });
  const jaffnaManagerRole = await Role.findOne({ name: "Jaffna Branch Manager" });
  const maradanaManagerRole = await Role.findOne({ name: "Maradana Store Manager" });
  const jaffnaStaffRole = await Role.findOne({ name: "Jaffna Warehouse Staff" });

  // Hash a default password
  const password = await bcrypt.hash('password123', 10);

  return [
    {
      name: "Main Admin",
      email: "admin@slrail.lk",
      password: password,
      roles: [superAdminRole._id],
    },
    {
      name: "Jaffna Manager",
      email: "jaffna.mgr@slrail.lk",
      password: password,
      roles: [jaffnaManagerRole._id],
    },
    {
      name: "Maradana Manager",
      email: "maradana.mgr@slrail.lk",
      password: password,
      roles: [maradanaManagerRole._id],
    },
    {
      name: "Jaffna Staff",
      email: "jaffna.staff@slrail.lk",
      password: password,
      roles: [jaffnaStaffRole._id],
    }
  ];
};