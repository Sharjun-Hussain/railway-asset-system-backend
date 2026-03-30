export const createWarehouses = (stationMap) => [
  {
    warehouse_name: "Fort Mechanical Store",
    warehouse_type: "Mechanical",
    stationId: stationMap["Colombo Fort"]
  },
  {
    warehouse_name: "Maradana Signal Store",
    warehouse_type: "Signal",
    stationId: stationMap["Maradana"]
  },
  {
    warehouse_name: "Jaffna General Store",
    warehouse_type: "General",
    stationId: stationMap["Jaffna"]
  }
];