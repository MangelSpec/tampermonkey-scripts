# Price Converter for Rohlik.cz and Alza.cz

These Tampermonkey scripts convert prices on the [Rohlik.cz](https://www.rohlik.cz) and [Alza.cz](https://www.alza.cz) websites from CZK to Euros. The script dynamically updates prices for individual products as well as the total basket price.

## Installation

To use this script, you'll need to have the Tampermonkey extension installed in your browser. Tampermonkey is available for various browsers:

- [Chrome](https://tampermonkey.net/?ext=dhdg&browser=chrome)
- [Firefox](https://tampermonkey.net/?ext=dhdg&browser=firefox)
- [Safari](https://tampermonkey.net/?ext=dhdg&browser=safari)
- [Microsoft Edge](https://tampermonkey.net/?ext=dhdg&browser=edge)
- [Opera](https://tampermonkey.net/?ext=dhdg&browser=opera)

### Steps to Install the Script

1. **Install Tampermonkey:**
   - Visit the [Tampermonkey website](https://tampermonkey.net/) and install the extension for your browser.

2. **Add the Script to Tampermonkey:**
   - Open the [alza-price.converter.user.js](https://github.com/MangelSpec/tampermonkey-scripts/blob/main/alza-price-converter.user.js) and [rohlik-price.converter.user.js](https://github.com/MangelSpec/tampermonkey-scripts/blob/main/rohlik-price-converter.user.js) files on GitHub.
   - Click the `Raw` button to view the raw script.
   - Tampermonkey should prompt you to install the script. Confirm the installation.

3. **Activate the Script:**
   - Ensure the script is activated by checking that the toggle switch next to the script name is turned on (should be green).

## Features

- Converts individual product prices from CZK to Euros on Rohlik.cz and Alza.cz.
- Converts unit prices (e.g., price per kg, price per liter) on both websites.
- Converts the total basket price from CZK to Euros on both websites.
- Automatically updates prices as you browse the websites.

## How It Works

- The script fetches the latest CZK to EUR exchange rate from the [European Central Bank](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml).
- Prices displayed on the Rohlik.cz and Alza.cz websites are automatically converted to Euros.
- The conversion rate is hardcoded as a fallback in case the exchange rate fetch fails.

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

## Disclaimer

This script is provided "as is", without warranty of any kind. Use it at your own risk. The author is not responsible for any damage or issues that may arise from using this script.

## Acknowledgements

This script uses data from the [European Central Bank](https://www.ecb.europa.eu/). 
