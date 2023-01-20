const body = document.body;
const divRoot = document.createElement("div");
const nav = document.createElement("nav");
const filterNav = document.createElement("nav");
const displayOrderSelection = document.createElement("div");
const divPizzaList = document.createElement("div");
const divAllergens = document.createElement("div");
const allergensFilterTitle = document.createElement("h3");
allergensFilterTitle.innerText = "Choose allergen filters:";
body.appendChild(divRoot);
divRoot.appendChild(nav);
divRoot.appendChild(filterNav);
divRoot.appendChild(displayOrderSelection);
divRoot.appendChild(divPizzaList);
filterNav.appendChild(allergensFilterTitle);
filterNav.appendChild(divAllergens);

divRoot.id = "root";
nav.id = "nav";
filterNav.id = "filternav";
divAllergens.id = "allergensDiv";
displayOrderSelection.id = "modal";
displayOrderSelection.class = "modalClass";
divPizzaList.id = "pizzaList";

filterNav.style.width = divRoot.offsetWidth + "px";
filterNav.style.margin = "auto";

let pizzaOrderArray = [];
let countOrderPizza = {};

displayOrderSelection.innerHTML = `
  <div class="modal-content">
    <span class="close">&times;</span>
    <p id="textOrderDisplay"></p>
    <h3>Please review your order:</h3>
  </div>
`;
const orderDiv = document.querySelector(".modal-content");
const buttonCloseDisplay = document.querySelector(".close");

buttonCloseDisplay.addEventListener("click", () => {
  displayOrderSelection.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === displayOrderSelection) {
    displayOrderSelection.style.display = "none";
  }
});

buttonPlaceOrder = document.createElement("button");
orderDiv.appendChild(buttonPlaceOrder);
buttonPlaceOrder.innerText = "Place your order";

// const homeOption = document.createElement("a");
// const allergensOption = document.createElement("a");
// nav.appendChild(homeOption);
// nav.appendChild(allergensOption);
// homeOption.innerText = "Home";
// allergensOption.innerText = "Allergens filter";

function displayPizzaList(list) {
  divPizzaList.innerHTML = list
    .filter((pizza) =>
      pizza.allergens.every((id) => !document.querySelector(`#id${id}`).checked)
    )
    .map(
      (pizza) => `
    <div id="di${pizza.id}" class="pizza" data-id="${pizza.id}" data-name="${
        pizza.name
      }">
        <img src="/public/img/${pizza.name}.jpg" alt="${
        pizza.name
      }" class="img">
        <h3 class="pizzaName">${pizza.name}</h3>
        <p class="pizzaIngredients">${pizza.ingredients.join(" , ")}.</p>
        <p class="pizzaAllergens">Allergens inside this pizza: ${pizza.allergens
          .map((id) => document.querySelector(`#id${id}`).name)
          .join(" , ")}.</p>
        <label class="amount">amount</label>
        <input class="inputAmount" type="number">
        <h5 class="pizzaPrice">${pizza.price} Lei</h5>
        <button class="addToOrder">add to order</button>
    </div>
    `
    )
    .join("");
}

async function renderOrderForum() {
  const response = await fetch("http://127.0.0.1:9000/");
  if (response.status === 200) {
    const data = await response.text();
    document.body.innerHTML = data;
  } else {
    document.body.innerHTML = "There was a problem";
  }
  
}

async function writePizzaOrder() {
  const res = await fetch("http://127.0.0.1:9000/write/pizza/order", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pizzaOrderArray, null, 4),
  });

  const req = await res.json();
}

async function getPizzaList() {
  let req = await fetch("http://127.0.0.1:9000/api/pizza");
  let res = await req.json();
  let list = res;
  displayPizzaList(list);

  document.querySelectorAll(".pizza").forEach((el) => {
    let inputAmount = el.querySelector(".inputAmount");
    let buttonAddToOrder = el.querySelector(".addToOrder");

    let lineText;
    buttonAddToOrder.addEventListener("click", (e) => {
      if (inputAmount.value >= 0) {
        orderDiv.removeChild(buttonPlaceOrder);

        countOrderPizza[el.dataset.name]
          ? ((countOrderPizza[el.dataset.name] = +inputAmount.value),
            (lineText.innerText = `${el.dataset.name}: ${
              countOrderPizza[el.dataset.name]
            }`))
          : ((lineText = document.createElement("p")),
            orderDiv.appendChild(lineText),
            (countOrderPizza[el.dataset.name] = +inputAmount.value),
            (lineText.innerText = `${el.dataset.name}: ${
              countOrderPizza[el.dataset.name]
            } `));

        +inputAmount.value === 0
          ? (orderDiv.removeChild(
              orderDiv.childNodes[
                7 + Object.keys(countOrderPizza).indexOf(el.dataset.name)
              ]
            ),
            delete countOrderPizza[el.dataset.name])
          : null;

        pizzaOrderArray.includes({
          id: +el.dataset.id,
          amount: +inputAmount.value,
        })
          ? null
          : pizzaOrderArray.push({
              id: +el.dataset.id,
              amount: +inputAmount.value,
            });

        +inputAmount.value === 0
          ? (pizzaOrderArray = pizzaOrderArray.filter(
              (object) => object.id !== +el.dataset.id
            ))
          : null;

        buttonPlaceOrder = document.createElement("button");
        orderDiv.appendChild(buttonPlaceOrder);
        buttonPlaceOrder.innerText = "Place your order";

        buttonPlaceOrder.addEventListener("click", () => {
          writePizzaOrder();
          renderOrderForum();
        });

        Object.keys(countOrderPizza).length === 0
          ? (displayOrderSelection.style.display = "none")
          : (displayOrderSelection.style.display = "block");
      }
    });
  });
}

function displayAllergensOptions(list) {
  divAllergens.innerHTML = list
    .map(
      (allergen) => `
    <div class="inputDiv">
        <input class="input" type="checkbox" id="id${allergen.id}" name= "${allergen.name}" value="yes">
        <label for="${allergen.name}">${allergen.name}</label>
    </div>
    `
    )
    .join("");
  
}

async function getAllergensList() {
  let req = await fetch("http://127.0.0.1:9000/api/allergens");
  let res = await req.json();
  let list = res;
  displayAllergensOptions(list);
  await getPizzaList();

  document
    .querySelectorAll(".input")
    .forEach((input) => input.addEventListener("click", getPizzaList));
}
getAllergensList();
