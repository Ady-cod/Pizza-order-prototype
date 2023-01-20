const express = require("express");
const path = require("path");
const cors = require("cors");
const { fileReaderAsync } = require("./fileHandler.js");
const { fileWriterAsync } = require("./fileHandler.js");
const pizzaRoute = path.join(`${__dirname}/pizza.json`);
const allergensRoute = path.join(`${__dirname}/allergens.json`);
const ordersRoute = path.join(`${__dirname}/orders.json`);
const htmlRoute = path.join(`${__dirname}/../frontend/index.html`);
const idPizzaOrdersRoute = path.join(`${__dirname}/idPizzaOrders.json`);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = 9000;

app.get("/api/pizza", async (req, res) => {
  const filePath = pizzaRoute;
  const fileData = await fileReaderAsync(filePath);
  // console.log(typeof fileData);
  const data = JSON.parse(fileData);
  //  console.log(typeof data);
  const pizzaArray = data.pizza;
  const dataToSend = JSON.stringify(pizzaArray, null, 4);
  res.send(dataToSend);
  // console.log(dataToSend);
});

app.get("/api/allergens", async (req, res) => {
  const filePath = allergensRoute;
  const fileData = await fileReaderAsync(filePath);
  const data = JSON.parse(fileData);
  const allergensArray = data.allergens;
  const dataToSend = JSON.stringify(allergensArray, null, 4);
  res.send(dataToSend);
});

app.get("/pizza/list", async (req, res) => {
  res.sendFile(htmlRoute);
});

app.get("/api/order", async (req, res) => {
  const filePath = ordersRoute;
  const fileData = await fileReaderAsync(filePath);
  const data = JSON.parse(fileData);
  const ordersArray = data.orders;
  const dataToSend = JSON.stringify(ordersArray, null, 4);
  res.send(dataToSend);
});

app.post("/api/order", async (req, res) => {
  const filePath = ordersRoute;
  const fileData = await fileReaderAsync(filePath);
  let data = JSON.parse(fileData);
  let ordersArray = data.orders;

  const idArrData = await fileReaderAsync(idPizzaOrdersRoute);
  let idArrOrders = JSON.parse(idArrData);

  const id = Math.max(...data.orders.map((el) => el.id)) + 1;

  let currentTime = new Date();
  let year = +JSON.stringify(currentTime).slice(1, 5);
  let month = +JSON.stringify(currentTime).slice(6, 8);
  let day = +JSON.stringify(currentTime).slice(9, 11);
  let hour = +JSON.stringify(currentTime).slice(12, 14) + 2;
  let minute = +JSON.stringify(currentTime).slice(15, 17);

  let newOrder = {
    id: id,
    pizzas: [...idArrOrders],
    date: {
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
    },
    customer: {
      name: `${req.body.firstname} ${req.body.lastname}`,
      email: `${req.body.email}`,
      address: {
        city: `${req.body.city}`,
        street: `${req.body.street}`,
      },
    },
  };

  ordersArray.push(newOrder);

  let content = JSON.stringify(data, null, 4);
  await fileWriterAsync(filePath, content);
  res.status(200).send("DONE");
});

app.post("/write/pizza/order", async (req, res) => {
  let content = JSON.stringify(req.body, null, 4);
  const filePath = idPizzaOrdersRoute;

  await fileWriterAsync(filePath, content);
  res.status(200).send("DONE");
});

app.get("/", async (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/order.html`));
});

app.use("/public", express.static(`${__dirname}/../frontend/public`));

app.listen(port, () => console.log(`http://127.0.0.1:${port}`));
