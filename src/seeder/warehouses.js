import Department from '../models/departments.js'

// This file is a function because it needs database data
export const getWarehouses = async () => {
  // Get the departments
  const maradana = await Department.findOne({ name: "Colombo-Maradana" });
  const jaffna = await Department.findOne({ name: "Jaffna" });
  const batticaloa = await Department.findOne({ name: "Batticaloa" });

  return [
    { 
      name: "Maradana Central Store", 
      branchId: maradana._id,
      location: "Warehouse A, Maradana Yard"
    },
    { 
      name: "Maradana Signal Parts", 
      branchId: maradana._id,
      location: "Warehouse B, Signal Division"
    },
    { 
      name: "Jaffna Main Warehouse", 
      branchId: jaffna._id,
      location: "Jaffna Station Yard"
    },
    { 
      name: "Batticaloa Rolling Stock", 
      branchId: batticaloa._id,
      location: "Batticaloa Yard"
    }
  ];
};