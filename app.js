// IMPORTANT - DONT FORGET TO RUN npm install TO INSTALL DEPENDENCIES, E.G. THE BELOW MODULES. 

// -----------------------------------------------------------------------------------------------------------------------
// DEFAULT SETUP
// -----------------------------------------------------------------------------------------------------------------------

// Import required modules. In our case, express is used to facilitate server and api endpoints, 
// while fs reads/writes files. The '.promises' allows for async/await functions with fs. 
const express = require('express');
const fs = require('fs').promises;

// [BOILERPLATE DEFAULT] - Create an instance of express 
const app = express();

// -----------------------------------------------------------------------------------------------------------------------
// SETUP OF SIMPLEST API ENDPOINTS
// -----------------------------------------------------------------------------------------------------------------------
// GET endpoint
app.get('/get', (req, res) => {
    // Handle GET request
    res.send('GET request received. You can now test /users');
});

// -----------------------------------------------------------------------------------------------------------------------
// RETURNING SOMETHING MORE INTERESTING IN THE GET ENDPOINT
// -----------------------------------------------------------------------------------------------------------------------
// A simple function to read the files in /data.
async function readJsonFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading file:', err);
      return null;
    }
  }
  
// Endpoint to get all USERS
app.get('/users', async (req, res) => {
    const users = await readJsonFile('./data/users.json');
    if (users) {
      res.json(users);
      console.log('GET request, /users')
    } else {
      res.status(500).send('Error reading users data');
    }
  });

// -----------------------------------------------------------------------------------------------------------------------
// [BOILERPLATE DEFAULT] Server setup. 
// -----------------------------------------------------------------------------------------------------------------------
// This way of defining the URL and port will default to environment variable, but falls back to port 3000 if no environment variables can be found. 
// The URL needs to be defined by you. The port however is either set by Environment variable in your .env-file (locally), 
// automatically set (if GCP App Engine deployed) or manually set in config (if GCP Cloud Run deployed). 
const URL = process.env.URL || 'http://localhost'
const PORT = process.env.PORT || 3000;
// Then, server is started!
app.listen(PORT, () => {
    console.log(`Server running on ${URL}:${PORT}`);
});


// -----------------------------------------------------------------------------------------------------------------------
// THAT DATA WAS UNREADABLE!!! LETS FIX IT!
// -----------------------------------------------------------------------------------------------------------------------
// First, lets add 2 spaces for JSON indentation

// app.set('json spaces', 2) // <--- UNCOMMENT ME

// Then lets access the same content as above using /prettyusers endpoint. 
app.get('/prettyusers', async (req, res) => {
    const users = await readJsonFile('./data/users.json');
    if (users) {
        res.json(users); 
      console.log('GET request, /prettyusers')
    } else {
      res.status(500).send('Error reading Pretty users data');
    }
  });

// Now, go back and have a look at /users

// It's also pretty! 
// Thus, app.set sets some configurations globally. 
// See all default options at https://expressjs.com/en/api.html#app.set
 

// -----------------------------------------------------------------------------------------------------------------------
// BUT WHAT IF YOU WANT A DYNAMIC GET ENDPOINT, AND ONLY USER 1 FROM THE ABOVE?!
// -----------------------------------------------------------------------------------------------------------------------
// Then it's easy! Wen only add a :variable to the enpoint route, and then, we extract the variable from req.params . 
// Then we handle the logic in the response.

// A VERY general example
app.get('/:api/:route/:variable', async (req, res) => {
    const apiVar = req.params.api;
    const routeVar = req.params.route;
    const varVar = req.params.variable;

    // Changed the ""/'' for `` to allow for dynamic variables in strings. 
    res.send(`GET request, req.params are ${apiVar} ${routeVar} ${varVar}`);
    console.log(`GET request, req.params are ${apiVar} ${routeVar} ${varVar}`);
});

// Go test the above! You can input whatever you want, as long as you have 3 variable fields!
// Lets make the dyanamics work even better for our user case. 

app.get('/api/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10); // Convert the variable to integer
    const users = await readJsonFile('./data/users.json');

    if (users) {
        // Find the user with the matching ID
        // Find our specific user by finding u.id === userId variable in users. 
        const user = users.find(u => u.id === userId);
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } else {
        res.status(500).send('Error reading users data');
    }
});


// -----------------------------------------------------------------------------------------------------------------------
// NOW, LETS ADD MORE USERS WITH SOME POST REQUESTS
// -----------------------------------------------------------------------------------------------------------------------
// In the context of web development and API design, the POST method is one of the HTTP request methods used to send data 
// to a server to create or update a resource. Unlike GET requests, which are used primarily to retrieve data, POST requests 
// are designed to submit data to be processed to a specified resource.
// The POST method is often used for various tasks such as submitting form data, uploading a file, or updating a database. 
// It is considered a "non-idempotent" method, meaning that multiple identical POST requests may have different effects, 
// unlike GET requests which are idempotent and can be repeated without side effects.
// Data sent via POST requests are typically included in the body of the request. This can be in various formats such as JSON, 
// XML, or form data. The content type of the request body is specified in the request headers, commonly as 
// Content-Type: application/json for JSON data.
// POST requests are essential in RESTful APIs and web applications for creating new resources or performing actions 
// that change the server's state.

