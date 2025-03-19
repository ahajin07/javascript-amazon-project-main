import { cart, removeFromCart, updatedeliveryOptionsID } from '../../data/cart.js';
import { products } from '../../data/products.js';
import { formatCurrency } from '.././utils/money.js';  
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { deliveryOptions } from '../../data/deliveryOptions.js';

export function generateCartSummary() {
  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;

    let matchingProduct;
    products.forEach((product) => {
      if (product.id === productId) {
        matchingProduct = product;
      }
    });

    if (!matchingProduct) {
      return;
    }

    // Set default delivery option if none exists
    if (!cartItem.deliveryOptionsId) {
      cartItem.deliveryOptionsId = '1';
    }

    let matchingDeliveryOption;
    deliveryOptions.forEach((option) => {
      if (option.id === cartItem.deliveryOptionsId) {
        matchingDeliveryOption = option;
      }
    });

    const today = dayjs();
    const deliveryDate = today.add(matchingDeliveryOption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');

    cartSummaryHTML += `
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
              <span class="update-quantity-link js-update-link" data-product-id="${matchingProduct.id}">
                Update
              </span>
              <span class="delete-quantity-link js-delete-link" data-product-id="${matchingProduct.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${deliveryOptions.map((option) => {
              const isChecked = option.id === cartItem.deliveryOptionsId;
              const priceString = option.priceCents === 0 
                ? 'FREE'
                : `$${formatCurrency(option.priceCents)} -`;
              
              return `
                <div class="delivery-option js-delivery-option" 
                  data-product-id="${matchingProduct.id}"
                  data-delivery-option-id="${option.id}">
                  <input type="radio"
                    ${isChecked ? 'checked' : ''}
                    class="delivery-option-input"
                    name="delivery-option-${matchingProduct.id}">
                  <div>
                    <div class="delivery-option-date">
                      ${today.add(option.deliveryDays, 'days').format('dddd, MMMM D')}
                    </div>
                    <div class="delivery-option-price">
                      ${priceString} Shipping
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  });

  document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

  // Delete button functionality
  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      removeFromCart(productId);
      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      container.remove();
    });
  });

  // Delivery option functionality
  document.querySelectorAll('.js-delivery-option').forEach((element) => {
    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset;
      updatedeliveryOptionsID(productId, deliveryOptionId);
      
      // Update the delivery date display
      const option = deliveryOptions.find(option => option.id === deliveryOptionId);
      const today = dayjs();
      const newDate = today.add(option.deliveryDays, 'days');
      const dateString = newDate.format('dddd, MMMM D');
      
      document.querySelector(`.js-delivery-date-${productId}`).innerHTML = 
        `Delivery date: ${dateString}`;
    });
  });
}

// Call the function to generate the cart summary initially
