// ==UserScript==
// @name        Alza convert
// @namespace   Mangelspec
// @description Converting alza.cz CZK prices to Euros.
// @match       https://www.alza.cz/*
// @match       http://www.alza.cz/*
// @version     4
// @grant       GM_xmlhttpRequest
// @connect     www.ecb.europa.eu
// @run-at      document-end
// @downloadURL https://raw.githubusercontent.com/MangelSpec/tampermonkey-scripts/main/alza-price-converter.user.js
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
  "[class*='detailVariants-alz-']",
  ".price",
  "[class*='descriptionTab-alz-']",
  "[class*='commodityHooks-alz-']",
  ".text-basic-neutral-700",
  ".text-basic-red-500",
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
    `TM script => Error ${response.status}!  ${response.statusText}`,
  );
}

function convertTextNode(textNode) {
  if (textNode.textContent.includes("€")) return;
  var match = textNode.textContent.match(/(\d[\d\s,.]*),\s*-/);
  if (!match) return;
  var price = parseInt(match[1].replace(/[^0-9]/g, ""));
  if (!isNaN(price) && price > 0) {
    var price_eur = (price * rate).toFixed(2);
    textNode.textContent = textNode.textContent.replace(
      /(\d[\d\s,.]*),\s*-/,
      price_eur + "€",
    );
  }
}

function convertPrices() {
  var allPrices = document.querySelectorAll(selectors.join(","));
  allPrices.forEach((node) => {
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    var textNode;
    while ((textNode = walker.nextNode())) {
      convertTextNode(textNode);
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
