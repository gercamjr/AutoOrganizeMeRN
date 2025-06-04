// This file contains mock data for development and testing purposes.
// Replace with actual database calls in production.

export const mockCustomers = [
  {
    id: "1",
    name: "John Doe",
    phone: "555-1234",
    email: "john.doe@email.com",
    address: "123 Main St",
  },
  {
    id: "2",
    name: "Jane Smith",
    phone: "555-5678",
    email: "jane.smith@email.com",
    address: "456 Oak Ave",
  },
  {
    id: "3",
    name: "Bob Johnson",
    phone: "555-8765",
    email: "bob.j@email.com",
    address: "789 Pine Ln",
  },
  {
    id: "4",
    name: "Alice Brown",
    phone: "555-4321",
    email: "alice.b@email.com",
    address: "101 Maple Dr",
  },
];

export const mockVehicles = [
  {
    id: "v1",
    customerId: "1",
    make: "Toyota",
    model: "Camry",
    year: "2020",
    vin: "123ABC456DEF789G",
    engineType: "2.5L 4-Cylinder",
  },
  {
    id: "v2",
    customerId: "1",
    make: "Honda",
    model: "Civic",
    year: "2018",
    vin: "XYZ123ABC456DEF78",
    engineType: "1.5L Turbo 4-Cylinder",
  },
  {
    id: "v3",
    customerId: "2",
    make: "Ford",
    model: "F-150",
    year: "2022",
    vin: "789GHI123JKL456M",
    engineType: "5.0L V8",
  },
  {
    id: "v4",
    customerId: "3",
    make: "Chevrolet",
    model: "Silverado",
    year: "2019",
    vin: "MNO456PQR789STU1",
    engineType: "6.2L V8",
  },
  {
    id: "v5",
    customerId: "4",
    make: "Nissan",
    model: "Altima",
    year: "2021",
    vin: "VWX789YZA123BCD4",
    engineType: "2.0L VC-Turbo",
  },
];

export const mockInvoices = [
  {
    id: "inv1",
    taskId: "t4", // Linked to completed Tire Rotation
    customerId: "4",
    vehicleId: "v5",
    invoiceNumber: "INV-2025-001",
    date: "2025-06-10",
    items: [
      {
        description: "Tire Rotation Labor",
        quantity: 1,
        unitPrice: 50,
        total: 50,
      },
    ],
    subtotal: 50,
    taxRate: 0.08, // 8%
    taxAmount: 4,
    totalAmount: 54,
    paymentStatus: "Paid",
    notes: "Payment received via credit card.",
  },
  {
    id: "inv2",
    taskId: "t1", // Assuming Oil Change will be completed
    customerId: "1",
    vehicleId: "v1",
    invoiceNumber: "INV-2025-002",
    date: "2025-06-11",
    items: [
      {
        description: "5W-30 Synthetic Oil",
        quantity: 5,
        unitPrice: 8,
        total: 40,
      },
      { description: "Oil Filter", quantity: 1, unitPrice: 15, total: 15 },
      {
        description: "Oil Change Labor",
        quantity: 1,
        unitPrice: 30,
        total: 30,
      },
    ],
    subtotal: 85,
    taxRate: 0.08,
    taxAmount: 6.8,
    totalAmount: 91.8,
    paymentStatus: "Unpaid",
    notes: "Customer will pay upon pickup.",
  },
];

// Helper to get vehicle details for display, as tasks might only store IDs
export const getTaskDetails = (task) => {
  const customer = mockCustomers.find((c) => c.id === task.customerId);
  const vehicle = mockVehicles.find((v) => v.id === task.vehicleId);
  return {
    ...task,
    customerName: customer ? customer.name : "N/A",
    vehicleMake: vehicle ? vehicle.make : "N/A",
    vehicleModel: vehicle ? vehicle.model : "N/A",
    vehicleYear: vehicle ? vehicle.year : "N/A",
  };
};

export const getDetailedTasks = () => mockTasks.map(getTaskDetails);
