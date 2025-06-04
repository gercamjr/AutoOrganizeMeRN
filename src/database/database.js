import "react-native-get-random-values"; // Required for uuid
import * as SQLite from "expo-sqlite";
import { v4 as uuidv4 } from "uuid"; // Import uuid

// Initialize the database connection promise using the new async API
const dbInstancePromise = SQLite.openDatabaseAsync("autoorganizeme.db");

// Helper to get the database instance
async function getDb() {
  try {
    const db = await dbInstancePromise;
    if (!db) {
      throw new Error("Database instance is null");
    }
    return db;
  } catch (error) {
    console.error("Failed to get database instance:", error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export const initDatabase = async () => {
  const db = await getDb();
  console.log("Initializing database with new async API...");
  try {
    await db.withTransactionAsync(async () => {
      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT);"
      );
      console.log("Customers table checked/created.");

      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS vehicles (id TEXT PRIMARY KEY NOT NULL, customerId TEXT NOT NULL, make TEXT, model TEXT, year INTEGER, vin TEXT UNIQUE, engineType TEXT, FOREIGN KEY (customerId) REFERENCES customers(id));"
      );
      console.log("Vehicles table checked/created.");

      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY NOT NULL, vehicleId TEXT, customerId TEXT, title TEXT NOT NULL, description TEXT, category TEXT, status TEXT NOT NULL, createdDate TEXT, dueDate TEXT, FOREIGN KEY (vehicleId) REFERENCES vehicles(id), FOREIGN KEY (customerId) REFERENCES customers(id));"
      );
      console.log("Tasks table checked/created.");

      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY NOT NULL, customerId TEXT NOT NULL, taskId TEXT, invoiceNumber TEXT, issueDate TEXT, dueDate TEXT, totalAmount REAL, paymentStatus TEXT, notes TEXT, FOREIGN KEY (customerId) REFERENCES customers(id), FOREIGN KEY (taskId) REFERENCES tasks(id));"
      );
      console.log("Invoices table checked/created.");

      // Migration for existing invoices table - add missing columns if they don't exist
      try {
        await db.execAsync(
          "ALTER TABLE invoices ADD COLUMN invoiceNumber TEXT;"
        );
        console.log("Added invoiceNumber column to invoices table.");
      } catch (error) {
        // Column likely already exists, ignore
        console.log("invoiceNumber column already exists or table is new.");
      }

      try {
        await db.execAsync("ALTER TABLE invoices ADD COLUMN notes TEXT;");
        console.log("Added notes column to invoices table.");
      } catch (error) {
        // Column likely already exists, ignore
        console.log("notes column already exists or table is new.");
      }

      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS invoice_items (id TEXT PRIMARY KEY NOT NULL, invoiceId TEXT NOT NULL, description TEXT, quantity REAL, unitPrice REAL, totalPrice REAL, FOREIGN KEY (invoiceId) REFERENCES invoices(id));"
      );
      console.log("Invoice items table checked/created.");

      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS schedule (id TEXT PRIMARY KEY NOT NULL, taskId TEXT, jobDate TEXT, startTime TEXT, endTime TEXT, notes TEXT, FOREIGN KEY (taskId) REFERENCES tasks(id));"
      );
      console.log("Schedule table checked/created.");

      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY NOT NULL, parentId TEXT NOT NULL, parentType TEXT NOT NULL, uri TEXT NOT NULL, notes TEXT);"
      );
      console.log("Photos table checked/created.");
    });
    console.log("Database initialized successfully using new API.");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error; // Re-throw to be caught by App.js or other callers
  }
};

