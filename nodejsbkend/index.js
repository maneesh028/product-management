const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;
const cors = require('cors');

app.use(express.json())

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myfirstDB',
    password: 'paragon',
    port: 5432, // default PostgreSQL port
  });

app.use(bodyParser.json());
app.get('/userslist', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('select * from auth');
      res.json(result.rows);
      client.release();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/auth', async (req, res) => {
    try {
      const client = await pool.connect();
      let sucess = false
      const result = await client.query({
        text :'select count(*) from auth where username =$1 and pwd =$2',
    values: [req.body.username,req.body.pwd]});
      if(result.rows[0].count != 1){
        sucess = false
      }else{
        sucess = true

      }

      res.json(sucess);
      client.release();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // input to DB
  app.post('/addproduct', async (req, res) => {
    try {
      const client = await pool.connect();
      let sucess = false
      console.log(req.body.productCode,req.body.product_description,req.body.price,req.body.location,req.body.status)
      const result = await client.query({
        text :'INSERT INTO product_manager(product_code, product_description, price,location,status)  VALUES ($1, $2, $3,$4,$5);',
    values: [req.body.product_code,req.body.product_description,req.body.price,req.body.location,req.body.status]})
        sucess = true

      res.json(sucess);
      client.release();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // db to frontend
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM product_manager');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// delete products
app.delete('/products/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query('DELETE FROM product_manager WHERE product_id = '+id);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json({ message: 'Product deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// table to edit
app.get('/productsEdit/:id', async (req, res) => {  
  const id = req.params.id;

try {
  const result = await pool.query('SELECT * FROM product_manager WHERE product_id = $1', [id]);
  if (result.rows.length > 0) {
    res.json(result.rows[0]);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
}
});

// edit to table

app.post('/productsUpdate', async (req, res) => {  
  try {
      const client = await pool.connect();
      let sucess = false
      console.log(req.body.product_code, req.body.product_description, req.body.price, req.body.location, req.body.status, req.body.product_id);

      const result = await client.query({
       text: 'UPDATE public.product_manager SET product_code = $1, product_description = $2, price = $3, location = $4, status = $5 WHERE product_id = $6',
       values: [req.body.product_code, req.body.product_description, req.body.price, req.body.location, req.body.status, req.body.product_id]});

     sucess = true
      res.json(sucess);
      client.release();
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// customer pages

// DB to customertable
app.get('/customer', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customerdetails');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// delete customer by id
app.delete('/customer/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query('DELETE FROM customerdetails WHERE customer_id = '+id);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Customer not found' });
    } else {
      res.json({ message: 'Customer deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting Customer:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// input to db (cutomer details page to table page)
app.post('/addcustomer', async (req, res) => {
  try {
    const client = await pool.connect();
    let sucess = false
    console.log(req.body.customer_name,req.body.phone_no,req.body.email,req.body.address_line1,req.body.address_line2,req.body.address_line3,req.body.city,req.body.pincode,req.body.status,req.body.gst)
    const result = await client.query({
      text :'INSERT INTO customerdetails (customer_name, phone_no, email, address_line1, address_line2, address_line3, city, pincode, status, gst)  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
    values: [req.body.customer_name,req.body.phone_no,req.body.email,req.body.address_line1,req.body.address_line2,req.body.address_line3,req.body.city,req.body.pincode,req.body.status,req.body.gst]})
      sucess = true

    res.json(sucess);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// table to edit customer
app.get('/customer/:id', async (req, res) => {  
  const id = req.params.id;

try {
  const result = await pool.query('SELECT * FROM customerdetails WHERE customer_id = $1', [id]);
  if (result.rows.length > 0) {
    res.json(result.rows[0]);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
}
});

// customer edit to table update
app.post('/customerUpdate', async (req, res) => {  
  try {
      const client = await pool.connect();
      let sucess = false
      console.log(req.body.customer_name, req.body.phone_no, req.body.email, req.body.address_line1, req.body.address_line2, req.body.address_line3, req.body.city, req.body.pincode, req.body.status, req.body.gst, req.body.customer_id);

      const result = await client.query({
        text: 'UPDATE customerdetails SET customer_name = $1, phone_no = $2, email = $3, address_line1 = $4, address_line2 = $5, address_line3 = $6, city = $7, pincode = $8, status = $9, gst = $10 WHERE customer_id = $11',
      values: [req.body.customer_name, req.body.phone_no, req.body.email, req.body.address_line1, req.body.address_line2, req.body.address_line3, req.body.city, req.body.pincode, req.body.status, req.body.gst, req.body.customer_id]});

      sucess = true
      res.json(sucess);
      client.release();
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// invoice table
app.get('/invoice', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.invoice_details');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

//invoice delete
app.delete('/invoice/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query('DELETE FROM invoice_details WHERE invoice_no = '+id);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Invoice not found' });
    } else {
      res.json({ message: 'Invoice deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting Invoice:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}); 


// SALES PAGES

app.get('/customers', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT customer_id, customer_name FROM customerdetails');
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Fetch products
app.get('/product', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT product_code, product_description FROM product_manager');
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// addinvoice.components
// to fetch customer name and id
// app.get('/customerid_name', async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const result = await client.query('SELECT customer_id, customer_name FROM  customerdetails');
//     res.json(result.rows);
//     client.release();
//   } catch (err) {
//     console.error('Error fetching customers:', err);
//     res.status(500).json({ error: 'An error occurred' });
//   }
// });


// app.get('/products', async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const result = await client.query('SELECT product_id, product_code, product_description FROM product_manager');
//     res.json(result.rows);
//     client.release();
//   } catch (err) {
//     console.error('Error fetching products:', err);
//     res.status(500).json({ error: 'An error occurred' });
//   }
// });





// Route to fetch customer IDs
// app.get('/customer/:id', async (req, res) => {
//   try {
//     const result = await dbPool.query('SELECT customer_id FROM customer');
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// app.get('/customer/:id', async (req, res) => {  
//   const id = req.params.id;

// try {
//   const result = await pool.query('SELECT * FROM customer WHERE customer_id = $1', [id]);
//   if (result.rows.length > 0) {
//     res.json(result.rows[0]);
//   } else {
//     res.status(404).json({ message: 'Customer not found' });
//   }
// } catch (error) {
//   console.error(error);
//   res.status(500).json({ message: 'Internal server error' });
// }
// });


// Route to fetch all customer IDs
app.get('/customer', async (req, res) => {
  try {
    const result = await dbPool.query('SELECT customer_id FROM customer');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/customer/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await dbPool.query('SELECT * FROM customer WHERE customer_id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// addinvoice to invoice table

app.post('/addinvoice', async (req, res) => {
  try {
    const client = await pool.connect();
    let sucess = false

    console.log(req.body.invoicedate, req.body.customer_name, req.body.product_code, req.body.quantity, req.body.product_price)
    const result = await client.query({
      text :'INSERT INTO invoice_details(invoicedate, customer_name, product_code, quantity,product_price)  VALUES ($1, $2, $3,$4,$5);',
  values: [req.body.invoicedate,req.body.customer_name, req.body.product_code ,req.body.quantity,req.body.product_price]});
      sucess = true

    res.json(sucess);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// fetch customer to invoicedetails
app.get('/invoicedetails', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customerdetails');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });


