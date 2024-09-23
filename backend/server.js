require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('./middleware/requireAuth'); // Adjust the path as needed
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/user');
const cors = require('cors');
const cron = require('node-cron');
const taskController = require('./controllers/taskController');


// express app
const app = express();

// Schedule a task to run every hour to update task statuses
cron.schedule('0 * * * *', () => {
  console.log('Updating task statuses');
  //taskController.updateTaskStatuses();
});

// Add CORS configuration
app.use(cors({
  origin: process.env.DOMAIN_NAME,
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
}));


// middleware
app.use(express.json());

app.use((req, res, next) => {
  next();
});

// routes
app.use('/api/user', userRoutes);
app.use(requireAuth);
app.use('/api/tasks', taskRoutes);


// connect to db using .env file **add DB link to .env**
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
  console.log('connected to database');
  // listen to port
  app.listen(process.env.PORT, () => {
    console.log('listening for requests on port', process.env.PORT);
  });
})
.catch((err) => {
  console.log(err);
});
