// --- Utility Function for common input handling ---
/**
 * Parses a float from an input element, validates it, and displays an error message.
 * @param {HTMLInputElement} inputElement - The input element.
 * @param {HTMLElement} messageElement - The element to display error messages.
 * @param {string} fieldName - The name of the field for error messages (e.g., "MRP").
 * @returns {number|null} The parsed float value, or null if invalid.
 */
function getValidatedFloatInput(inputElement, messageElement, fieldName) {
    if (messageElement) { // Check if messageElement exists before trying to clear
        messageElement.textContent = ''; // Clear previous messages
    }
    const value = parseFloat(inputElement.value);

    if (inputElement.value.trim() === '') {
        return null; // Treat empty as no input, not an error for initial state
    }
    if (isNaN(value)) {
        if (messageElement) {
            messageElement.textContent = `Invalid ${fieldName} value. Please enter a number.`;
        }
        return NaN; // Indicate a parsing error
    }
    if (value < 0) {
        if (messageElement) {
            messageElement.textContent = `${fieldName} cannot be negative.`;
        }
        return NaN; // Indicate a validation error
    }
    return value;
}

/**
 * Parses an integer from an input element, validates it, and displays an error message.
 * @param {HTMLInputElement} inputElement - The input element.
 * @param {HTMLElement} messageElement - The element to display error messages.
 * @param {string} fieldName - The name of the field for error messages (e.g., "Pieces").
 * @returns {number|null} The parsed integer value, or null if invalid.
 */
function getValidatedIntInput(inputElement, messageElement, fieldName) {
    if (messageElement) { // Check if messageElement exists before trying to clear
        messageElement.textContent = ''; // Clear previous messages
    }
    const value = parseInt(inputElement.value);

    if (inputElement.value.trim() === '') {
        return null; // Treat empty as no input, not an error for initial state
    }
    if (isNaN(value)) {
        if (messageElement) {
            messageElement.textContent = `Invalid ${fieldName} value. Please enter a whole number.`;
        }
        return NaN; // Indicate a parsing error
    }
    if (value < 0) {
        if (messageElement) {
            messageElement.textContent = `${fieldName} cannot be negative.`;
        }
        return NaN; // Indicate a validation error
    }
    return value;
}

/**
 * Formats a number as Indian Rupees with 2 decimal places.
 * @param {number} amount - The number to format.
 * @returns {string} The formatted string (e.g., "₹1,234.56").
 */