// Customer CRUD Operations
export const addCustomer = async (customer) => {
  const db = await getDb();
  console.log(
    "[database.js] addCustomer: Attempting to add customer:",
    JSON.stringify(customer)
  );
  try {
    const result = await db.runAsync(
      "INSERT INTO customers (id, name, phone, email, address) VALUES (?, ?, ?, ?, ?);",
      [
        customer.id,
        customer.name,
        customer.phone,
        customer.email,
        customer.address,
      ]
    );
    console.log(
      "[database.js] addCustomer: DB runAsync result:",
      JSON.stringify(result)
    );
    if (result.changes > 0) {
      console.log(
        "[database.js] addCustomer: Customer added successfully, changes:",
        result.changes
      );
      return true; // Explicit success
    } else {
      console.warn(
        "[database.js] addCustomer: No changes made by INSERT operation. Result:",
        JSON.stringify(result)
      );
      throw new Error("Customer insert operation resulted in no changes.");
    }
  } catch (error) {
    console.error(
      "[database.js] Error adding customer: %s, Stack: %s",
      error.message,
      error.stack
    );
    throw error; // Re-throw
  }
};

export const getCustomers = async () => {
  const db = await getDb();
  try {
    return await db.getAllAsync("SELECT * FROM customers ORDER BY name ASC;");
  } catch (error) {
    console.error("Error getting customers:", error);
    throw error;
  }
};

export const getCustomerById = async (id) => {
  const db = await getDb();
  try {
    return await db.getFirstAsync("SELECT * FROM customers WHERE id = ?;", [
      id,
    ]);
  } catch (error) {
    console.error(`Error getting customer by id ${id}:`, error);
    throw error;
  }
};

