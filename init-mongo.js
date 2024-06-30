require('dotenv').config();

// Имя базы данных
var dbName = process.env.DB_NAME || "mydb";

// Создание базы данных
db = db.getSiblingDB(dbName);

// Создание пользователя
db.getSiblingDB("admin").createUser({
  user: process.env.DB_USER,
  pwd: process.env.DB_PASSWORD,
  roles: [
    { role: "root", db: "admin" },
  ]
});

// Создание пользователя в базе данных mydb
db.createUser({
  user: process.env.DB_USER,
  pwd: process.env.DB_PASSWORD,
  roles: [
    { role: "readWrite", db: dbName },
  ]
});

console.log("Username:", process.env.DB_USER);
console.log("Password:", process.env.DB_PASSWORD);