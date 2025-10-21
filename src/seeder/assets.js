import Warehouse from '../models/warehouse.js'
export const getAssets = async () => {
  const maradanaStore = await Warehouse.findOne({ name: "Maradana Central Store" });
  const maradanaSignal = await Warehouse.findOne({ name: "Maradana Signal Parts" });
  const jaffnaStore = await Warehouse.findOne({ name: "Jaffna Main Warehouse" });

  return [
    {
      name: "S13 Diesel Locomotive",
      type: "Locomotive",
      branchId: maradanaStore.branchId,
      warehouseId: maradanaStore._id,
      quantity: 2,
      status: "active",
      condition: "good",
    },
    {
      name: "Red Signal Lamp (LED)",
      type: "Signal Part",
      branchId: maradanaSignal.branchId,
      warehouseId: maradanaSignal._id,
      quantity: 500,
      status: "active",
      condition: "good",
    },
    {
      name: "Track Ballast (Cubic Meter)",
      type: "Track Material",
      branchId: jaffnaStore.branchId,
      warehouseId: jaffnaStore._id,
      quantity: 150,
      status: "active",
      condition: "good",
    },
    {
      name: "M8 Passenger Carriage",
      type: "Carriage",
      branchId: maradanaStore.branchId,
      warehouseId: maradanaStore._id,
      quantity: 1,
      status: "maintenance",
      condition: "average",
      lastMaintenance: new Date()
    }
  ];
};