function formatIndianRupees(amount) {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// --- Toast Notification Functions ---
const toastNotificationEl = document.getElementById('toastNotification');

/**
 * Displays a temporary toast notification with the given message.
 * @param {string} message - The message to display in the toast.
 */
function showToast(message) {
    if (!toastNotificationEl) {
        console.error('Toast notification element not found!');
        return;
    }
    toastNotificationEl.textContent = message;
    toastNotificationEl.classList.add('show');

    // Hide the toast after 3 seconds
    setTimeout(() => {
        toastNotificationEl.classList.remove('show');
    }, 3000);
}


// --- Indian Cash Counter ---
const cashCounterDiv = document.querySelector('#cashCounter .denomination-grid');
const cashTotalAmountEl = document.getElementById('cashTotalAmount');
const cashDifferenceEl = document.getElementById('cashDifference');
const expectedCashInput = document.getElementById('expectedCash');
const resetCashCounterBtn = document.getElementById('resetCashCounter');

// Denominations in ascending order, excluding 1000 and 2000
const denominations = [1, 2, 5, 10, 20, 50, 100, 200, 500];
let denominationInputs = []; // Stores references to the dynamically created input elements

function initializeCashCounter() {
    cashCounterDiv.innerHTML = ''; // Clear existing inputs to prevent duplicates on re-init
    denominationInputs = []; // Reset the array

    denominations.forEach(denom => {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('denomination-input-wrapper');

        const label = document.createElement('label');
        label.setAttribute('for', `denom-${denom}`);
        label.classList.add('font-medium', 'text-gray-700');
        label.textContent = `₹${denom} x `;

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `denom-${denom}`;
        input.min = '0';
        // Add `input-field` class to ensure consistent styling
        input.classList.add('input-field', 'text-center');
        input.dataset.value = denom; // Store the denomination value in a data attribute
        input.placeholder = "0";
        input.addEventListener('input', calculateCashAndDifference);

        denominationInputs.push(input);
        wrapperDiv.appendChild(label);
        wrapperDiv.appendChild(input);
        cashCounterDiv.appendChild(wrapperDiv);
    });
    calculateCashAndDifference(); // Calculate initial total
}

function calculateCashTotal() {
    let total = 0;
    denominationInputs.forEach(input => {
        const count = parseInt(input.value) || 0; // Use 0 if input is empty or invalid
        const denominationValue = parseInt(input.dataset.value); // Retrieve denomination from data attribute
        if (count >= 0) { // Ensure count is not negative
            total += count * denominationValue;
        }
    });
    return total;
}

function calculateCashAndDifference() {
    const totalCash = calculateCashTotal();
    cashTotalAmountEl.textContent = formatIndianRupees(totalCash);

    const expectedCash = getValidatedFloatInput(expectedCashInput, null, 'Expected Cash'); 
    
    if (expectedCash === null || isNaN(expectedCash)) {
        cashDifferenceEl.textContent = formatIndianRupees(0);
    } else {
        const difference = totalCash - expectedCash;
        cashDifferenceEl.textContent = formatIndianRupees(difference);
        // Optionally, add styling based on difference (e.g., red for negative, green for positive)
        cashDifferenceEl.classList.remove('profit-positive', 'profit-negative');
        if (difference > 0) {
            cashDifferenceEl.classList.add('profit-positive');
        } else if (difference < 0) {
            cashDifferenceEl.classList.add('profit-negative');
        }
    }
}


resetCashCounterBtn.addEventListener('click', () => {
    denominationInputs.forEach(input => input.value = ''); // Clear all input values
    document.getElementById('customerName').value = ''; // Clear customer name
    document.getElementById('accountNumber').value = ''; // Clear account number
    expectedCashInput.value = ''; // Clear expected cash
    calculateCashAndDifference(); // Recalculate total and difference after clearing
});

expectedCashInput.addEventListener('input', calculateCashAndDifference);


// --- Unit Price Calculator ---
const mrpBoxInput = document.getElementById('mrpBox');
const piecesInBoxInput = document.getElementById('piecesInBox');
const pricePerPieceEl = document.getElementById('pricePerPiece');
const unitPriceMessageEl = document.getElementById('unitPriceMessage');
const resetUnitPriceCalcBtn = document.getElementById('resetUnitPriceCalc');

function calculatePricePerPiece() {
    unitPriceMessageEl.textContent = ''; // Clear message on input
    const mrpBox = getValidatedFloatInput(mrpBoxInput, unitPriceMessageEl, 'MRP of Box');
    const piecesInBox = getValidatedIntInput(piecesInBoxInput, unitPriceMessageEl, 'Number of Units'); 

    // If any input is invalid (NaN) or empty (null), reset display and return
    if (mrpBox === null || piecesInBox === null || isNaN(mrpBox) || isNaN(piecesInBox)) {
        pricePerPieceEl.textContent = formatIndianRupees(0);
        return;
    }

    if (piecesInBox === 0) {
        pricePerPieceEl.textContent = formatIndianRupees(0);
        unitPriceMessageEl.textContent = 'Number of units cannot be zero.'; 
        return;
    }

    const price = mrpBox / piecesInBox;
    pricePerPieceEl.textContent = formatIndianRupees(price);
}

mrpBoxInput.addEventListener('input', calculatePricePerPiece);
piecesInBoxInput.addEventListener('input', calculatePricePerPiece);
resetUnitPriceCalcBtn.addEventListener('click', () => {
    mrpBoxInput.value = '';
    piecesInBoxInput.value = '';
    calculatePricePerPiece(); // Recalculate to reset display and clear messages
});

// --- Total Box Profit Calculator ---
const sellingPricePerPcInput = document.getElementById('sellingPricePerPc');
const costOfBoxInput = document.getElementById('costOfBox');
const piecesInBoxProfitInput = document.getElementById('piecesInBoxProfit');
const totalBoxProfitEl = document.getElementById('totalBoxProfit');
const boxProfitMessageEl = document.getElementById('boxProfitMessage');
const resetBoxProfitCalcBtn = document.getElementById('resetBoxProfitCalc');

function calculateBoxProfit() {
    boxProfitMessageEl.textContent = ''; // Clear message on input
    const sellingPricePerPc = getValidatedFloatInput(sellingPricePerPcInput, boxProfitMessageEl, 'Selling Price Per Piece');
    const costOfBox = getValidatedFloatInput(costOfBoxInput, boxProfitMessageEl, 'Cost of Box');
    const piecesInBoxProfit = getValidatedIntInput(piecesInBoxProfitInput, boxProfitMessageEl, 'Number of Pieces in Box');

    totalBoxProfitEl.classList.remove('profit-positive', 'profit-negative'); // Reset classes

    // If any input is invalid (NaN) or empty (null), reset display and return
    if (sellingPricePerPc === null || costOfBox === null || piecesInBoxProfit === null ||
        isNaN(sellingPricePerPc) || isNaN(costOfBox) || isNaN(piecesInBoxProfit)) {
        totalBoxProfitEl.textContent = formatIndianRupees(0);
        return;
    }

    const totalRevenue = sellingPricePerPc * piecesInBoxProfit;
    const totalProfit = totalRevenue - costOfBox;

    totalBoxProfitEl.textContent = formatIndianRupees(totalProfit);
    // Apply profit/loss specific classes
    if (totalProfit >= 0) {
        totalBoxProfitEl.classList.add('profit-positive');
    } else {
        totalBoxProfitEl.classList.add('profit-negative');
    }
}

sellingPricePerPcInput.addEventListener('input', calculateBoxProfit);
costOfBoxInput.addEventListener('input', calculateBoxProfit);
piecesInBoxProfitInput.addEventListener('input', calculateBoxProfit);
resetBoxProfitCalcBtn.addEventListener('click', () => {
    sellingPricePerPcInput.value = '';
    costOfBoxInput.value = '';
    piecesInBoxProfitInput.value = '';
    calculateBoxProfit(); // Recalculate to reset display and clear messages
});

// --- Margin Calculator ---
const costPriceMarginInput = document.getElementById('costPriceMargin');
const sellingPriceMarginInput = document.getElementById('sellingPriceMargin');
const grossProfitAmountEl = document.getElementById('grossProfitAmount');
const grossMarginPercentageEl = document.getElementById('grossMarginPercentage');
const marginMessageEl = document.getElementById('marginMessage');
const resetMarginCalcBtn = document.getElementById('resetMarginCalc');

function calculateMargin() {
    marginMessageEl.textContent = ''; // Clear message on input
    const costPrice = getValidatedFloatInput(costPriceMarginInput, marginMessageEl, 'Cost Price');
    const sellingPrice = getValidatedFloatInput(sellingPriceMarginInput, marginMessageEl, 'Selling Price');

    if (costPrice === null || sellingPrice === null || isNaN(costPrice) || isNaN(sellingPrice)) {
        grossProfitAmountEl.textContent = formatIndianRupees(0);
        grossMarginPercentageEl.textContent = '0.00%';
        return;
    }

    if (sellingPrice < costPrice) {
        marginMessageEl.textContent = 'Selling price cannot be less than cost price for positive margin.';
    }

    const grossProfit = sellingPrice - costPrice;
    const grossMarginPercentage = (sellingPrice > 0) ? (grossProfit / sellingPrice) * 100 : 0;

    grossProfitAmountEl.textContent = formatIndianRupees(grossProfit);
    grossMarginPercentageEl.textContent = `${grossMarginPercentage.toFixed(2)}%`;
}

costPriceMarginInput.addEventListener('input', calculateMargin);
sellingPriceMarginInput.addEventListener('input', calculateMargin);
resetMarginCalcBtn.addEventListener('click', () => {
    costPriceMarginInput.value = '';
    sellingPriceMarginInput.value = '';
    calculateMargin();
});

// --- GST Calculator ---
const basePriceGSTInput = document.getElementById('basePriceGST');
const gstRateInput = document.getElementById('gstRate');
const gstAmountEl = document.getElementById('gstAmount');
const totalPriceWithGSTEl = document.getElementById('totalPriceWithGST');
const gstMessageEl = document.getElementById('gstMessage');
const resetGSTCalcBtn = document.getElementById('resetGSTCalc');

function calculateGST() {
    gstMessageEl.textContent = ''; // Clear message on input
    const basePrice = getValidatedFloatInput(basePriceGSTInput, gstMessageEl, 'Base Price');
    const gstRate = getValidatedFloatInput(gstRateInput, gstMessageEl, 'GST Rate');

    if (basePrice === null || gstRate === null || isNaN(basePrice) || isNaN(gstRate)) {
        gstAmountEl.textContent = formatIndianRupees(0);
        totalPriceWithGSTEl.textContent = formatIndianRupees(0);
        return;
    }

    const gstAmount = basePrice * (gstRate / 100);
    const totalPrice = basePrice + gstAmount;

    gstAmountEl.textContent = formatIndianRupees(gstAmount);
    totalPriceWithGSTEl.textContent = formatIndianRupees(totalPrice);
}

basePriceGSTInput.addEventListener('input', calculateGST);
gstRateInput.addEventListener('input', calculateGST);
resetGSTCalcBtn.addEventListener('click', () => {
    basePriceGSTInput.value = '';
    gstRateInput.value = '';
    calculateGST();
});

// --- Discount Calculator ---
const mrpInput = document.getElementById('mrp');
const salePriceInput = document = document.getElementById('salePrice');
const discountAmountEl = document.getElementById('discountAmount');
const discountPercentageEl = document.getElementById('discountPercentage');
const discountMessageEl = document = document.getElementById('discountMessage');
const resetDiscountCalcBtn = document.getElementById('resetDiscountCalc');

function calculateDiscount() {
    discountMessageEl.textContent = ''; // Clear message on input
    const mrp = getValidatedFloatInput(mrpInput, discountMessageEl, 'MRP');
    const salePrice = getValidatedFloatInput(salePriceInput, discountMessageEl, 'Sale Price');

    // If any input is invalid (NaN) or empty (null), reset display and return
    if (mrp === null || salePrice === null || isNaN(mrp) || isNaN(salePrice)) {
        discountAmountEl.textContent = 'Discount Amount: ₹0.00';
        discountPercentageEl.textContent = 'Discount Percentage: 0.00%';
        return;
    }

    if (salePrice > mrp) {
        discountAmountEl.textContent = 'Discount Amount: ₹0.00';
        discountPercentageEl.textContent = 'Discount Percentage: 0.00%';
        discountMessageEl.textContent = 'Sale price cannot be greater than MRP.';
        return;
    }

    const discountAmount = mrp - salePrice;
    const discountPercentage = (mrp > 0) ? (discountAmount / mrp) * 100 : 0;

    discountAmountEl.textContent = `Discount Amount: ${formatIndianRupees(discountAmount)}`;
    discountPercentageEl.textContent = `Discount Percentage: ${discountPercentage.toFixed(2)}%`;
}

mrpInput.addEventListener('input', calculateDiscount);
salePriceInput.addEventListener('input', calculateDiscount);
resetDiscountCalcBtn.addEventListener('click', () => {
    mrpInput.value = '';
    salePriceInput.value = '';
    calculateDiscount(); // Recalculate to reset display and clear messages
});

// --- Price-Based Weight Calculator ---
const pulsePricePerKgInput = document.getElementById('pulsePricePerKg');
const amountToSpendInput = document.getElementById('amountToSpend');
const pulseQuantityEl = document.getElementById('pulseQuantity');
const pulseMessageEl = document.getElementById('pulseMessage');
const resetPulseCalcBtn = document.getElementById('resetPulseCalc');

function calculatePulseQuantity() {
    pulseMessageEl.textContent = ''; // Clear message on input
    const pricePerKg = getValidatedFloatInput(pulsePricePerKgInput, pulseMessageEl, 'Price Per Kg');
    const amountToSpend = getValidatedFloatInput(amountToSpendInput, pulseMessageEl, 'Amount to Spend');

    // If any input is invalid (NaN) or empty (null), reset display and return
    if (pricePerKg === null || amountToSpend === null || isNaN(pricePerKg) || isNaN(amountToSpend)) {
        pulseQuantityEl.textContent = '0.00 grams';
        return;
    }

    if (pricePerKg === 0) {
        pulseQuantityEl.textContent = (amountToSpend > 0) ? 'Infinite grams (Price is ₹0)' : '0.00 grams';
        if (amountToSpend > 0) {
            pulseMessageEl.textContent = 'Cannot calculate quantity if price is zero and amount is positive.';
        } else {
            pulseMessageEl.textContent = '';
        }
        return;
    }

    const quantityInGrams = (amountToSpend / pricePerKg) * 1000;

    if (quantityInGrams >= 1000) {
        pulseQuantityEl.textContent = `${(quantityInGrams / 1000).toFixed(2)} kg`;
    } else {
        pulseQuantityEl.textContent = `${quantityInGrams.toFixed(2)} grams`;
    }
}

pulsePricePerKgInput.addEventListener('input', calculatePulseQuantity);
amountToSpendInput.addEventListener('input', calculatePulseQuantity);
resetPulseCalcBtn.addEventListener('click', () => {
    pulsePricePerKgInput.value = '';
    amountToSpendInput.value = '';
    calculatePulseQuantity(); // Recalculate to reset display and clear messages
});

// --- Dairy Stock Reorder List Functions ---
const today = new Date();
// Format for order text date (e.g., "05/06/2025")
const shortDateFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
const todayDateFormatted = today.toLocaleDateString('en-IN', shortDateFormatOptions);

// Function to calculate total cost for reorder list
function calculateTotal() {
    let grandTotal = 0;
    const rows = document.getElementById('reorderTableBody').rows;

    for (let i = 0; i < rows.length; i++) {
        const input = rows[i].cells[1].getElementsByTagName('input')[0];
        const costCell = rows[i].cells[2];
        const quantity = parseFloat(input.value) || 0;
        const price = parseFloat(input.dataset.price) || 0;
        const rowTotal = quantity * price;
        costCell.textContent = rowTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        grandTotal += rowTotal;
    }

    document.getElementById('grandTotal').textContent = `₹${grandTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// Function to generate the order text and display in textarea
function generateOrderText() {
    let orderText = `${todayDateFormatted}\n`;
    const rows = document.getElementById('reorderTableBody').rows;
    let itemCounter = 1;

    const unitMap = { // Centralized unit management
        "ml": {factor: 1000, displayUnit: "L"},
        "g": {factor: 1000, displayUnit: "Kg"},
        "packs": {factor: 1, displayUnit: "Packet"}, 
        "default": {factor: 1, displayUnit: "Packet"} 
    };

    for (let i = 0; i < rows.length; i++) {
        const productNameCell = rows[i].cells[0];
        const input = rows[i].cells[1].getElementsByTagName('input')[0];
        const quantity = parseFloat(input.value) || 0;

        if (quantity > 0) {
            const productName = productNameCell.textContent;
            const unitType = productNameCell.dataset.unitType || 'default'; // Use 'default' if not specified
            const unitValue = parseFloat(productNameCell.dataset.unitValue) || 1; // Default to 1 if not specified

            let totalAmount;
            let unitDisplay;

            // Special handling for Dahi, 400g (2 pieces = 1 Kg)
            if (productName.includes('Dahi, 400g')) {
                totalAmount = quantity / 2; // For every 2 pieces, it's 1 Kg
                unitDisplay = 'Kg';
            }
            // Special handling for Dahi, 200g (5 pieces = 1 Kg)
            else if (productName.includes('Dahi, 200g')) {
                totalAmount = quantity / 5; // For every 5 pieces, it's 1 Kg
                unitDisplay = 'Kg';
            }
            // Special handling for Ananda Cow Paneer, 200g (5 pieces = 1 Kg)
            else if (productName.includes('Ananda Cow Paneer, 200g')) {
                totalAmount = quantity / 5; // For every 5 pieces, it's 1 Kg
                unitDisplay = 'Kg';
            }
            // Special handling for Amul Paneer, 200g (5 pieces = 1 Kg)
            else if (productName.includes('Amul Paneer, 200g')) {
                totalAmount = quantity / 5; // For every 5 pieces, it's 1 Kg
                unitDisplay = 'Kg';
            }
            // Special handling for Green Pea, 200g (5 pieces = 1 Kg)
            else if (productName.includes('Green Pea, 200g')) {
                totalAmount = quantity / 5; // For every 5 pieces, it's 1 Kg
                unitDisplay = 'Kg';
            }
            else {
                const unitInfo = unitMap[unitType] || unitMap['default']; // Get unit info from map
                totalAmount = (quantity * unitValue) / unitInfo.factor;
                unitDisplay = unitInfo.displayUnit;
            }

            let formattedAmount = totalAmount.toFixed(1);
            // Remove trailing .0 for whole numbers
            if (formattedAmount.endsWith('.0')) {
                formattedAmount = formattedAmount.slice(0, -2);
            }

            orderText += `${itemCounter}. ${productName} - ${formattedAmount}${unitDisplay}\n`;
            itemCounter++;
        }
    }

    const orderOutputElement = document.getElementById('orderOutput');
    const orderOutputContainer = document.getElementById('orderOutputContainer');

    if (itemCounter === 1) {
        orderOutputElement.value = `${todayDateFormatted}\nNo items selected for order.`;
    } else {
        orderOutputElement.value = orderText;
    }

    orderOutputContainer.style.display = 'flex'; // Make container visible
    orderOutputElement.select();
}

// Function to copy the generated text
function copyOrderText() {
    const orderOutputElement = document.getElementById('orderOutput');
    orderOutputElement.select();
    document.execCommand('copy');
    showToast('Order text copied to clipboard!'); // Use custom toast instead of alert
}

// Initialize reorder list inputs with event listeners
function initializeReorderListInputs() {
    const reorderTableBody = document.getElementById('reorderTableBody');
    const inputs = reorderTableBody.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', calculateTotal);
        input.value = ''; // Ensure inputs are empty on initialization
    });
}


// Initialize all calculators and reorder list on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeCashCounter();
    calculatePricePerPiece();
    calculateBoxProfit();
    calculateMargin();
    calculateGST();
    calculateDiscount();
    calculatePulseQuantity();
    initializeReorderListInputs(); // Initialize event listeners for reorder list
    calculateTotal(); // Calculate initial total for reorder list
});
