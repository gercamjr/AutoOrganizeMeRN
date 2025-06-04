import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('autoorganizeme.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT);',
        [],
        () => { console.log('Customers table created successfully'); },
        (_, error) => { console.error('Error creating customers table: ', error); reject(error); return false; }
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS vehicles (id TEXT PRIMARY KEY NOT NULL, customerId TEXT NOT NULL, make TEXT, model TEXT, year INTEGER, vin TEXT UNIQUE, engineType TEXT, FOREIGN KEY (customerId) REFERENCES customers(id));',
        [],
        () => { console.log('Vehicles table created successfully'); },
        (_, error) => { console.error('Error creating vehicles table: ', error); reject(error); return false; }
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY NOT NULL, vehicleId TEXT, customerId TEXT, title TEXT NOT NULL, description TEXT, category TEXT, status TEXT NOT NULL, createdDate TEXT, dueDate TEXT, FOREIGN KEY (vehicleId) REFERENCES vehicles(id), FOREIGN KEY (customerId) REFERENCES customers(id));',
        [],
        () => { console.log('Tasks table created successfully'); },
        (_, error) => { console.error('Error creating tasks table: ', error); reject(error); return false; }
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY NOT NULL, customerId TEXT NOT NULL, taskId TEXT, issueDate TEXT, dueDate TEXT, totalAmount REAL, laborCosts REAL, paymentStatus TEXT, FOREIGN KEY (customerId) REFERENCES customers(id), FOREIGN KEY (taskId) REFERENCES tasks(id));',
        [],
        () => { console.log('Invoices table created successfully'); },
        (_, error) => { console.error('Error creating invoices table: ', error); reject(error); return false; }
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS invoice_items (id TEXT PRIMARY KEY NOT NULL, invoiceId TEXT NOT NULL, description TEXT, quantity INTEGER, unitPrice REAL, totalPrice REAL, FOREIGN KEY (invoiceId) REFERENCES invoices(id));',
        [],
        () => { console.log('Invoice items table created successfully'); },
        (_, error) => { console.error('Error creating invoice_items table: ', error); reject(error); return false; }
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS schedule (id TEXT PRIMARY KEY NOT NULL, taskId TEXT, jobDate TEXT, startTime TEXT, endTime TEXT, notes TEXT, FOREIGN KEY (taskId) REFERENCES tasks(id));',
        [],
        () => { console.log('Schedule table created successfully'); },
        (_, error) => { console.error('Error creating schedule table: ', error); reject(error); return false; }
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY NOT NULL, parentId TEXT NOT NULL, parentType TEXT NOT NULL, uri TEXT NOT NULL, notes TEXT);',
        [],
        () => { console.log('Photos table created successfully'); resolve(); },
        (_, error) => { console.error('Error creating photos table: ', error); reject(error); return false; }
      );
    },
    (error) => {
      console.error("Database transaction error: ", error);
      reject(error);
    },
    () => {
      // Transaction success is handled by individual executeSql success callbacks or the final one.
      // Resolve is called in the last executeSql success callback.
    });
  });
};

// Customer CRUD Operations
export const addCustomer = (customer) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO customers (id, name, phone, email, address) VALUES (?, ?, ?, ?, ?);',
        [customer.id, customer.name, customer.phone, customer.email, customer.address],
        (_, result) => resolve(result.insertId),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getCustomers = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM customers ORDER BY name ASC;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getCustomerById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM customers WHERE id = ?;',
        [id],
        (_, { rows: { _array } }) => resolve(_array.length > 0 ? _array[0] : null),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const updateCustomer = (id, customer) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?;',
        [customer.name, customer.phone, customer.email, customer.address, id],
        (_, result) => resolve(result.rowsAffected),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const deleteCustomer = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Also delete associated vehicles and tasks for this customer
      tx.executeSql('DELETE FROM photos WHERE parentId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?)) AND parentType = \'task\';', [id, id]);
      tx.executeSql('DELETE FROM photos WHERE parentId IN (SELECT id FROM vehicles WHERE customerId = ?) AND parentType = \'vehicle\';', [id]);
      tx.executeSql('DELETE FROM photos WHERE parentId = ? AND parentType = \'customer\';', [id]);
      tx.executeSql('DELETE FROM schedule WHERE taskId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?));', [id, id]);
      tx.executeSql('DELETE FROM invoice_items WHERE invoiceId IN (SELECT id FROM invoices WHERE customerId = ? OR taskId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?)));', [id, id, id]);
      tx.executeSql('DELETE FROM invoices WHERE customerId = ? OR taskId IN (SELECT id FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?));', [id, id, id]);
      tx.executeSql('DELETE FROM tasks WHERE customerId = ? OR vehicleId IN (SELECT id FROM vehicles WHERE customerId = ?);', [id, id]);
      tx.executeSql('DELETE FROM vehicles WHERE customerId = ?;', [id]);
      tx.executeSql(
        'DELETE FROM customers WHERE id = ?;',
        [id],
        (_, result) => resolve(result.rowsAffected),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

// Vehicle CRUD Operations
export const addVehicle = (vehicle) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO vehicles (id, customerId, make, model, year, vin, engineType) VALUES (?, ?, ?, ?, ?, ?, ?);',
        [vehicle.id, vehicle.customerId, vehicle.make, vehicle.model, vehicle.year, vehicle.vin, vehicle.engineType],
        (_, result) => resolve(result.insertId),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getVehiclesForCustomer = (customerId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM vehicles WHERE customerId = ? ORDER BY make ASC, model ASC;',
        [customerId],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getVehicleById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM vehicles WHERE id = ?;',
        [id],
        (_, { rows: { _array } }) => resolve(_array.length > 0 ? _array[0] : null),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const updateVehicle = (id, vehicle) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE vehicles SET customerId = ?, make = ?, model = ?, year = ?, vin = ?, engineType = ? WHERE id = ?;',
        [vehicle.customerId, vehicle.make, vehicle.model, vehicle.year, vehicle.vin, vehicle.engineType, id],
        (_, result) => resolve(result.rowsAffected),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const deleteVehicle = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Also delete associated tasks and photos for this vehicle
      tx.executeSql('DELETE FROM photos WHERE parentId IN (SELECT id FROM tasks WHERE vehicleId = ?) AND parentType = \'task\';', [id]);
      tx.executeSql('DELETE FROM photos WHERE parentId = ? AND parentType = \'vehicle\';', [id]);
      tx.executeSql('DELETE FROM schedule WHERE taskId IN (SELECT id FROM tasks WHERE vehicleId = ?);', [id]);
      tx.executeSql('DELETE FROM invoice_items WHERE invoiceId IN (SELECT id FROM invoices WHERE taskId IN (SELECT id FROM tasks WHERE vehicleId = ?));', [id]);
      tx.executeSql('DELETE FROM invoices WHERE taskId IN (SELECT id FROM tasks WHERE vehicleId = ?);', [id]);
      tx.executeSql('DELETE FROM tasks WHERE vehicleId = ?;', [id]);
      tx.executeSql(
        'DELETE FROM vehicles WHERE id = ?;',
        [id],
        (_, result) => resolve(result.rowsAffected),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

// Add other database functions (CRUD operations) here later

export default db;
