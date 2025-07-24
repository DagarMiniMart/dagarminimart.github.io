document.addEventListener('DOMContentLoaded', () => {
        
    // --- New UI Logic: Sidebar, Dark Mode, Navigation ---
    const sidebar = document.querySelector('.side-nav');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentPages = document.querySelectorAll('.content-page');

    // Sidebar Toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Dark Mode Toggle
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark');
    });
    
    // Navigation Logic
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(nav => nav.classList.remove('active'));
            contentPages.forEach(page => page.classList.remove('active'));

            link.classList.add('active');
            const targetId = link.getAttribute('data-target');
            document.querySelector(targetId).classList.add('active');
        });
    });

    // --- Utility Function for common input handling ---
    function getValidatedFloatInput(inputElement, messageElement, fieldName) {
        if (messageElement) {
            messageElement.textContent = '';
        }
        const value = parseFloat(inputElement.value);
        if (inputElement.value.trim() === '') return null;
        if (isNaN(value)) {
            if (messageElement) messageElement.textContent = `Invalid ${fieldName}. Please enter a number.`;
            return NaN;
        }
        if (value < 0) {
            if (messageElement) messageElement.textContent = `${fieldName} cannot be negative.`;
            return NaN;
        }
        return value;
    }

    function getValidatedIntInput(inputElement, messageElement, fieldName) {
        if (messageElement) {
            messageElement.textContent = '';
        }
        const value = parseInt(inputElement.value);
        if (inputElement.value.trim() === '') return null;
        if (isNaN(value)) {
            if (messageElement) messageElement.textContent = `Invalid ${fieldName}. Please enter a whole number.`;
            return NaN;
        }
        if (value < 0) {
            if (messageElement) messageElement.textContent = `${fieldName} cannot be negative.`;
            return NaN;
        }
        return value;
    }

    function formatIndianRupees(amount) {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // --- Toast Notification Functions ---
    const toastNotificationEl = document.getElementById('toastNotification');
    function showToast(message) {
        if (!toastNotificationEl) return;
        toastNotificationEl.textContent = message;
        toastNotificationEl.classList.add('show');
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
    const denominations = [500, 200, 100, 50, 20, 10, 5, 2, 1];
    let denominationInputs = [];

    function initializeCashCounter() {
        cashCounterDiv.innerHTML = '';
        denominationInputs = [];
        denominations.forEach(denom => {
            const wrapperDiv = document.createElement('div');
            wrapperDiv.className = 'flex flex-col gap-2';

            const label = document.createElement('label');
            label.setAttribute('for', `denom-${denom}`);
            label.className = 'modern-label';
            label.textContent = `₹${denom} Notes/Coins`;

            const input = document.createElement('input');
            input.type = 'number';
            input.id = `denom-${denom}`;
            input.min = '0';
            input.className = 'modern-input text-center';
            input.dataset.value = denom;
            input.placeholder = "0";
            input.addEventListener('input', calculateCashAndDifference);

            denominationInputs.push(input);
            wrapperDiv.appendChild(label);
            wrapperDiv.appendChild(input);
            cashCounterDiv.appendChild(wrapperDiv);
        });
        calculateCashAndDifference();
    }

    function calculateCashTotal() {
        return denominationInputs.reduce((total, input) => {
            const count = parseInt(input.value) || 0;
            const denominationValue = parseInt(input.dataset.value);
            return total + (count >= 0 ? count * denominationValue : 0);
        }, 0);
    }

    function calculateCashAndDifference() {
        const totalCash = calculateCashTotal();
        cashTotalAmountEl.textContent = formatIndianRupees(totalCash);
        const expectedCash = getValidatedFloatInput(expectedCashInput, null, 'Expected Cash');
        if (expectedCash === null || isNaN(expectedCash)) {
            cashDifferenceEl.textContent = formatIndianRupees(0);
            cashDifferenceEl.classList.remove('profit-positive', 'profit-negative');
        } else {
            const difference = totalCash - expectedCash;
            cashDifferenceEl.textContent = formatIndianRupees(difference);
            cashDifferenceEl.classList.remove('profit-positive', 'profit-negative');
            if (difference > 0) cashDifferenceEl.classList.add('profit-positive');
            else if (difference < 0) cashDifferenceEl.classList.add('profit-negative');
        }
    }

    resetCashCounterBtn.addEventListener('click', () => {
        denominationInputs.forEach(input => input.value = '');
        document.getElementById('customerName').value = '';
        document.getElementById('accountNumber').value = '';
        expectedCashInput.value = '';
        calculateCashAndDifference();
    });
    expectedCashInput.addEventListener('input', calculateCashAndDifference);

    // --- Unit Price Calculator ---
    const mrpBoxInput = document.getElementById('mrpBox');
    const piecesInBoxInput = document.getElementById('piecesInBox');
    const pricePerPieceEl = document.getElementById('pricePerPiece');
    const unitPriceMessageEl = document.getElementById('unitPriceMessage');
    const resetUnitPriceCalcBtn = document.getElementById('resetUnitPriceCalc');

    function calculatePricePerPiece() {
        unitPriceMessageEl.textContent = '';
        const mrpBox = getValidatedFloatInput(mrpBoxInput, unitPriceMessageEl, 'MRP of Box');
        const piecesInBox = getValidatedIntInput(piecesInBoxInput, unitPriceMessageEl, 'Number of Units');
        if (mrpBox === null || piecesInBox === null || isNaN(mrpBox) || isNaN(piecesInBox)) {
            pricePerPieceEl.textContent = formatIndianRupees(0);
            return;
        }
        if (piecesInBox === 0) {
            pricePerPieceEl.textContent = formatIndianRupees(0);
            unitPriceMessageEl.textContent = 'Number of units cannot be zero.';
            return;
        }
        pricePerPieceEl.textContent = formatIndianRupees(mrpBox / piecesInBox);
    }
    mrpBoxInput.addEventListener('input', calculatePricePerPiece);
    piecesInBoxInput.addEventListener('input', calculatePricePerPiece);
    resetUnitPriceCalcBtn.addEventListener('click', () => {
        mrpBoxInput.value = '';
        piecesInBoxInput.value = '';
        calculatePricePerPiece();
    });

    // --- Total Box Profit Calculator ---
    const sellingPricePerPcInput = document.getElementById('sellingPricePerPc');
    const costOfBoxInput = document.getElementById('costOfBox');
    const piecesInBoxProfitInput = document.getElementById('piecesInBoxProfit');
    const totalBoxProfitEl = document.getElementById('totalBoxProfit');
    const boxProfitMessageEl = document.getElementById('boxProfitMessage');
    const resetBoxProfitCalcBtn = document.getElementById('resetBoxProfitCalc');

    function calculateBoxProfit() {
        boxProfitMessageEl.textContent = '';
        const sellingPricePerPc = getValidatedFloatInput(sellingPricePerPcInput, boxProfitMessageEl, 'Selling Price');
        const costOfBox = getValidatedFloatInput(costOfBoxInput, boxProfitMessageEl, 'Cost of Box');
        const piecesInBoxProfit = getValidatedIntInput(piecesInBoxProfitInput, boxProfitMessageEl, 'Pieces in Box');
        totalBoxProfitEl.classList.remove('profit-positive', 'profit-negative');
        if (sellingPricePerPc === null || costOfBox === null || piecesInBoxProfit === null || isNaN(sellingPricePerPc) || isNaN(costOfBox) || isNaN(piecesInBoxProfit)) {
            totalBoxProfitEl.textContent = formatIndianRupees(0);
            return;
        }
        const totalProfit = (sellingPricePerPc * piecesInBoxProfit) - costOfBox;
        totalBoxProfitEl.textContent = formatIndianRupees(totalProfit);
        if (totalProfit >= 0) totalBoxProfitEl.classList.add('profit-positive');
        else totalBoxProfitEl.classList.add('profit-negative');
    }
    sellingPricePerPcInput.addEventListener('input', calculateBoxProfit);
    costOfBoxInput.addEventListener('input', calculateBoxProfit);
    piecesInBoxProfitInput.addEventListener('input', calculateBoxProfit);
    resetBoxProfitCalcBtn.addEventListener('click', () => {
        sellingPricePerPcInput.value = '';
        costOfBoxInput.value = '';
        piecesInBoxProfitInput.value = '';
        calculateBoxProfit();
    });

    // --- Margin Calculator ---
    const costPriceMarginInput = document.getElementById('costPriceMargin');
    const sellingPriceMarginInput = document.getElementById('sellingPriceMargin');
    const grossProfitAmountEl = document.getElementById('grossProfitAmount');
    const grossMarginPercentageEl = document.getElementById('grossMarginPercentage');
    const marginMessageEl = document.getElementById('marginMessage');
    const resetMarginCalcBtn = document.getElementById('resetMarginCalc');

    function calculateMargin() {
        marginMessageEl.textContent = '';
        const costPrice = getValidatedFloatInput(costPriceMarginInput, marginMessageEl, 'Cost Price');
        const sellingPrice = getValidatedFloatInput(sellingPriceMarginInput, marginMessageEl, 'Selling Price');
        if (costPrice === null || sellingPrice === null || isNaN(costPrice) || isNaN(sellingPrice)) {
            grossProfitAmountEl.textContent = formatIndianRupees(0);
            grossMarginPercentageEl.textContent = '0.00%';
            return;
        }
        if (sellingPrice < costPrice) marginMessageEl.textContent = 'Warning: Selling price is less than cost price.';
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
        gstMessageEl.textContent = '';
        const basePrice = getValidatedFloatInput(basePriceGSTInput, gstMessageEl, 'Base Price');
        const gstRate = getValidatedFloatInput(gstRateInput, gstMessageEl, 'GST Rate');
        if (basePrice === null || gstRate === null || isNaN(basePrice) || isNaN(gstRate)) {
            gstAmountEl.textContent = formatIndianRupees(0);
            totalPriceWithGSTEl.textContent = formatIndianRupees(0);
            return;
        }
        const gstAmount = basePrice * (gstRate / 100);
        totalPriceWithGSTEl.textContent = formatIndianRupees(basePrice + gstAmount);
        gstAmountEl.textContent = formatIndianRupees(gstAmount);
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
    const salePriceInput = document.getElementById('salePrice');
    const discountAmountEl = document.getElementById('discountAmount');
    const discountPercentageEl = document.getElementById('discountPercentage');
    const discountMessageEl = document.getElementById('discountMessage');
    const resetDiscountCalcBtn = document.getElementById('resetDiscountCalc');

    function calculateDiscount() {
        discountMessageEl.textContent = '';
        const mrp = getValidatedFloatInput(mrpInput, discountMessageEl, 'MRP');
        const salePrice = getValidatedFloatInput(salePriceInput, discountMessageEl, 'Sale Price');
        if (mrp === null || salePrice === null || isNaN(mrp) || isNaN(salePrice)) {
            discountAmountEl.textContent = '₹0.00';
            discountPercentageEl.textContent = 'Which is a 0.00% discount';
            return;
        }
        if (salePrice > mrp) {
            discountMessageEl.textContent = 'Sale price cannot be greater than MRP.';
            return;
        }
        const discountAmount = mrp - salePrice;
        const discountPercentage = (mrp > 0) ? (discountAmount / mrp) * 100 : 0;
        discountAmountEl.textContent = formatIndianRupees(discountAmount);
        discountPercentageEl.textContent = `Which is a ${discountPercentage.toFixed(2)}% discount`;
    }
    mrpInput.addEventListener('input', calculateDiscount);
    salePriceInput.addEventListener('input', calculateDiscount);
    resetDiscountCalcBtn.addEventListener('click', () => {
        mrpInput.value = '';
        salePriceInput.value = '';
        calculateDiscount();
    });

    // --- Price-Based Weight Calculator ---
    const pulsePricePerKgInput = document.getElementById('pulsePricePerKg');
    const amountToSpendInput = document.getElementById('amountToSpend');
    const pulseQuantityEl = document.getElementById('pulseQuantity');
    const pulseMessageEl = document.getElementById('pulseMessage');
    const resetPulseCalcBtn = document.getElementById('resetPulseCalc');

    function calculatePulseQuantity() {
        pulseMessageEl.textContent = '';
        const pricePerKg = getValidatedFloatInput(pulsePricePerKgInput, pulseMessageEl, 'Price Per Kg');
        const amountToSpend = getValidatedFloatInput(amountToSpendInput, pulseMessageEl, 'Amount to Spend');
        if (pricePerKg === null || amountToSpend === null || isNaN(pricePerKg) || isNaN(amountToSpend)) {
            pulseQuantityEl.textContent = '0.00 grams';
            return;
        }
        if (pricePerKg === 0) {
            pulseQuantityEl.textContent = (amountToSpend > 0) ? 'Infinite' : '0.00 grams';
            return;
        }
        const quantityInGrams = (amountToSpend / pricePerKg) * 1000;
        pulseQuantityEl.textContent = quantityInGrams >= 1000 ? `${(quantityInGrams / 1000).toFixed(2)} kg` : `${quantityInGrams.toFixed(2)} grams`;
    }
    pulsePricePerKgInput.addEventListener('input', calculatePulseQuantity);
    amountToSpendInput.addEventListener('input', calculatePulseQuantity);
    resetPulseCalcBtn.addEventListener('click', () => {
        pulsePricePerKgInput.value = '';
        amountToSpendInput.value = '';
        calculatePulseQuantity();
    });

    // --- Loose Item Profit Calculator ---
    const lipCostPricePackInput = document.getElementById('lipCostPricePack');
    const lipTotalItemsInput = document.getElementById('lipTotalItems');
    const lipSellingPriceItemInput = document.getElementById('lipSellingPriceItem');
    const lipCostPerItemEl = document.getElementById('lipCostPerItem');
    const lipProfitPerItemEl = document.getElementById('lipProfitPerItem');
    const lipMessageEl = document.getElementById('lipMessage');
    const resetLipCalcBtn = document.getElementById('resetLipCalc');

    function calculateLooseItemProfit() {
        lipMessageEl.textContent = '';
        const costPricePack = getValidatedFloatInput(lipCostPricePackInput, lipMessageEl, 'Cost Price of Pack');
        const totalItems = getValidatedIntInput(lipTotalItemsInput, lipMessageEl, 'Total Items');
        const sellingPriceItem = getValidatedFloatInput(lipSellingPriceItemInput, lipMessageEl, 'Selling Price per Item');
        
        lipProfitPerItemEl.classList.remove('profit-positive', 'profit-negative');

        if (costPricePack === null || totalItems === null || sellingPriceItem === null || isNaN(costPricePack) || isNaN(totalItems) || isNaN(sellingPriceItem)) {
            lipCostPerItemEl.textContent = formatIndianRupees(0);
            lipProfitPerItemEl.textContent = formatIndianRupees(0);
            return;
        }

        if (totalItems === 0) {
            lipMessageEl.textContent = 'Total items cannot be zero.';
            lipCostPerItemEl.textContent = formatIndianRupees(0);
            lipProfitPerItemEl.textContent = formatIndianRupees(0);
            return;
        }

        const costPerItem = costPricePack / totalItems;
        const profitPerItem = sellingPriceItem - costPerItem;

        lipCostPerItemEl.textContent = formatIndianRupees(costPerItem);
        lipProfitPerItemEl.textContent = formatIndianRupees(profitPerItem);

        if (profitPerItem >= 0) {
            lipProfitPerItemEl.classList.add('profit-positive');
        } else {
            lipProfitPerItemEl.classList.add('profit-negative');
        }
    }
    lipCostPricePackInput.addEventListener('input', calculateLooseItemProfit);
    lipTotalItemsInput.addEventListener('input', calculateLooseItemProfit);
    lipSellingPriceItemInput.addEventListener('input', calculateLooseItemProfit);
    resetLipCalcBtn.addEventListener('click', () => {
        lipCostPricePackInput.value = '';
        lipTotalItemsInput.value = '';
        lipSellingPriceItemInput.value = '';
        calculateLooseItemProfit();
    });

    // --- Scheme / Offer Calculator ---
    const schemePricePerItemInput = document.getElementById('schemePricePerItem');
    const schemeBuyQtyInput = document.getElementById('schemeBuyQty');
    const schemeGetQtyInput = document.getElementById('schemeGetQty');
    const schemeEffectivePriceEl = document.getElementById('schemeEffectivePrice');
    const schemeTotalCostEl = document.getElementById('schemeTotalCost');
    const schemeMessageEl = document.getElementById('schemeMessage');
    const resetSchemeCalcBtn = document.getElementById('resetSchemeCalc');

    function calculateScheme() {
        schemeMessageEl.textContent = '';
        const pricePerItem = getValidatedFloatInput(schemePricePerItemInput, schemeMessageEl, 'Price per Item');
        const buyQty = getValidatedIntInput(schemeBuyQtyInput, schemeMessageEl, 'Buy Quantity');
        const getQty = getValidatedIntInput(schemeGetQtyInput, schemeMessageEl, 'Get Quantity');

        if (pricePerItem === null || buyQty === null || getQty === null || isNaN(pricePerItem) || isNaN(buyQty) || isNaN(getQty)) {
            schemeEffectivePriceEl.textContent = formatIndianRupees(0);
            schemeTotalCostEl.textContent = formatIndianRupees(0);
            return;
        }
        
        const totalItems = buyQty + getQty;
        if (totalItems === 0) {
            schemeMessageEl.textContent = 'Total items (Buy + Get) cannot be zero.';
            schemeEffectivePriceEl.textContent = formatIndianRupees(0);
            schemeTotalCostEl.textContent = formatIndianRupees(0);
            return;
        }

        const totalCost = pricePerItem * buyQty;
        const effectivePrice = totalCost / totalItems;

        schemeEffectivePriceEl.textContent = formatIndianRupees(effectivePrice);
        schemeTotalCostEl.textContent = formatIndianRupees(totalCost);
    }
    schemePricePerItemInput.addEventListener('input', calculateScheme);
    schemeBuyQtyInput.addEventListener('input', calculateScheme);
    schemeGetQtyInput.addEventListener('input', calculateScheme);
    resetSchemeCalcBtn.addEventListener('click', () => {
        schemePricePerItemInput.value = '';
        schemeBuyQtyInput.value = '';
        schemeGetQtyInput.value = '';
        calculateScheme();
    });


    // --- Leftover Calculator ---
    const totalQuantityInput = document.getElementById('totalQuantity');
    const soldQuantityInput = document.getElementById('soldQuantity');
    const leftoverQuantityEl = document.getElementById('leftoverQuantity');
    const leftoverMessageEl = document.getElementById('leftoverMessage');
    const resetLeftoverCalcBtn = document.getElementById('resetLeftoverCalc');

    function calculateLeftovers() {
        leftoverMessageEl.textContent = '';
        const totalQty = getValidatedIntInput(totalQuantityInput, leftoverMessageEl, 'Total Quantity');
        const soldQty = getValidatedIntInput(soldQuantityInput, leftoverMessageEl, 'Sold Quantity');

        if (totalQty === null || soldQty === null || isNaN(totalQty) || isNaN(soldQty)) {
            leftoverQuantityEl.textContent = '0';
            return;
        }

        if (soldQty > totalQty) {
            leftoverMessageEl.textContent = 'Sold quantity cannot be greater than total quantity.';
            leftoverQuantityEl.textContent = '0';
            return;
        }

        const leftoverQty = totalQty - soldQty;
        leftoverQuantityEl.textContent = leftoverQty;
    }

    totalQuantityInput.addEventListener('input', calculateLeftovers);
    soldQuantityInput.addEventListener('input', calculateLeftovers);
    resetLeftoverCalcBtn.addEventListener('click', () => {
        totalQuantityInput.value = '';
        soldQuantityInput.value = '';
        calculateLeftovers();
    });


    // --- Dairy Stock Reorder List Functions ---
    const reorderTableBody = document.getElementById('reorderTableBody');
    const orderOutputContainer = document.getElementById('orderOutputContainer');
    const orderOutputElement = document.getElementById('orderOutput');
    
    function calculateTotal() {
        let grandTotal = 0;
        reorderTableBody.querySelectorAll('tr').forEach(row => {
            const input = row.querySelector('input');
            const costCell = row.cells[2];
            const quantity = parseFloat(input.value) || 0;
            const price = parseFloat(input.dataset.price) || 0;
            const rowTotal = quantity * price;
            costCell.textContent = rowTotal.toFixed(2);
            grandTotal += rowTotal;
        });
        document.getElementById('grandTotal').textContent = formatIndianRupees(grandTotal);
    }

    window.generateOrderText = function() {
        const today = new Date();
        const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-GB', dateOptions);

        let orderText = `Dagar Mini Mart\n`;
        orderText += `Order Date: ${formattedDate}\n`;
        orderText += `Daily Order Summary\n\n`;
        
        let itemCounter = 1;
        reorderTableBody.querySelectorAll('tr').forEach(row => {
            const input = row.querySelector('input');
            const quantity = parseFloat(input.value) || 0;
            if (quantity > 0) {
                const productCellText = row.cells[0].textContent;
                const parts = productCellText.split(', ');
                let productName = parts[0];
                let productSize = parts.length > 1 ? `(${parts[1]})` : '';
                
                orderText += `${itemCounter}. ${productName} ${productSize} – ${quantity} Pieces\n`;
                itemCounter++;
            }
        });
        
        if (itemCounter === 1) {
            orderOutputElement.value = `Dagar Mini Mart\nOrder Date: ${formattedDate}\nDaily Order Summary\n\nNo items selected.`;
        } else {
             orderOutputElement.value = orderText;
        }
       
        orderOutputContainer.style.display = 'flex';
        orderOutputElement.style.height = 'auto';
        orderOutputElement.style.height = (orderOutputElement.scrollHeight) + 'px';
        orderOutputElement.select();
    }

    window.copyOrderText = function() {
        orderOutputElement.select();
        document.execCommand('copy');
        showToast('Order text copied to clipboard!');
    }

    window.sendToWhatsApp = function() {
        const orderText = orderOutputElement.value;
        if (!orderText || orderText.includes('No items selected')) {
            showToast('Please generate an order with items first.');
            return;
        }

        const phoneNumber = '918218312037';
        const encodedText = encodeURIComponent(orderText);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
        
        window.open(whatsappUrl, '_blank');
    }

    function initializeReorderListInputs() {
        reorderTableBody.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', calculateTotal);
            input.value = '';
        });
    }

    // Initialize all calculators on page load
    initializeCashCounter();
    calculatePricePerPiece();
    calculateBoxProfit();
    calculateMargin();
    calculateGST();
    calculateDiscount();
    calculatePulseQuantity();
    calculateLooseItemProfit();
    calculateScheme();
    calculateLeftovers();
    initializeReorderListInputs();
    calculateTotal();
});
