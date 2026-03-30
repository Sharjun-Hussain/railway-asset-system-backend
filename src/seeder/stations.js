export const createStations = (divisionMap) => [
    {
        station_name: "Colombo Fort",
        station_code: "FOT",
        address: "Colombo 01",
        divisionId: divisionMap["Colombo"]
    },
    {
        station_name: "Maradana",
        station_code: "MDA",
        address: "Maradana, Colombo 10",
        divisionId: divisionMap["Colombo"]
    },
    {
        station_name: "Kandy",
        station_code: "KDY",
        address: "Kandy",
        divisionId: divisionMap["Kandy"]
    },
    {
        station_name: "Jaffna",
        station_code: "JAF",
        address: "Jaffna",
        divisionId: divisionMap["Jaffna"]
    }
];
