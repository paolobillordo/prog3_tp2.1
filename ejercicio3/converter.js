class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }

    set code(new_code) {
        this._code = new_code;
    }
    
    set name(new_name) {
        this._name = new_name
    }

    get code() {
        return this._code;
    }

    get name() {
        return this._name;
    }

}

class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies = []
    }

    addCurrency(currency) {
        this.currencies.push(currency);
    }

    set apiUrl(apiUrl) {
        this._apiUrl = apiUrl;
    }

    get apiUrl() {
        return this._apiUrl;
    }

    async getCurrencies() {
        try {            
            const response = await fetch(this.apiUrl + "/currencies");
            if (response.ok) {
                const coins = await response.json();
                console.log(coins)
                Object.entries(coins).forEach(([key, value]) => {
                    let new_currency = new Currency (key,value)
                    this.addCurrency(new_currency)
                })
            };
            
        } catch (error) {
            console.error(`Ocurrio un error: ${error.message}`);            
        }

    }

    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency == toCurrency) {
            return parseFloat(amount)
        }
        try {
            console.log(fromCurrency, toCurrency)
            const response = await fetch(this.apiUrl + `/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`);
            if (response.ok) {
                const amount_converted = await response.json();                
                return amount_converted.rates[toCurrency.code]                
            };
        } catch (error) {
            console.error(`Ocurrio un error: ${error.message}`);
            return null;
        }

    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
