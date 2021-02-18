// Variables
let quantity = document.querySelectorAll(".quantity");
const modal = document.querySelector(".modal");
const menu = document.querySelector(".fa-bars");
let TScart = [];
const url = "https://online-shop-424e1-default-rtdb.europe-west1.firebasedatabase.app/";
let list = []; 


// AJAX function
async function ajax(url, method, body) {
      const res = await fetch(url + ".json", {
          method: method,
          body: JSON.stringify(body),
          headers: {'Content-Type': 'application/json'}
      });
      return await res.json();
}



// get list from database to calculate the remaining quantity on items
async function getList() {
      list = await ajax(url);
      if (localStorage.getItem("TScart") === null) {
            TScart = [];
      } else {
            TScart = JSON.parse(localStorage.getItem("TScart"));
      }
      buildCart();
}



// Build html with information from local storage
function buildCart() {
      let qty = 0;
      if (TScart.length === 0) {
            var totalPrice = 0;
      } else {
            var totalPrice = 15;
      }
      if (TScart.length > 0) {
            for (let i = 0; i < TScart.length; i++) {
                  qty += Number(TScart[i].quantity);
            }
      } else {
            qty = 0;
      }
      TScart = JSON.parse(localStorage.getItem("TScart"));
      let str = "";
      for (let i = 0; i < TScart.length; i++) {
            totalPrice += TScart[i].product.price * TScart[i].quantity;
            str += `
                  <tr>
                        <td><a href="details.html?index=${TScart[i].product.name}" class="link-item">${TScart[i].product.name}</a></td>
                        <td><span class="price">${TScart[i].product.price.toLocaleString('ro')}</span>&nbsp;RON</td>
                        <td class="quantity-wrapper">
                              <p class="increase" onclick="increase('${i}');"><i class="fas fa-plus"></i></p>
                              <input type="number" class="quantity" onfocus="calculate('${i}');" oninput="calculate('${i}');" value="${TScart[i].quantity}" min="1"/>
                              <p class="decrease" onclick="decrease('${i}');"><i class="fas fa-minus"></i></p>
                        </td>
                        <td class="remove-btn" onclick="removeItem('${i}');">Remove</td>
                  </tr>
            `
      }
      
      document.querySelector("tbody").innerHTML = str;
      document.querySelector(".total-items").innerText = qty;
      document.querySelector(".total-price").innerText = totalPrice.toLocaleString('ro');
}
   


// Calculate total items in the cart when changing quantity
function calculate(idx) {
      let cart = window.localStorage.getItem("TScart");
      document.querySelector(".total-items").innerText = parseInt(document.querySelectorAll(".quantity")[idx].value);
      if (cart !== null) {
            let TScart = JSON.parse(cart);
            TScart[idx].quantity = document.querySelectorAll(".quantity")[idx].value;
            window.localStorage.setItem('TScart', JSON.stringify(TScart));
      }
      buildCart();
}



// Delete item from cart (local storage)
function removeItem(idx) {
      TScart.splice(idx, 1);
      localStorage.setItem("TScart", JSON.stringify(TScart));
      buildCart();
}




// Buy button and change quantity in database after buying
async function buy() {
      if (TScart.length === 0) {
            return;
      }
      let index = [];
      let lsName = "";
      let newStock = "";
      for (let i = 0; i < TScart.length; i++) {
            lsName = TScart[i].product.name;
            index = list.findIndex(x => x.name == lsName);
            newStock = list[index].stock - TScart[i].quantity;
            await ajax(url + index, "PATCH", {
                  "stock": Number(newStock)
            });
      }
      window.localStorage.removeItem('TScart');
      let loader = document.querySelector(".lds-ring");
      loader.style.display = "inline-block";
      setTimeout(() => {
            document.querySelector(".message").style.display = "flex";
            loader.style.display = "none";
      }, 1000);
}




// popup button after buying that redirects user to main page
function confirmBuy() {
      window.location.href = "main.html";
}



// Increase quantity in html and in local storage and dont increase more than max quantity of the item
function increase(idx) {
      let itemName = document.querySelectorAll(".link-item")[idx].innerText;
      let index = list.findIndex(x => x.name == itemName);
      console.log(index);
      if (document.querySelectorAll(".quantity")[idx].value >= list[index].stock) {
            return;
      }
      document.querySelectorAll(".quantity")[idx].value = parseInt(document.querySelectorAll(".quantity")[idx].value) + 1;
      document.querySelectorAll(".quantity")[idx].addEventListener('input', calculate(idx));
      buildCart();
}


// Decrease quantity in html and local storage and dont decrease below 1
function decrease(idx) {
      if (document.querySelectorAll(".quantity")[idx].value <= 1) {
            return;
      }
      document.querySelectorAll(".quantity")[idx].value = parseInt(document.querySelectorAll(".quantity")[idx].value) - 1;
      document.querySelectorAll(".quantity")[idx].addEventListener('input', calculate(idx));
      buildCart();
}




// Opens menu on clicking hamburger menu
function showMenu() {
      modal.style.display = "block";
      menu.style.display = "none";
}



// Hide the modal and closes the menu when clicking on modal
modal.addEventListener('click', (event) => {
      if (event.target.classList.contains("modal")) {
            modal.style.display = "none";
            menu.style.display = "none";
      }
});