export const updateCustomer = async (id, customer) => {
  const db = await getDb();
  console.log(
    `[database.js] updateCustomer: Attempting to update customer ${id}:`,
    JSON.stringify(customer)
  );
  try {
    const result = await db.runAsync(
      "UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?;",
      [customer.name, customer.phone, customer.email, customer.address, id]
    );
    console.log(
      `[database.js] updateCustomer: DB runAsync result for customer ${id}:`,
      JSON.stringify(result)
    );
    // result.changes indicates the number of rows affected.
    // For an update, this could be 0 if the new data is the same as the old data,
    // or if the ID doesn't exist. We'll return the number of changes.
    // The calling function can decide if 0 changes is an "issue" or not.
    return result.changes;
  } catch (error) {
    console.error(
      `[database.js] Error updating customer id ${id}: %s, Stack: %s`,
      error.message,
      error.stack
    );
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  const db = await getDb();
  try {
    let totalChanges = 0;
    await db.withTransactionAsync(async () => {
      // Note: Order of deletion can be important.
      // Consider if foreign keys have ON DELETE CASCADE. If not, manual order is critical.
      await db.runAsync(
        "DELETE FROM photos WHERE parentId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?)) AND parentType = 'task';",
        [id, id]
      );
      await db.runAsync(
        "DELETE FROM photos WHERE parentId IN (SELECT id FROM vehicles WHERE customerId = ?) AND parentType = 'vehicle';",
        [id]
      );
      await db.runAsync(
        "DELETE FROM photos WHERE parentId = ? AND parentType = 'customer';",
        [id]
      );
      await db.runAsync(
        "DELETE FROM schedule WHERE taskId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?));",
        [id, id]
      );
      await db.runAsync(
        "DELETE FROM invoice_items WHERE invoiceId IN (SELECT id FROM invoices WHERE customerId = ? OR taskId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?)));",
        [id, id, id]
      );
      await db.runAsync(
        "DELETE FROM invoices WHERE customerId = ? OR taskId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?));",
        [id, id, id]
      );
      await db.runAsync(
        "DELETE FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?);",
        [id, id]
      );
      await db.runAsync("DELETE FROM vehicles WHERE customerId = ?;", [id]);
      const customerDeleteResult = await db.runAsync(
        "DELETE FROM customers WHERE id = ?;",
        [id]
      );
      totalChanges = customerDeleteResult.changes;
    });
    return totalChanges; // Return number of customers deleted
  } catch (error) {
    console.error(`Error deleting customer id ${id}:`, error);
    throw error;
  }
};

// Vehicle CRUD Operations
export const addVehicle = async (vehicle) => {
  const db = await getDb();
  try {
    const result = await db.runAsync(
      "INSERT INTO vehicles (id, customerId, make, model, year, vin, engineType) VALUES (?, ?, ?, ?, ?, ?, ?);",
      [
        vehicle.id,
        vehicle.customerId,
        vehicle.make,
        vehicle.model,
        vehicle.year,
        vehicle.vin,
        vehicle.engineType,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding vehicle:", error);
    throw error;
  }
};

export const getVehiclesForCustomer = async (customerId) => {
  if (!customerId) {
    console.error("getVehiclesForCustomer: customerId is null or undefined");
    throw new Error("Customer ID is required");
  }

  const db = await getDb();
  if (!db) {
    console.error("getVehiclesForCustomer: Database connection is null");
    throw new Error("Database connection failed");
  }

  try {
    console.log(
      `getVehiclesForCustomer: Loading vehicles for customer ${customerId}`
    );
    const result = await db.getAllAsync(
      "SELECT * FROM vehicles WHERE customerId = ? ORDER BY make ASC, model ASC;",
      [customerId]
    );
    console.log(
      `getVehiclesForCustomer: Found ${result.length} vehicles for customer ${customerId}`
    );
    return result;
  } catch (error) {
    console.error(
      `Error getting vehicles for customer id ${customerId}:`,
      error
    );
    throw error;
  }
};

export const getVehicleById = async (id) => {
  const db = await getDb();
  try {
    return await db.getFirstAsync("SELECT * FROM vehicles WHERE id = ?;", [id]);
  } catch (error) {
    console.error(`Error getting vehicle by id ${id}:`, error);
    throw error;
  }
};

export const updateVehicle = async (id, vehicle) => {
  const db = await getDb();
  try {
    const result = await db.runAsync(
      "UPDATE vehicles SET customerId = ?, make = ?, model = ?, year = ?, vin = ?, engineType = ? WHERE id = ?;",
      [
        vehicle.customerId,
        vehicle.make,
        vehicle.model,
        vehicle.year,
        vehicle.vin,
        vehicle.engineType,
        id,
      ]
    );
    return result.changes;
  } catch (error) {
    console.error(`Error updating vehicle id ${id}:`, error);
    throw error;
  }
};

export const deleteVehicle = async (id) => {
  const db = await getDb();
  try {
    let totalChanges = 0;
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        "DELETE FROM photos WHERE parentId IN (SELECT id FROM tasks WHERE vehicleId = ?) AND parentType = 'task';",
        [id]
      );
      await db.runAsync(
        "DELETE FROM photos WHERE parentId = ? AND parentType = 'vehicle';",
        [id]
      );
      await db.runAsync(
        "DELETE FROM schedule WHERE taskId IN (SELECT id FROM tasks WHERE vehicleId = ?);",
        [id]
      );
      await db.runAsync(
        "DELETE FROM invoice_items WHERE invoiceId IN (SELECT id FROM invoices WHERE taskId IN (SELECT id FROM tasks WHERE vehicleId = ?));",
        [id]
      );
      await db.runAsync(
        "DELETE FROM invoices WHERE taskId IN (SELECT id FROM tasks WHERE vehicleId = ?);",
        [id]
      );
      await db.runAsync("DELETE FROM tasks WHERE vehicleId = ?;", [id]);
      const vehicleDeleteResult = await db.runAsync(
        "DELETE FROM vehicles WHERE id = ?;",
        [id]
      );
      totalChanges = vehicleDeleteResult.changes;
    });
    return totalChanges; // Return number of vehicles deleted
  } catch (error) {
    console.error(`Error deleting vehicle id ${id}:`, error);
    throw error;
  }
};

// New function to get all vehicles with customer names and apply filters
export const getAllVehiclesWithCustomerNames = async (filters = {}) => {
  const db = await getDb();
  try {
    let query = `
      SELECT 
        v.id, v.customerId, v.make, v.model, v.year, v.vin, v.engineType, 
        c.name AS customerName 
      FROM vehicles v
      JOIN customers c ON v.customerId = c.id
    `;
    const queryParams = [];
    const whereClauses = [];

    if (filters.customerId) {
      whereClauses.push("v.customerId = ?");
      queryParams.push(filters.customerId);
    }
    if (filters.make) {
      whereClauses.push("LOWER(v.make) LIKE LOWER(?)");
      queryParams.push(`%${filters.make}%`);
    }
    if (filters.model) {
      whereClauses.push("LOWER(v.model) LIKE LOWER(?)");
      queryParams.push(`%${filters.model}%`);
    }
    // Add more filters here as needed (e.g., year, VIN)

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += " ORDER BY c.name ASC, v.make ASC, v.model ASC;";

    console.log(
      "[database.js] getAllVehiclesWithCustomerNames query:",
      query,
      queryParams
    );
    return await db.getAllAsync(query, queryParams);
  } catch (error) {
    console.error("Error getting all vehicles with customer names:", error);
    throw error;
  }
};

