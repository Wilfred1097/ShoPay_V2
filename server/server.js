import express, { response } from 'express';
import mysql from 'mysql';
import cors from 'cors'; 
import bcrypt from 'bcrypt';
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';

const salt = 10;
dotenv.config();

// Middleware function to extract user ID from the token
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized", message: "Authentication token is missing." });
  }

  jwt.verify(token, process.env.USER_TOKEN, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "Unauthorized", message: "Authentication token has expired." });
      } else {
        return res.status(403).json({ error: "Forbidden", message: "Invalid authentication token." });
      }
    }

    // Add the user ID to the request object
    req.userId = user.userId;
    next();
  });
};


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
    origin: ["*"],
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
    const insertUserQuery = "INSERT INTO users (`name`, `username`, `birthdate`, `address`, `role`, `email`, `profile_pic`, `password`) VALUES (?)";

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
                    req.body.address,
                    req.body.role,
                    req.body.email,
                    req.body.profile,
                    hash
                ];

                if (db.state === 'disconnected') {
                  db.connect();
                }

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

      if (db.state === 'disconnected') {
        db.connect();
      }

      if (data.length > 0) {
          bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
              if (err) return res.json({ Error: "Password compare error" });

              if (response) {
                  const name = data[0].name;
                  const userId = data[0].user_id; // Retrieve the user ID
                  const userRole = data[0].role;

                  // Set the appropriate secret key based on the user role
                  let secretKey;
                  if (userRole === 'admin') {
                    if (!process.env.ADMIN_TOKEN) {
                        return res.json({ Error: "Admin token not configured" });
                    }
                    secretKey = process.env.ADMIN_TOKEN;
                  } else if (userRole === 'user') {
                      if (!process.env.USER_TOKEN) {
                          return res.json({ Error: "User token not configured" });
                      }
                      secretKey = process.env.USER_TOKEN;
                  } else {
                      return res.json({ Error: "Invalid user role" });
                  }
                  
                  // Sign the token using the selected secret key
                  const token = jwt.sign({ userId, name }, secretKey, { expiresIn: '1d' });
                  res.cookie('token', token);

                  return res.json({ Status: "Success", Role: userRole, UserId: userId });
              } else {
                  return res.json({ Error: "Password not matched" });
              }
          });
      } else {
          return res.json({ Error: "No email existed" });
      }
  });
});
//Profile and Purchase History
app.get('/profile', authenticateToken, (req, res) => {
  const userId = req.userId;

  const getUserQuery = 'SELECT * FROM users WHERE user_id = ?';
  const getPurchaseQuery = 'SELECT product_name, quantity, purchased_date FROM purchase WHERE user_id = ?';

  db.query(getUserQuery, [userId], (userErr, userResult) => {
    if (userErr) {
      console.error('Error executing MySQL query for user information:', userErr);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const user = userResult[0];

    db.query(getPurchaseQuery, [userId], (purchaseErr, purchaseResult) => {
      if (purchaseErr) {
        console.error('Error executing MySQL query for purchased items:', purchaseErr);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      const purchasedItems = purchaseResult.map((item) => ({
        product_name: item.product_name,
        quantity: item.quantity,
        purchased_date: item.purchased_date,
      }));

      res.json({
        userId: user.user_id,
        name: user.name,
        username: user.username,
        address: user.address,
        email: user.email,
        profile_pic: user.profile_pic,
        purchasedItems: purchasedItems,
      });
    });
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

    if (db.state === 'disconnected') {
      db.connect();
    }
  
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

if (db.state === 'disconnected') {
  db.connect();
}

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
  
    if (db.state === 'disconnected') {
      db.connect();
    }

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
          db.end();
          return res.status(201).json({ Status: "Product added successfully" });
        });
      });
    } catch (error) {
      console.error('Error adding product:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
});
//delete
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
    if (db.state === 'disconnected') {
      db.connect();
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
//ipdate
app.put('/update/:tableName/:id', async (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  let updateQuery, values;

  if (db.state === 'disconnected') {
    db.connect();
  }

  if (tableName === 'product') {
    updateQuery = "UPDATE product SET product_name=?, product_description=?, product_price=?, product_qty=? WHERE product_id=?";
    values = [req.body.product_name, req.body.product_description, req.body.product_price, req.body.product_qty, id];
  } else if (tableName === 'users') {
    updateQuery = "UPDATE users SET name=?, username=?, birthdate=?, address=?, role=?, email=? WHERE user_id=?";
    values = [req.body.name, req.body.username, req.body.birthdate, req.body.address, req.body.role, req.body.email, id];
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

//fetch product details based on product ID
app.get('/product/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    res.status(400).json({ error: 'Invalid product ID' });
    return;
  }

  if (db.state === 'disconnected') {
    db.connect();
  }

  const getProductQuery = 'SELECT * FROM product WHERE product_id = ?';

  db.query(getProductQuery, [productId], (err, result) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = result[0];

    res.json({
      product_id: product.product_id,
      product_name: product.product_name,
      product_description: product.product_description,
      product_photo: product.product_photo,
      product_price: product.product_price,
      product_qty: product.product_qty,
    });
  });
});
// Add to Cart
app.post('/add-to-cart', authenticateToken, (req, res) => {
  const userId = req.userId;
  const productId = req.body.productId; // Assuming the product ID is sent in the request body

  if (db.state === 'disconnected') {
    db.connect();
  }

  // Check if the product is already in the user's cart
  const checkCartQuery = 'SELECT * FROM cart WHERE user_id = ? AND product_ids = ?';
  db.query(checkCartQuery, [userId, productId], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking cart:', checkErr);
      return res.status(500).json({ error: 'Internal Server Error - Check Cart' });
    }

    if (checkResult.length > 0) {
      return res.json({ status: 'Product already in the cart' });
    }

    const addToCartQuery = 'INSERT INTO cart (user_id, product_ids, quantity) VALUES (?, ?, 1)';
    db.query(addToCartQuery, [userId, productId], (addErr, addResult) => {
      if (addErr) {
        console.error('Error adding to cart:', addErr);
        return res.status(500).json({ error: 'Internal Server Error - Add to Cart' });
      }

      return res.json({ status: 'Product added to cart successfully' });
    });
  });
});
// Endpoint to fetch cart products based on user ID
app.get('/cart', authenticateToken, (req, res) => {
  const userId = req.userId;

  if (db.state === 'disconnected') {
    db.connect();
  }

  const getCartProductsQuery = `
    SELECT * FROM CartProductView WHERE user_id = ?;
  `;

  db.query(getCartProductsQuery, [userId], (err, result) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        details: 'An error occurred while fetching cart products.',
      });
    }

    // Assuming result is an array of rows from the query
    const cartProducts = result.map((row) => ({
      cart_id: row.cart_id,
      product_id: row.product_id,
      product_name: row.product_name,
      product_description: row.product_description,
      product_price: row.product_price,
      quantity: row.quantity,
    }));

    // Send the JSON-formatted result in the response
    res.json({ data: cartProducts });

    // Avoid logging sensitive information in a production environment
    // console.log('Cart products fetched successfully:', cartProducts);
  });
});
//Chekout
app.post('/checkout', authenticateToken, async (req, res) => {
  const { productName, cartId } = req.body;
  const userId = req.userId;

  if (db.state === 'disconnected') {
    db.connect();
  }

  try {
    // Perform the checkout process, update checkout table, and product table
    // Example SQL queries:
    
    // Insert into Purchase table (assuming Purchase is your checkout table)
    await db.query('INSERT INTO purchase (user_id, product_name, quantity) VALUES (?, ?, ?)', [userId, productName, 1]);

    // Update Product table to reduce quantity
    await db.query('UPDATE product SET product_qty = product_qty - 1 WHERE product_name = ?', [productName]);

    // Delete the record from CartProductView using cartId
    await db.query('DELETE FROM cart WHERE cart_id = ?', [cartId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
    console.log("Server is running...");
})
