import express, { response } from 'express';
import mysql from 'mysql';
import cors from 'cors'; 
import bcrypt from 'bcrypt';
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';

const salt = 10;
dotenv.config();

const app = express();
const port = 3000;
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  };
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET"],
    credentials: true
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database');
    } else {
        console.log('Connected to the database');
    }
});
// Registration
app.post('/register', (req, res) => {
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    const checkUsernameQuery = "SELECT * FROM users WHERE username = ?";
    const insertUserQuery = "INSERT INTO users (`name`, `username`, `birthdate`, `role`, `email`, `password`) VALUES (?)";

    // Check if the email already exists
    db.query(checkEmailQuery, [req.body.email], (errEmail, resultEmail) => {
        if (errEmail) {
            console.error("Error checking email:", errEmail);
            return res.status(500).json({ Error: "Internal Server Error" });
        }

        if (resultEmail.length > 0) {
            return res.json({ Status: "Email already exists" });
        }

        // Check if the username already exists
        db.query(checkUsernameQuery, [req.body.username], (errUsername, resultUsername) => {
            if (errUsername) {
                console.error("Error checking username:", errUsername);
                return res.status(500).json({ Error: "Internal Server Error" });
            }

            if (resultUsername.length > 0) {
                return res.json({ Status: "Username already exists" });
            }

            // Hash the password and insert the user into the database
            bcrypt.hash(req.body.password.toString(), salt, (hashErr, hash) => {
                if (hashErr) {
                    console.error("Error hashing password:", hashErr);
                    return res.status(500).json({ Error: "Internal Server Error" });
                }

                const values = [
                    req.body.name,
                    req.body.username,
                    req.body.birthdate,
                    req.body.role,
                    req.body.email,
                    hash
                ];

                // Insert the user into the database
                db.query(insertUserQuery, [values], (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error("Error inserting user:", insertErr);
                        return res.status(500).json({ Error: "Internal Server Error" });
                    }

                    return res.json({ Status: "Success" });
                });
            });
        });
    });
});
//Login
app.post('/login', (req, res) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [req.body.email], (err, data) => {
        if (err) return res.json({ Error: "Login error in server" });

        if (data.length > 0) {
            bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
                if (err) return res.json({ Error: "Password compare error" });

                if (response) {
                    const name = data[0].name;
                    const userRole = data[0].role;

                    // Set the appropriate secret key based on the user role
                    let secretKey;
                    if (userRole === 'admin') {
                        secretKey = process.env.ADMIN_TOKEN;
                    } else if (userRole === 'user') {
                        secretKey = process.env.USER_TOKEN;
                    } else {
                        return res.json({ Error: "Invalid user role" });
                    }
                    
                    // Sign the token using the selected secret key
                    const token = jwt.sign({ name }, secretKey, { expiresIn: '1d' });
                    res.cookie('token', token);

                    return res.json({ Status: "Success", Role: userRole });
                } else {
                    return res.json({ Error: "Password not matched" });
                }
            });
        } else {
            return res.json({ Error: "No email existed" });
        }
    });
});
//Logout
app.post('/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0) });
    return res.json({ Status: 'Success' });
});
//get all user
app.get('/data', (req, res) => {
    const query = 'SELECT * FROM users'; // Replace with your actual table name
  
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      res.json(result);
    });
  });
//get Product
app.get('/product', (req, res) => {
const query = 'SELECT * FROM product';

db.query(query, (err, result) => {
    if (err) {
    console.error('Error executing MySQL query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
    }

    res.json(result);
    });
});
//add Product
app.post('/add_product', async (req, res) => {
    const checkProductNameQuery = "SELECT * FROM product WHERE product_name = ?";
    const insertProductQuery = "INSERT INTO product (`product_name`, `product_description`, `product_photo`, `product_price`, `product_qty`) VALUES (?)";
  
    try {
      // Check if the product name already exists
      db.query(checkProductNameQuery, [req.body.product_name], (errProductName, resultProductName) => {
        if (errProductName) {
          console.error("Error checking product name:", errProductName);
          return res.status(500).json({ Error: "Internal Server Error" });
        }
  
        if (resultProductName.length > 0) {
          return res.json({ Status: "Product name already exists" });
        }
  
        // Product name doesn't exist, proceed to insert the product into the database
        const values = [
          req.body.product_name,
          req.body.product_description,
          req.body.product_photo,
          req.body.product_price,
          req.body.product_qty,
        ];
  
        // Insert the product into the database
        db.query(insertProductQuery, [values], (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Error inserting product:", insertErr);
            return res.status(500).json({ Error: "Internal Server Error" });
          }
  
          return res.status(201).json({ Status: "Product added successfully" });
        });
      });
    } catch (error) {
      console.error('Error adding product:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
});
app.delete('/delete/:itemType/:itemId', (req, res) => {
    const { itemType, itemId } = req.params;
    let tableName;

    if (itemType === 'user') {
        tableName = 'users';
    } else if (itemType === 'product') {
        tableName = 'product';
    } else {
        return res.status(400).json({ Error: 'Invalid item type' });
    }

    const deleteQuery = `DELETE FROM ${tableName} WHERE ${itemType === 'user' ? 'id' : 'product_id'} = ?`;

    db.query(deleteQuery, [itemId], (err, result) => {
        if (err) {
            console.error('Error deleting item:', err);
            return res.status(500).json({ Error: 'Internal Server Error' });
        }

        return res.json({ Status: 'Item deleted successfully' });
    });
});

app.put('/update/:tableName/:id', async (req, res) => {
    const tableName = req.params.tableName;
    const id = req.params.id;
  
    // Determine the update query and corresponding values based on the table name
    let updateQuery, values;
  
    if (tableName === 'product') {
      updateQuery = "UPDATE product SET product_name=?, product_description=?, product_price=?, product_qty=? WHERE product_id=?";
      values = [req.body.product_name, req.body.product_description, req.body.product_price, req.body.product_qty, id];
    } else if (tableName === 'users') {
      updateQuery = "UPDATE users SET name=?, username=?, birthdate=?, role=?, email=? WHERE id=?";
      values = [req.body.name, req.body.username, req.body.birthdate, req.body.role, req.body.email, id];
    } else {
      return res.status(400).json({ Error: "Invalid table name" });
    }
  
    try {
      // Update the record in the database
      db.query(updateQuery, values, (updateErr, updateResult) => {
        if (updateErr) {
          console.error(`Error updating record in ${tableName} table:`, updateErr);
          return res.status(500).json({ Error: "Internal Server Error" });
        }
  
        return res.status(200).json({ Status: `${tableName} record updated successfully` });
      });
    } catch (error) {
      console.error(`Error updating record in ${tableName} table:`, error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
app.listen(port, () => {
    console.log("Server is running...");
})