// Note: The old 'export default db;' is removed as it's no longer applicable.
// Modules should import the specific async functions they need.

// Task CRUD Operations

// Function to add a new task
export const addTask = async (task) => {
  const db = await getDb();
  const newId = task.id || uuidv4(); // Use uuidv4() to generate a new one
  const currentDate = new Date().toISOString();
  try {
    const result = await db.runAsync(
      "INSERT INTO tasks (id, vehicleId, customerId, title, description, category, status, createdDate, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
      [
        newId,
        task.vehicleId,
        task.customerId,
        task.title,
        task.description,
        task.category,
        task.status,
        currentDate,
        task.dueDate,
      ]
    );
    if (result.changes > 0) {
      console.log(
        "[database.js] addTask: Task added successfully with id:",
        newId
      );
      return newId; // Return the id of the newly added task
    } else {
      console.warn(
        "[database.js] addTask: No changes made by INSERT operation."
      );
      throw new Error("Task insert operation resulted in no changes.");
    }
  } catch (error) {
    console.error("[database.js] Error adding task:", error);
    throw error;
  }
};

// Function to get tasks with customer and vehicle details, with optional filters
export const getTasks = async (filters = {}) => {
  const db = await getDb();
  try {
    let query = `
      SELECT 
        t.id, t.title, t.description, t.category, t.status, t.createdDate, t.dueDate,
        t.customerId, c.name AS customerName,
        t.vehicleId, v.make AS vehicleMake, v.model AS vehicleModel, v.year AS vehicleYear
      FROM tasks t
      LEFT JOIN customers c ON t.customerId = c.id
      LEFT JOIN vehicles v ON t.vehicleId = v.id
    `;
    const queryParams = [];
    const whereClauses = [];

    if (filters.customerId) {
      whereClauses.push("t.customerId = ?");
      queryParams.push(filters.customerId);
    }
    if (filters.vehicleId) {
      whereClauses.push("t.vehicleId = ?");
      queryParams.push(filters.vehicleId);
    }
    if (filters.status) {
      whereClauses.push("t.status = ?");
      queryParams.push(filters.status);
    }
    if (filters.category) {
      whereClauses.push("t.category = ?");
      queryParams.push(filters.category);
    }
    // Add more filters as needed

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += " ORDER BY t.createdDate DESC;"; // Default sort by most recent

    console.log("[database.js] getTasks query:", query, queryParams);
    return await db.getAllAsync(query, queryParams);
  } catch (error) {
    console.error("[database.js] Error getting tasks:", error);
    throw error;
  }
};

// Function to get a single task by its ID with customer and vehicle details
export const getTaskById = async (id) => {
  const db = await getDb();
  try {
    const query = `
      SELECT 
        t.id, t.title, t.description, t.category, t.status, t.createdDate, t.dueDate,
        t.customerId, c.name AS customerName,
        t.vehicleId, v.make AS vehicleMake, v.model AS vehicleModel, v.year AS vehicleYear, v.vin AS vehicleVin, v.engineType AS vehicleEngineType
      FROM tasks t
      LEFT JOIN customers c ON t.customerId = c.id
      LEFT JOIN vehicles v ON t.vehicleId = v.id
      WHERE t.id = ?;
    `;
    console.log("[database.js] getTaskById query for id:", id);
    return await db.getFirstAsync(query, [id]);
  } catch (error) {
    console.error(`[database.js] Error getting task by id ${id}:`, error);
    throw error;
  }
};

