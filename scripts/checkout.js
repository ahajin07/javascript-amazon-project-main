import { cart, removeFromCart } from '../data/cart.js';
import { products } from '../data/products.js';
import { formatCurrency } from './utils/money.js';  
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { deliveryOptions } from '../data/deliveryOptions.js';

let cartSummaryHTML = '';
cart.forEach((cartItem) => {
  const productId = cartItem.productId;

  let matchingProduct;

  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });

  const deliveryOptionsId = cartItem.deliveryOptionsId;

  let matchingDeliveryOption;

  deliveryOptions.forEach((option) => {
    if (option.id === deliveryOptionsId) {
      matchingDeliveryOption = option;
    }
  });

  const today = dayjs();
  const deliveryDate = today.add(matchingDeliveryOption.deliveryDays, 'days');
  const dateString = deliveryDate.format('dddd, MMMM D');

  cartSummaryHTML +=
    `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date js-delivery-date-${matchingProduct.id}">
        Delivery date: ${dateString}
      </div>

      <div class="cart-item-details-grid">
        <img class="product-image" src="${matchingProduct.image}">

        <div class="cart-item-details">
          <div class="product-name">
            ${matchingProduct.name}
          </div>
          <div class="product-price">
            $${formatCurrency(matchingProduct.priceCents)}
          </div>
          <div class="product-quantity">
            <span>
              Quantity: <span class="quantity-label">${cartItem.quantity}</span>
            </span>
            <span class="update-quantity-link link-primary">
              Update
            </span>
            <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
              Delete
            </span>
          </div>
        </div>

        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>

          ${deliveryOptionsHTML(matchingProduct, cartItem)}
        </div>
      </div>
    </div>
    `;
});

function deliveryOptionsHTML(matchingProduct, cartItem) {
  let html = '';

  deliveryOptions.forEach((option) => {
    const today = dayjs();
    const deliveryDate = today.add(option.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');
    const priceString = option.priceCents === 0 
      ? 'Free'
      : `$${formatCurrency(option.priceCents)} -`;

    const isChecked = option.id === cartItem.deliveryOptionsId;
    html +=
      `
      <div class="delivery-option">
        <input type="radio"
          ${isChecked ? 'checked' : ''}
          class="delivery-option-input"
          name="delivery-option-${matchingProduct.id}"
          data-product-id="${matchingProduct.id}"
          data-delivery-days="${option.deliveryDays}">
        <div>
          <div class="delivery-option-date">
            ${dateString}
          </div>
          <div class="delivery-option-price">
            ${priceString} Shipping
          </div>
        </div>
      </div> 
      `;
  });
  return html;
}

document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

document.querySelectorAll('.js-delete-link').forEach((link) => {
  link.addEventListener('click', () => {
    const productId = link.dataset.productId;
    removeFromCart(productId);
    const container = document.querySelector(`.js-cart-item-container-${productId}`);
    container.remove();
  });
});

document.querySelectorAll('.delivery-option-input').forEach((input) => {
  input.addEventListener('change', (event) => {
    const productId = event.target.dataset.productId;
    const deliveryDays = event.target.dataset.deliveryDays;
    const today = dayjs();
    const newDeliveryDate = today.add(deliveryDays, 'days');
    const newDateString = newDeliveryDate.format('dddd, MMMM D');
    const deliveryDateElement = document.querySelector(`.js-delivery-date-${productId}`);
    deliveryDateElement.textContent = `Delivery date: ${newDateString}`;
  });
});
