export const vehicleService = {
  getVehicles: async () => {
    return [
      { id: 1, make: "Tesla", model: "Model 3", year: 2022, licensePlate: "ABC-1234", type: "4-wheeler" },
      { id: 2, make: "Ola", model: "S1 Pro", year: 2023, licensePlate: "XYZ-5678", type: "2-wheeler" },
    ];
  },
  addVehicle: async (data: any) => {
    return { id: Math.floor(Math.random() * 1000), ...data };
  },
  deleteVehicle: async (id: number) => {
    return true;
  }
};