// Function to update an existing task
export const updateTask = async (id, task) => {
  const db = await getDb();
  console.log(
    `[database.js] updateTask: Attempting to update task ${id}:`,
    JSON.stringify(task)
  );
  try {
    // Note: createdDate is generally not updated.
    const result = await db.runAsync(
      "UPDATE tasks SET vehicleId = ?, customerId = ?, title = ?, description = ?, category = ?, status = ?, dueDate = ? WHERE id = ?;",
      [
        task.vehicleId,
        task.customerId,
        task.title,
        task.description,
        task.category,
        task.status,
        task.dueDate,
        id,
      ]
    );
    console.log(
      `[database.js] updateTask: DB runAsync result for task ${id}:`,
      JSON.stringify(result)
    );
    return result.changes;
  } catch (error) {
    console.error(`[database.js] Error updating task id ${id}:`, error);
    throw error;
  }
};

// Function to delete a task and related items (e.g., schedule, photos, invoice items if not paid)
export const deleteTask = async (id) => {
  const db = await getDb();
  try {
    let totalChanges = 0;
    await db.withTransactionAsync(async () => {
      // Delete photos associated with this task
      await db.runAsync(
        "DELETE FROM photos WHERE parentId = ? AND parentType = 'task';",
        [id]
      );
      console.log(`[database.js] deleteTask: Deleted photos for task ${id}`);

      // Delete schedule items associated with this task
      await db.runAsync("DELETE FROM schedule WHERE taskId = ?;", [id]);
      console.log(
        `[database.js] deleteTask: Deleted schedule items for task ${id}`
      );

      // Delete invoice items linked to invoices for this task (if any)
      // This assumes invoices are not deleted if partially/fully paid, but items might be if task is voided.
      // For simplicity, we'll delete invoice items. A more complex logic would check invoice status.
      await db.runAsync(
        "DELETE FROM invoice_items WHERE invoiceId IN (SELECT id FROM invoices WHERE taskId = ?);",
        [id]
      );
      console.log(
        `[database.js] deleteTask: Deleted invoice items for task ${id}`
      );

      // Optionally, delete invoices themselves if they are solely for this task and unpaid.
      // For now, we leave invoices and let user manage them separately or enhance this later.
      // await db.runAsync("DELETE FROM invoices WHERE taskId = ? AND paymentStatus = 'Unpaid';", [id]);

      // Finally, delete the task itself
      const taskDeleteResult = await db.runAsync(
        "DELETE FROM tasks WHERE id = ?;",
        [id]
      );
      console.log(
        `[database.js] deleteTask: Deleted task ${id}, changes: ${taskDeleteResult.changes}`
      );
      totalChanges = taskDeleteResult.changes;
    });
    return totalChanges; // Return number of tasks deleted
  } catch (error) {
    console.error(`[database.js] Error deleting task id ${id}:`, error);
    throw error;
  }
};

// Invoice CRUD Operations
export const addInvoice = async (invoice) => {
  const db = await getDb();
  const newInvoiceId = invoice.id || uuidv4();
  try {
    await db.withTransactionAsync(async () => {
      const result = await db.runAsync(
        "INSERT INTO invoices (id, customerId, taskId, invoiceNumber, issueDate, dueDate, totalAmount, paymentStatus, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
        [
          newInvoiceId,
          invoice.customerId,
          invoice.taskId, // Optional: link to a specific task
          invoice.invoiceNumber,
          invoice.issueDate,
          invoice.dueDate,
          invoice.totalAmount,
          invoice.paymentStatus,
          invoice.notes,
        ]
      );
      console.log(
        `[database.js] addInvoice: Invoice header added with ID ${newInvoiceId}, changes: ${result.changes}`
      );
      if (result.changes === 0)
        throw new Error("Failed to insert invoice header.");

      for (const item of invoice.lineItems) {
        const newItemId = item.id || uuidv4();
        await db.runAsync(
          "INSERT INTO invoice_items (id, invoiceId, description, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?, ?);",
          [
            newItemId,
            newInvoiceId,
            item.description,
            item.quantity,
            item.unitPrice,
            item.quantity * item.unitPrice,
          ]
        );
      }
      console.log(
        `[database.js] addInvoice: Added ${invoice.lineItems.length} line items for invoice ${newInvoiceId}`
      );
    });
    return newInvoiceId;
  } catch (error) {
    console.error("[database.js] Error adding invoice:", error);
    throw error;
  }
};

