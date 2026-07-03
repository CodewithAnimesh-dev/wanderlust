(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false);
  });
})();

// ==========================
// Tax Toggle
// ==========================

let taxSwitch = document.querySelector("#tax-switch");

if (taxSwitch) {
    taxSwitch.addEventListener("change", () => {

        let prices = document.querySelectorAll(".price");

        for (let price of prices) {

            if (taxSwitch.checked) {

                let originalPrice = Number(price.getAttribute("data-price"));
                let totalPrice = Math.round(originalPrice * 1.18);

                price.innerHTML = `₹ ${totalPrice.toLocaleString("en-IN")} <small>After Taxes</small>`;

            } else {

                let originalPrice = Number(price.getAttribute("data-price"));

                price.innerHTML = `₹ ${originalPrice.toLocaleString("en-IN")}`;

            }
        }

    });
}