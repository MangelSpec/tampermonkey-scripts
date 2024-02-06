// ==UserScript==
// @name        Rohlik convert
// @namespace   Mangelspec
// @description Converting rohlik.cz CZK prices to Euros.
// @match       https://www.rohlik.cz/*
// @match       http://www.rohlik.cz/*
// @version     2
// @grant       GM_xmlhttpRequest
// @connect     www.ecb.europa.eu
// @run-at      document-end
// @updateURL   https://raw.githubusercontent.com/MangelSpec/tampermonkey-scripts/main/rohlik-price-converter.user.js
// ==/UserScript==

var rate = 0.041; // hardcoded currency rate in case fetch fails
// Updated selectors to include all targeted elements
var selectors = [
  '[data-test="product-price"]',
  '[data-test="product-in-sale-original"]',
  '[data-test="whisperer-product-price"]',
  '[data-test="actual-price"]',
  'span.oldPrice[data-test="original-price"] del',
];

// Fetch exchange rate from ecb.europa.eu
GM_xmlhttpRequest({
  method: "GET",
  url: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml",
  onload: processXML_Response,
  onabort: reportAJAX_Error,
  onerror: reportAJAX_Error,
  ontimeout: reportAJAX_Error,
});

function processXML_Response(response) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(response.responseText, "text/xml");
  var rateNode = xmlDoc.querySelector('Cube[currency="CZK"]');
  if (rateNode) {
    rate = 1 / parseFloat(rateNode.getAttribute("rate"));
    convertPrices();
  } else {
    reportAJAX_Error(response);
  }
}

function reportAJAX_Error(response) {
  console.error(
    `TM script => Error ${response.status}!  ${response.statusText}`
  );
}

function convertPrices() {
  var allPrices = document.querySelectorAll(selectors.join(","));
  allPrices.forEach((node) => {
    var priceText = node.innerText;
    // This regex now specifically looks for the format "CZK 64.90" or similar.
    var matches = priceText.match(/CZK\s*([0-9.,]+)/);
    if (matches && matches[1]) {
      var price = parseFloat(matches[1].replace(",", "."));
      if (!isNaN(price)) {
        var price_eur = price * rate;
        node.innerText = `${parseFloat(price_eur).toFixed(2)}€`;
      }
    }
  });

  const currencySymbols = document.querySelectorAll(
    'span.price[data-test="currency"]'
  );
  currencySymbols.forEach((symbol) => {
    if (symbol.innerText.includes("CZK")) {
      // Check if not already converted
      symbol.innerText = symbol.innerText.replace("CZK", "€");
    }
  });
}

function convertComplexPrices() {
  document
    .querySelectorAll(
      ".biggerPrice.cardPrice .wrap, .biggerPrice.priceOffer .wrap"
    )
    .forEach((wrap) => {
      // Skip this element if it has already been processed
      if (wrap.getAttribute("data-converted") === "true") {
        return;
      }

      // Extract and convert the main price and fraction
      const mainPriceElement = wrap.querySelector(
        'span.price:not([data-test="currency"])'
      );
      const fractionElement = wrap.querySelector("sup.fraction");
      if (mainPriceElement && fractionElement) {
        // Combine main price and fraction for conversion
        const fullPriceCZK = parseFloat(
          `${mainPriceElement.innerText}.${fractionElement.innerText}`
        );
        if (!isNaN(fullPriceCZK)) {
          const fullPriceEUR = fullPriceCZK * rate; // Convert to EUR
          const [mainPriceEUR, fractionEUR] = fullPriceEUR
            .toFixed(2)
            .split(".");

          // Update the elements with the converted price
          mainPriceElement.innerText = mainPriceEUR;
          fractionElement.innerText = fractionEUR;

          // Mark this wrap element as converted to prevent future re-processing
          wrap.setAttribute("data-converted", "true");
        }
      }
    });
}

function convertPricesWithUnits() {
  document
    .querySelectorAll('.priceOffer, [data-test="product-price-per-unit"]')
    .forEach((priceElement) => {
      // Extract price and unit
      const priceText = priceElement.innerText;
      const matches = priceText.match(/CZK\s*([0-9.,]+)\s*\/(\w+)/);

      if (matches && matches[1] && matches[2]) {
        const priceCZK = parseFloat(matches[1].replace(",", "."));
        const unit = matches[2]; // e.g., "kg" or "pc"

        if (!isNaN(priceCZK)) {
          const priceEUR = priceCZK * rate; // Convert to EUR using the global 'rate'
          // Update the priceElement with the converted price and original unit
          priceElement.innerText = `€ ${priceEUR.toFixed(2)} /${unit}`;
        }
      }
    });
}

function throttle(callback, delay) {
  let timeoutId = null;

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(...args);
      timeoutId = null;
    }, delay);
  };
}

// Define a throttled version of your conversion function
const throttledConvertion = throttle(() => {
  convertPrices();
  convertComplexPrices();
  convertPricesWithUnits();
}, 250); // Adjust the delay as needed, e.g., 1000 milliseconds (1 second)

(function () {
  "use strict";
  // Use MutationObserver to handle dynamically loaded content
  var observer = new MutationObserver(function () {
    throttledConvertion();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial conversion
  convertPrices();
  convertCurrencyComplex();
  convertPricesWithUnits();
})();