export const getInvoices = async (filters = {}) => {
  const db = await getDb();
  try {
    let query = `
      SELECT 
        i.id, i.invoiceNumber, i.issueDate, i.dueDate, i.totalAmount, i.paymentStatus, i.notes,
        i.customerId, c.name AS customerName,
        i.taskId, t.title AS taskTitle
      FROM invoices i
      JOIN customers c ON i.customerId = c.id
      LEFT JOIN tasks t ON i.taskId = t.id
    `;
    const queryParams = [];
    const whereClauses = [];

    if (filters.customerId) {
      whereClauses.push("i.customerId = ?");
      queryParams.push(filters.customerId);
    }
    if (filters.paymentStatus) {
      whereClauses.push("i.paymentStatus = ?");
      queryParams.push(filters.paymentStatus);
    }
    // Add more filters as needed (e.g., date range)

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += " ORDER BY i.issueDate DESC, i.invoiceNumber DESC;";

    console.log("[database.js] getInvoices query:", query, queryParams);
    const invoices = await db.getAllAsync(query, queryParams);

    // For each invoice, fetch its line items
    for (const invoice of invoices) {
      invoice.lineItems = await db.getAllAsync(
        "SELECT * FROM invoice_items WHERE invoiceId = ? ORDER BY id;",
        [invoice.id]
      );
    }
    return invoices;
  } catch (error) {
    console.error("[database.js] Error getting invoices:", error);
    throw error;
  }
};

export const getInvoiceById = async (id) => {
  const db = await getDb();
  try {
    const query = `
      SELECT 
        i.id, i.invoiceNumber, i.issueDate, i.dueDate, i.totalAmount, i.paymentStatus, i.notes,
        i.customerId, c.name AS customerName,
        i.taskId, t.title AS taskTitle
      FROM invoices i
      JOIN customers c ON i.customerId = c.id
      LEFT JOIN tasks t ON i.taskId = t.id
      WHERE i.id = ?;
    `;
    const invoice = await db.getFirstAsync(query, [id]);
    if (invoice) {
      invoice.lineItems = await db.getAllAsync(
        "SELECT * FROM invoice_items WHERE invoiceId = ? ORDER BY id;",
        [id]
      );
    }
    return invoice;
  } catch (error) {
    console.error(`Error getting invoice by id ${id}:`, error);
    throw error;
  }
};

export const updateInvoice = async (id, invoice) => {
  const db = await getDb();
  try {
    let changes = 0;
    await db.withTransactionAsync(async () => {
      const result = await db.runAsync(
        "UPDATE invoices SET customerId = ?, taskId = ?, invoiceNumber = ?, issueDate = ?, dueDate = ?, totalAmount = ?, paymentStatus = ?, notes = ? WHERE id = ?;",
        [
          invoice.customerId,
          invoice.taskId,
          invoice.invoiceNumber,
          invoice.issueDate,
          invoice.dueDate,
          invoice.totalAmount,
          invoice.paymentStatus,
          invoice.notes,
          id,
        ]
      );
      changes = result.changes;
      console.log(
        `[database.js] updateInvoice: Invoice header ${id} updated, changes: ${changes}`
      );

      // Simple approach: Delete existing items and re-add.
      // More complex: diff and update/insert/delete selectively.
      await db.runAsync("DELETE FROM invoice_items WHERE invoiceId = ?;", [id]);
      console.log(
        `[database.js] updateInvoice: Deleted existing line items for invoice ${id}`
      );

      for (const item of invoice.lineItems) {
        const newItemId = item.id || uuidv4(); // Allow existing items to keep their ID if provided, or generate new
        await db.runAsync(
          "INSERT INTO invoice_items (id, invoiceId, description, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?, ?);",
          [
            newItemId,
            id, // Use existing invoice ID
            item.description,
            item.quantity,
            item.unitPrice,
            item.quantity * item.unitPrice,
          ]
        );
      }
      console.log(
        `[database.js] updateInvoice: Re-added ${invoice.lineItems.length} line items for invoice ${id}`
      );
    });
    return changes; // Return changes from invoice header update
  } catch (error) {
    console.error(`Error updating invoice id ${id}:`, error);
    throw error;
  }
};

