import bcrypt from 'bcryptjs';

export const createUsers = async (roleMap, stationMap, divisionMap, warehouseMap) => {
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash("password123", salt);

  return [
    {
      full_name: "Super Admin",
      email: "admin@slrail.lk",
      password_hash,
      roles: [roleMap["Super Admin"]]
    },
    {
      full_name: "Colombo Division Manager",
      email: "colombo.mgr@slrail.lk",
      password_hash,
      roles: [roleMap["Division Manager"]],
      divisionId: divisionMap["Colombo"]
    },
    {
      full_name: "Fort Station Master",
      email: "fort.sm@slrail.lk",
      password_hash,
      roles: [roleMap["Station Master"]],
      divisionId: divisionMap["Colombo"],
      stationId: stationMap["Colombo Fort"]
    },
    {
      full_name: "Jaffna Warehouse Manager",
      email: "jaffna.wm@slrail.lk",
      password_hash,
      roles: [roleMap["Warehouse Manager"]],
      divisionId: divisionMap["Jaffna"],
      stationId: stationMap["Jaffna"],
      warehouseIds: [warehouseMap["Jaffna General Store"]]
    },
    {
      full_name: "Staff Member",
      email: "staff@slrail.lk",
      password_hash,
      roles: [roleMap["Staff"]],
      divisionId: divisionMap["Colombo"],
      stationId: stationMap["Colombo Fort"],
      warehouseIds: [warehouseMap["Fort Mechanical Store"]]
    }
  ];
};