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

// Add other database functions (CRUD operations) here later

export default db;