export const deleteInvoice = async (id) => {
  const db = await getDb();
  try {
    let totalChanges = 0;
    await db.withTransactionAsync(async () => {
      // Delete invoice items first
      await db.runAsync("DELETE FROM invoice_items WHERE invoiceId = ?;", [id]);
      console.log(
        `[database.js] deleteInvoice: Deleted line items for invoice ${id}`
      );

      // Then delete the invoice itself
      const result = await db.runAsync("DELETE FROM invoices WHERE id = ?;", [
        id,
      ]);
      totalChanges = result.changes;
      console.log(
        `[database.js] deleteInvoice: Deleted invoice ${id}, changes: ${totalChanges}`
      );
    });
    return totalChanges;
  } catch (error) {
    console.error(`Error deleting invoice id ${id}:`, error);
    throw error;
  }
};

// Update the initDatabase to reflect new fields in invoices table
// The existing initDatabase function already creates the invoices and invoice_items tables.
// We need to ensure the invoices table schema matches the fields used in addInvoice/updateInvoice.
// The current schema is:
// "CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY NOT NULL, customerId TEXT NOT NULL, taskId TEXT, issueDate TEXT, dueDate TEXT, totalAmount REAL, laborCosts REAL, paymentStatus TEXT, FOREIGN KEY (customerId) REFERENCES customers(id), FOREIGN KEY (taskId) REFERENCES tasks(id));"
// New fields used: invoiceNumber, notes. Field to remove: laborCosts (as it's part of line items).

// Let's adjust the schema. Since altering tables in SQLite has limitations,
// for development, it's often easier to drop and recreate or ensure new fields are nullable / have defaults.
// For this iteration, we'll assume new fields are added and `laborCosts` might be unused or repurposed.
// A proper migration strategy would be needed for production apps.

// The schema in initDatabase for invoices should be:
// "CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY NOT NULL, customerId TEXT NOT NULL, taskId TEXT, invoiceNumber TEXT, issueDate TEXT, dueDate TEXT, totalAmount REAL, paymentStatus TEXT, notes TEXT, FOREIGN KEY (customerId) REFERENCES customers(id), FOREIGN KEY (taskId) REFERENCES tasks(id));"
// And for invoice_items:
// "CREATE TABLE IF NOT EXISTS invoice_items (id TEXT PRIMARY KEY NOT NULL, invoiceId TEXT NOT NULL, description TEXT, quantity REAL, unitPrice REAL, totalPrice REAL, FOREIGN KEY (invoiceId) REFERENCES invoices(id));"
// Note: Changed quantity to REAL in invoice_items to align with typical usage, though INTEGER was in original. Let's stick to REAL for flexibility.

// The initDatabase function needs to be updated with the correct schema.
// Since I cannot re-declare initDatabase, I will provide the corrected table creation lines.
// The user will need to replace the existing CREATE TABLE IF NOT EXISTS for invoices and invoice_items in their initDatabase function.

/*
Corrected schema for initDatabase:

await db.execAsync(
  "CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY NOT NULL, customerId TEXT NOT NULL, taskId TEXT, invoiceNumber TEXT, issueDate TEXT, dueDate TEXT, totalAmount REAL, paymentStatus TEXT, notes TEXT, FOREIGN KEY (customerId) REFERENCES customers(id), FOREIGN KEY (taskId) REFERENCES tasks(id));"
);
console.log("Invoices table checked/created (updated schema).");

await db.execAsync(
  "CREATE TABLE IF NOT EXISTS invoice_items (id TEXT PRIMARY KEY NOT NULL, invoiceId TEXT NOT NULL, description TEXT, quantity REAL, unitPrice REAL, totalPrice REAL, FOREIGN KEY (invoiceId) REFERENCES invoices(id));"
);
console.log("Invoice items table checked/created (updated schema).");

*/