// Middleware to parse req.body as json. This will require post to include json-object in request body.
app.use(express.json());

// An endpoint can have both GET and POST methods associated with it. 
app.post('/users', async (req, res) => {
    try {
        // Read existing users
        const data = await fs.readFile('./data/users.json', 'utf8');
        const users = JSON.parse(data);

        // Determine the next ID. GPT provided this nice code for that. 
        const nextId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;

        // Assign a default role if unassigned
        const defaultRole = 'peasant';
        const newUser = {
            id: nextId,
            ...req.body,
            role: req.body.role || defaultRole
        };

        // Add new user
        users.push(newUser);

        // Write updated users back to file
        await fs.writeFile('./data/users.json', JSON.stringify(users, null, 4), 'utf8');

        res.status(201).json(newUser);
        console.log(`POST request received to /users with data: ${JSON.stringify(req.body)}`);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error processing request');
    }
});


// NOW, Open your Browser, open the console, update the new user details below and copy/paste the string below in the console
const copyallthisbutthestringtags = `

fetch('/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }) // Modify as needed
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

`
// Did you get a couple of new users?

// -----------------------------------------------------------------------------------------------------------------------
// END OF PART 1 - WHY DONT YOU EXPERIMENT WITH THE PRODUCTS AND ORDERS FILES TOO?
// -----------------------------------------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------------------------------------
// Some GPT templates could help you get started below... 
// -----------------------------------------------------------------------------------------------------------------------

// Endpoint to get all PRODUCTS
app.get('/api/products', async (req, res) => {
    const products = await readJsonFile('./data/products.json');
    if (products) {
      res.json(products);
      console.log('GET request, /products')
    } else {
      res.status(500).send('Error reading products data');
    }
  });
  
  // Endpoint to get all ORDERS
  app.get('/api/orders', async (req, res) => {
    const orders = await readJsonFile('./data/orders.json');
    if (orders) {
      res.json(orders);
      console.log('GET request, /orders')
    } else {
      res.status(500).send('Error reading orders data');
    }
  });

// POST endpoint
app.post('/api/postExample', (req, res) => {
    // Handle POST request. Data sent in request body
    const data = req.body;
    res.send(`POST request received with data: ${JSON.stringify(data)}`);
});



// -----------------------------------------------------------------------------------------------------------------------
// TBA - PART 2
// -----------------------------------------------------------------------------------------------------------------------
// PUT Method
// The PUT method is used for updating existing resources on the server or creating a new resource at a specific URI 
// if it does not exist. Here are some key characteristics:

// Idempotence: A key feature of the PUT method is its idempotency, which means that making the same PUT request 
// multiple times will always produce the same result. In other words, repeating the request does not have additional 
// effects after the first time it's successfully processed.

// Data Replacement: When using PUT, the expectation is that the provided request body contains the complete new state 
// of the resource. It essentially replaces the entire resource with the provided data. This is different from PATCH, 
// which applies partial modifications.

// Usage Example: Suppose you have a resource located at /api/users/123. A PUT request to this URL would replace the 
// entire user data (with ID 123) with the data provided in the request body.

// Creating Resources: If the server allows it, PUT can also be used to create new resources. In such cases, the 
// client might specify the resource's URI.

// PUT endpoint
app.put('/api/putExample/:id', (req, res) => {
    // Handle PUT request. Data sent in request body, ID in URL
    const id = req.params.id;
    const data = req.body;
    res.send(`PUT request received for ID ${id} with data: ${JSON.stringify(data)}`);
});

// DELETE Method
// The DELETE method is used to remove resources from the server. Here's what it typically entails:

// Resource Deletion: As the name suggests, a DELETE request is used to delete a resource identified by the Request-URI.

// Idempotence: Like PUT, the DELETE method is also idempotent. Whether you send the DELETE request once or multiple times, 
// the end result is the same: the resource is deleted. Subsequent DELETE requests may return a 404 (Not Found) status, 
// but this is still considered idempotent as the state of the server doesn't change after the initial deletion.

// No Request Body: Typically, DELETE requests do not carry a request body. They are simple in that they simply request 
// the deletion of a specific resource.

// Usage Example: To delete a user with a specific ID, you might send a DELETE request to /api/users/123. This would delete 
// the user with ID 123.

// DELETE endpoint
app.delete('/api/deleteExample/:id', (req, res) => {
    // Handle DELETE request. ID sent in URL
    const id = req.params.id;
    res.send(`DELETE request received for ID ${id}`);
});
