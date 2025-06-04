import * as SQLite from 'expo-sqlite';

// Initialize the database connection promise using the new async API
const dbInstancePromise = SQLite.openDatabaseAsync('autoorganizeme.db');

// Helper to get the database instance
async function getDb() {
  return dbInstancePromise; // The promise itself resolves to the db instance
}

export const initDatabase = async () => {
  const db = await getDb();
  console.log('Initializing database with new async API...');
  try {
    await db.withTransactionAsync(async () => {
      await db.execAsync('CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT);');
      console.log('Customers table checked/created.');

      await db.execAsync('CREATE TABLE IF NOT EXISTS vehicles (id TEXT PRIMARY KEY NOT NULL, customerId TEXT NOT NULL, make TEXT, model TEXT, year INTEGER, vin TEXT UNIQUE, engineType TEXT, FOREIGN KEY (customerId) REFERENCES customers(id));');
      console.log('Vehicles table checked/created.');

      await db.execAsync('CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY NOT NULL, vehicleId TEXT, customerId TEXT, title TEXT NOT NULL, description TEXT, category TEXT, status TEXT NOT NULL, createdDate TEXT, dueDate TEXT, FOREIGN KEY (vehicleId) REFERENCES vehicles(id), FOREIGN KEY (customerId) REFERENCES customers(id));');
      console.log('Tasks table checked/created.');

      await db.execAsync('CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY NOT NULL, customerId TEXT NOT NULL, taskId TEXT, issueDate TEXT, dueDate TEXT, totalAmount REAL, laborCosts REAL, paymentStatus TEXT, FOREIGN KEY (customerId) REFERENCES customers(id), FOREIGN KEY (taskId) REFERENCES tasks(id));');
      console.log('Invoices table checked/created.');

      await db.execAsync('CREATE TABLE IF NOT EXISTS invoice_items (id TEXT PRIMARY KEY NOT NULL, invoiceId TEXT NOT NULL, description TEXT, quantity INTEGER, unitPrice REAL, totalPrice REAL, FOREIGN KEY (invoiceId) REFERENCES invoices(id));');
      console.log('Invoice items table checked/created.');

      await db.execAsync('CREATE TABLE IF NOT EXISTS schedule (id TEXT PRIMARY KEY NOT NULL, taskId TEXT, jobDate TEXT, startTime TEXT, endTime TEXT, notes TEXT, FOREIGN KEY (taskId) REFERENCES tasks(id));');
      console.log('Schedule table checked/created.');

      await db.execAsync('CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY NOT NULL, parentId TEXT NOT NULL, parentType TEXT NOT NULL, uri TEXT NOT NULL, notes TEXT);');
      console.log('Photos table checked/created.');
    });
    console.log('Database initialized successfully using new API.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error; // Re-throw to be caught by App.js or other callers
  }
};

// Customer CRUD Operations
export const addCustomer = async (customer) => {
  const db = await getDb();
  console.log('[database.js] addCustomer: Attempting to add customer:', JSON.stringify(customer));
  try {
    const result = await db.runAsync(
      'INSERT INTO customers (id, name, phone, email, address) VALUES (?, ?, ?, ?, ?);',
      [customer.id, customer.name, customer.phone, customer.email, customer.address]
    );
    console.log('[database.js] addCustomer: DB runAsync result:', JSON.stringify(result));
    if (result.changes > 0) {
      console.log('[database.js] addCustomer: Customer added successfully, changes:', result.changes);
      return true; // Explicit success
    } else {
      console.warn('[database.js] addCustomer: No changes made by INSERT operation. Result:', JSON.stringify(result));
      throw new Error('Customer insert operation resulted in no changes.');
    }
  } catch (error) {
    console.error('[database.js] Error adding customer: %s, Stack: %s', error.message, error.stack);
    throw error; // Re-throw
  }
};

export const getCustomers = async () => {
  const db = await getDb();
  try {
    return await db.getAllAsync('SELECT * FROM customers ORDER BY name ASC;');
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
};

export const getCustomerById = async (id) => {
  const db = await getDb();
  try {
    return await db.getFirstAsync('SELECT * FROM customers WHERE id = ?;', [id]);
  } catch (error) {
    console.error(`Error getting customer by id ${id}:`, error);
    throw error;
  }
};

export const updateCustomer = async (id, customer) => {
  const db = await getDb();
  console.log(`[database.js] updateCustomer: Attempting to update customer ${id}:`, JSON.stringify(customer));
  try {
    const result = await db.runAsync(
      'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?;',
      [customer.name, customer.phone, customer.email, customer.address, id]
    );
    console.log(`[database.js] updateCustomer: DB runAsync result for customer ${id}:`, JSON.stringify(result));
    // result.changes indicates the number of rows affected.
    // For an update, this could be 0 if the new data is the same as the old data,
    // or if the ID doesn't exist. We'll return the number of changes.
    // The calling function can decide if 0 changes is an "issue" or not.
    return result.changes; 
  } catch (error) {
    console.error(`[database.js] Error updating customer id ${id}: %s, Stack: %s`, error.message, error.stack);
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
      await db.runAsync("DELETE FROM photos WHERE parentId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?)) AND parentType = 'task';", [id, id]);
      await db.runAsync("DELETE FROM photos WHERE parentId IN (SELECT id FROM vehicles WHERE customerId = ?) AND parentType = 'vehicle';", [id]);
      await db.runAsync("DELETE FROM photos WHERE parentId = ? AND parentType = 'customer';", [id]);
      await db.runAsync("DELETE FROM schedule WHERE taskId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?));", [id, id]);
      await db.runAsync("DELETE FROM invoice_items WHERE invoiceId IN (SELECT id FROM invoices WHERE customerId = ? OR taskId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?)));", [id, id, id]);
      await db.runAsync("DELETE FROM invoices WHERE customerId = ? OR taskId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?));", [id, id, id]);
      await db.runAsync("DELETE FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?);", [id, id]);
      await db.runAsync('DELETE FROM vehicles WHERE customerId = ?;', [id]);
      const customerDeleteResult = await db.runAsync('DELETE FROM customers WHERE id = ?;', [id]);
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
      'INSERT INTO vehicles (id, customerId, make, model, year, vin, engineType) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [vehicle.id, vehicle.customerId, vehicle.make, vehicle.model, vehicle.year, vehicle.vin, vehicle.engineType]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
};

export const getVehiclesForCustomer = async (customerId) => {
  const db = await getDb();
  try {
    return await db.getAllAsync('SELECT * FROM vehicles WHERE customerId = ? ORDER BY make ASC, model ASC;', [customerId]);
  } catch (error) {
    console.error(`Error getting vehicles for customer id ${customerId}:`, error);
    throw error;
  }
};

export const getVehicleById = async (id) => {
  const db = await getDb();
  try {
    return await db.getFirstAsync('SELECT * FROM vehicles WHERE id = ?;', [id]);
  } catch (error) {
    console.error(`Error getting vehicle by id ${id}:`, error);
    throw error;
  }
};

export const updateVehicle = async (id, vehicle) => {
  const db = await getDb();
  try {
    const result = await db.runAsync(
      'UPDATE vehicles SET customerId = ?, make = ?, model = ?, year = ?, vin = ?, engineType = ? WHERE id = ?;',
      [vehicle.customerId, vehicle.make, vehicle.model, vehicle.year, vehicle.vin, vehicle.engineType, id]
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
      await db.runAsync("DELETE FROM photos WHERE parentId IN (SELECT id FROM tasks WHERE vehicleId = ?) AND parentType = 'task';", [id]);
      await db.runAsync("DELETE FROM photos WHERE parentId = ? AND parentType = 'vehicle';", [id]);
      await db.runAsync("DELETE FROM schedule WHERE taskId IN (SELECT id FROM tasks WHERE vehicleId = ?);", [id]);
      await db.runAsync("DELETE FROM invoice_items WHERE invoiceId IN (SELECT id FROM invoices WHERE taskId IN (SELECT id FROM tasks WHERE vehicleId = ?));", [id]);
      await db.runAsync("DELETE FROM invoices WHERE taskId IN (SELECT id FROM tasks WHERE vehicleId = ?);", [id]);
      await db.runAsync('DELETE FROM tasks WHERE vehicleId = ?;', [id]);
      const vehicleDeleteResult = await db.runAsync('DELETE FROM vehicles WHERE id = ?;', [id]);
      totalChanges = vehicleDeleteResult.changes;
    });
    return totalChanges; // Return number of vehicles deleted
  } catch (error) {
    console.error(`Error deleting vehicle id ${id}:`, error);
    throw error;
  }
};

// Note: The old 'export default db;' is removed as it's no longer applicable.
// Modules should import the specific async functions they need.
