import bcrypt from 'bcryptjs';

export const createUsers = async (stationMap, divisionMap) => {
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash("password123", salt);

  return [
    {
      full_name: "Super Admin",
      email: "admin@slrail.lk",
      password_hash,
      role: "Super Admin"
    },
    {
      full_name: "Colombo Division Manager",
      email: "colombo.mgr@slrail.lk",
      password_hash,
      role: "Division Manager",
      divisionId: divisionMap["Colombo"]
    },
    {
      full_name: "Fort Station Master",
      email: "fort.sm@slrail.lk",
      password_hash,
      role: "Station Master",
      stationId: stationMap["Colombo Fort"],
      divisionId: divisionMap["Colombo"]
    },
    {
      full_name: "Jaffna Warehouse Manager",
      email: "jaffna.wm@slrail.lk",
      password_hash,
      role: "Warehouse Manager",
      stationId: stationMap["Jaffna"],
      divisionId: divisionMap["Jaffna"]
    },
    {
      full_name: "Staff Member",
      email: "staff@slrail.lk",
      password_hash,
      role: "Staff",
      stationId: stationMap["Colombo Fort"],
      divisionId: divisionMap["Colombo"]
    }
  ];
};