// ==UserScript==
// @name        Alza convert
// @namespace   Mangelspec
// @description Converting alza.cz CZK prices to Euros.
// @match       https://www.alza.cz/*
// @match       http://www.alza.cz/*
// @version     3
// @grant       GM_xmlhttpRequest
// @connect     www.ecb.europa.eu
// @run-at      document-end
// @updateURL   https://raw.githubusercontent.com/MangelSpec/tampermonkey-scripts/main/alza-price-converter.user.js
// ==/UserScript==

var rate = 0.041; // hardcoded currency rate in case fetch fails
var selectors = [
  ".prices-accordion__item__value",
  ".priceInner > .npc > .np2",
  ".price-container__price-save",
  ".price-box__price",
  ".price-container__price",
  ".price-container__compare-price",
  ".price-box__price-text",
  "td.c5",
  "span.last.price",
  "td.price",
  "span.price-box__primary-price__value",
  "span.price-box__price-save-text",
  "label.lblAccessoriesPrice",
  "span.price-box__compare-price",
  "span.js-secondary-price",
  "span.accessoryGroupPrice",
  "div.colValue",
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
    if (
      (node.innerText.includes(",-") || node.innerText.includes("Kč")) &&
      !node.innerText.includes("€")
    ) {
      var price = parseInt(node.innerText.replace(/[^0-9.,]/g, ""));
      if (!isNaN(price)) {
        var price_eur = price * rate;
        node.innerText = parseFloat(price_eur).toFixed(2) + "€";
      }
    }
  });
}

(function () {
  "use strict";
  // Use MutationObserver to handle dynamically loaded content
  var observer = new MutationObserver(function () {
    convertPrices();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial conversion
  convertPrices();
})();
