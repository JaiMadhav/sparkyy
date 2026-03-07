export const bookingService = {
  createBooking: async (data: any) => {
    return { id: Math.floor(Math.random() * 1000), status: "pending", ...data };
  },
  getBookings: async () => {
    return [
      { id: 1, date: "2023-10-25", location: "123 Main St", energy: "15 kWh", price: "$12.50", status: "completed" },
      { id: 2, date: "2023-10-28", location: "456 Oak Ave", energy: "22 kWh", price: "$18.00", status: "completed" },
    ];
  },
  getActiveBooking: async () => {
    return null; // or object if active
  }
};
