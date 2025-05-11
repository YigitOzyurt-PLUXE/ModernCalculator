document.addEventListener('DOMContentLoaded', () => {
    // Mode switching
    const calculatorMode = document.getElementById('calculator-mode');
    const elementMode = document.getElementById('element-mode');
    const wideMode = document.getElementById('wide-mode');
    const narrowMode = document.getElementById('narrow-mode');
    const calculatorView = document.getElementById('calculator-view');
    const elementsView = document.getElementById('elements-view');
    const wideCalculatorView = document.getElementById('wide-calculator-view');
    
    // Set narrow mode as default active state
    narrowMode.classList.add('active');
    
    // Function to reset all mode buttons and views
    function resetModes() {
        calculatorMode.classList.remove('active');
        elementMode.classList.remove('active');
        wideMode.classList.remove('active');
        narrowMode.classList.remove('active');
        
        calculatorView.style.display = 'none';
        elementsView.style.display = 'none';
        wideCalculatorView.style.display = 'none';
    }
    
    calculatorMode.addEventListener('click', () => {
        resetModes();
        calculatorMode.classList.add('active');
        calculatorView.style.display = 'flex';
    });
    
    elementMode.addEventListener('click', () => {
        resetModes();
        elementMode.classList.add('active');
        elementsView.style.display = 'block';
        
        // Initialize periodic table if it hasn't been done yet
        if (document.getElementById('periodic-table').children.length === 0) {
            initializePeriodicTable();
        }
    });
    
    wideMode.addEventListener('click', () => {
        resetModes();
        wideMode.classList.add('active');
        wideCalculatorView.style.display = 'block';
        
        // Initialize wide calculator if needed
        initializeWideCalculator();
    });
    
    narrowMode.addEventListener('click', () => {
        resetModes();
        narrowMode.classList.add('active');
        calculatorView.style.display = 'flex';
    });
    
    // Get DOM elements
    const previousOperandElement = document.getElementById('previous-operand');
    const currentOperandElement = document.getElementById('current-operand');
    const numberButtons = document.querySelectorAll('.number');
    const operatorButtons = document.querySelectorAll('.operator');
    const equalsButton = document.getElementById('equals');
    const clearButton = document.getElementById('clear');
    const deleteButton = document.getElementById('delete');
    const percentButton = document.getElementById('percent');

    // Calculator state
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    let resetInput = false;

    // Sound effects
    const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    clickSound.volume = 0.2;

    // Play sound with reduced volume
    function playClickSound() {
        const sound = clickSound.cloneNode();
        sound.volume = 0.1;
        sound.play().catch(e => console.log('Sound play prevented by browser policy'));
    }

    // Update display
    function updateDisplay() {
        // Format the display numbers
        const formatNumber = (number) => {
            if (number === '') return '';
            const stringNumber = number.toString();
            const integerDigits = parseFloat(stringNumber.split('.')[0]);
            const decimalDigits = stringNumber.split('.')[1];
            
            let integerDisplay;
            if (isNaN(integerDigits)) {
                integerDisplay = '';
            } else {
                integerDisplay = integerDigits.toLocaleString('en', { 
                    maximumFractionDigits: 0 
                });
            }
            
            if (decimalDigits != null) {
                return `${integerDisplay}.${decimalDigits}`;
            } else {
                return integerDisplay;
            }
        };

        currentOperandElement.textContent = formatNumber(currentOperand);
        
        if (operation != null) {
            previousOperandElement.textContent = `${formatNumber(previousOperand)} ${operation}`;
        } else {
            previousOperandElement.textContent = '';
        }
    }

    // Append number to current operand
    function appendNumber(number) {
        if (number === '.' && currentOperand.includes('.')) return;
        if (resetInput) {
            currentOperand = '';
            resetInput = false;
        }
        if (currentOperand === '0' && number !== '.') {
            currentOperand = number;
        } else {
            currentOperand += number;
        }
        updateDisplay();
    }

    // Choose operation
    function chooseOperation(op) {
        if (currentOperand === '') return;
        if (previousOperand !== '') {
            compute();
        }
        operation = op;
        previousOperand = currentOperand;
        currentOperand = '';
        updateDisplay();
    }

    // Compute result
    function compute() {
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    currentOperand = 'Error';
                    previousOperand = '';
                    operation = undefined;
                    updateDisplay();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Handle large numbers and floating point precision
        if (computation.toString().length > 12) {
            computation = parseFloat(computation.toPrecision(12));
        }
        
        currentOperand = computation.toString();
        operation = undefined;
        previousOperand = '';
        resetInput = true;
        updateDisplay();
    }

    // Calculate percentage
    function calculatePercent() {
        if (currentOperand === '') return;
        currentOperand = (parseFloat(currentOperand) / 100).toString();
        updateDisplay();
    }

    // Clear calculator
    function clear() {
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
        resetInput = false;
        updateDisplay();
    }

    // Delete last digit
    function deleteDigit() {
        if (currentOperand === 'Error') {
            clear();
            return;
        }
        if (currentOperand.length === 1) {
            currentOperand = '0';
        } else {
            currentOperand = currentOperand.slice(0, -1);
        }
        updateDisplay();
    }

    // Add keyboard support
    function handleKeyboard(e) {
        if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
        if (e.key === '.') appendNumber('.');
        if (e.key === '=' || e.key === 'Enter') {
            e.preventDefault();
            compute();
        }
        if (e.key === 'Backspace') deleteDigit();
        if (e.key === 'Escape') clear();
        if (e.key === '+') chooseOperation('+');
        if (e.key === '-') chooseOperation('−');
        if (e.key === '*') chooseOperation('×');
        if (e.key === '/') {
            e.preventDefault();
            chooseOperation('÷');
        }
        if (e.key === '%') calculatePercent();
    }

    // Add event listeners
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            playClickSound();
            appendNumber(button.textContent);
        });
    });

    operatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            playClickSound();
            chooseOperation(button.textContent);
        });
    });

    equalsButton.addEventListener('click', () => {
        playClickSound();
        compute();
    });

    clearButton.addEventListener('click', () => {
        playClickSound();
        clear();
    });

    deleteButton.addEventListener('click', () => {
        playClickSound();
        deleteDigit();
    });

    percentButton.addEventListener('click', () => {
        playClickSound();
        calculatePercent();
    });

    document.addEventListener('keydown', handleKeyboard);

    // Add button hover effects
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });

    // Initialize display
    updateDisplay();
    
    // Wide Calculator functionality
    function initializeWideCalculator() {
        // Get DOM elements for wide calculator
        const widePreviousOperandElement = document.getElementById('wide-previous-operand');
        const wideCurrentOperandElement = document.getElementById('wide-current-operand');
        const wideNumberButtons = document.querySelectorAll('#standard-buttons .number');
        const wideOperatorButtons = document.querySelectorAll('#standard-buttons .operator');
        const wideEqualsButton = document.getElementById('wide-equals');
        const wideClearButton = document.getElementById('wide-clear');
        const wideDeleteButton = document.getElementById('wide-delete');
        const widePercentButton = document.getElementById('wide-percent');
        
        // Function selector
        const functionSelect = document.getElementById('function-select');
        const standardButtons = document.getElementById('standard-buttons');
        const scientificButtons = document.getElementById('scientific-buttons');
        const trigonometryButtons = document.getElementById('trigonometry-buttons');
        const conversionButtons = document.getElementById('conversion-buttons');
        const financeButtons = document.getElementById('finance-buttons');
        
        // Calculator state
        let wideCurrentOperand = '0';
        let widePreviousOperand = '';
        let wideOperation = undefined;
        let wideResetInput = false;
        let angleMode = 'deg'; // Default to degrees for trig functions
        
        // Update display
        function updateWideDisplay() {
            // Format the display numbers
            const formatNumber = (number) => {
                if (number === '') return '';
                const stringNumber = number.toString();
                const integerDigits = parseFloat(stringNumber.split('.')[0]);
                const decimalDigits = stringNumber.split('.')[1];
                
                let integerDisplay;
                if (isNaN(integerDigits)) {
                    integerDisplay = '';
                } else {
                    integerDisplay = integerDigits.toLocaleString('en', { 
                        maximumFractionDigits: 0 
                    });
                }
                
                if (decimalDigits != null) {
                    return `${integerDisplay}.${decimalDigits}`;
                } else {
                    return integerDisplay;
                }
            };

            wideCurrentOperandElement.textContent = formatNumber(wideCurrentOperand);
            
            if (wideOperation != null) {
                widePreviousOperandElement.textContent = `${formatNumber(widePreviousOperand)} ${wideOperation}`;
            } else {
                widePreviousOperandElement.textContent = '';
            }
        }
        
        // Append number to current operand
        function appendWideNumber(number) {
            if (number === '.' && wideCurrentOperand.includes('.')) return;
            if (wideResetInput) {
                wideCurrentOperand = '';
                wideResetInput = false;
            }
            if (wideCurrentOperand === '0' && number !== '.') {
                wideCurrentOperand = number;
            } else {
                wideCurrentOperand += number;
            }
            updateWideDisplay();
        }
        
        // Choose operation
        function chooseWideOperation(op) {
            if (wideCurrentOperand === '') return;
            if (widePreviousOperand !== '') {
                computeWide();
            }
            wideOperation = op;
            widePreviousOperand = wideCurrentOperand;
            wideCurrentOperand = '';
            updateWideDisplay();
        }
        
        // Compute result
        function computeWide() {
            let computation;
            const prev = parseFloat(widePreviousOperand);
            const current = parseFloat(wideCurrentOperand);
            
            if (isNaN(prev) || isNaN(current)) return;
            
            switch (wideOperation) {
                case '+':
                    computation = prev + current;
                    break;
                case '−':
                    computation = prev - current;
                    break;
                case '×':
                    computation = prev * current;
                    break;
                case '÷':
                    if (current === 0) {
                        wideCurrentOperand = 'Error';
                        widePreviousOperand = '';
                        wideOperation = undefined;
                        updateWideDisplay();
                        return;
                    }
                    computation = prev / current;
                    break;
                default:
                    return;
            }
            
            // Handle large numbers and floating point precision
            if (computation.toString().length > 12) {
                computation = parseFloat(computation.toPrecision(12));
            }
            
            wideCurrentOperand = computation.toString();
            wideOperation = undefined;
            widePreviousOperand = '';
            wideResetInput = true;
            updateWideDisplay();
        }
        
        // Calculate percentage
        function calculateWidePercent() {
            if (wideCurrentOperand === '') return;
            wideCurrentOperand = (parseFloat(wideCurrentOperand) / 100).toString();
            updateWideDisplay();
        }
        
        // Clear calculator
        function clearWide() {
            wideCurrentOperand = '0';
            widePreviousOperand = '';
            wideOperation = undefined;
            wideResetInput = false;
            updateWideDisplay();
        }
        
        // Delete last digit
        function deleteWideDigit() {
            if (wideCurrentOperand === 'Error') {
                clearWide();
                return;
            }
            if (wideCurrentOperand.length === 1) {
                wideCurrentOperand = '0';
            } else {
                wideCurrentOperand = wideCurrentOperand.slice(0, -1);
            }
            updateWideDisplay();
        }
        
        // Scientific functions
        function handleScientificFunction(functionName) {
            if (wideCurrentOperand === '' || wideCurrentOperand === 'Error') return;
            
            const num = parseFloat(wideCurrentOperand);
            let result;
            
            switch (functionName) {
                case 'square':
                    result = Math.pow(num, 2);
                    break;
                case 'cube':
                    result = Math.pow(num, 3);
                    break;
                case 'power':
                    widePreviousOperand = wideCurrentOperand;
                    wideOperation = '^';
                    wideCurrentOperand = '';
                    updateWideDisplay();
                    return;
                case 'sqrt':
                    if (num < 0) {
                        wideCurrentOperand = 'Error';
                        updateWideDisplay();
                        return;
                    }
                    result = Math.sqrt(num);
                    break;
                case 'cbrt':
                    result = Math.cbrt(num);
                    break;
                case 'root':
                    widePreviousOperand = wideCurrentOperand;
                    wideOperation = 'yroot';
                    wideCurrentOperand = '';
                    updateWideDisplay();
                    return;
                case 'log':
                    if (num <= 0) {
                        wideCurrentOperand = 'Error';
                        updateWideDisplay();
                        return;
                    }
                    result = Math.log10(num);
                    break;
                case 'ln':
                    if (num <= 0) {
                        wideCurrentOperand = 'Error';
                        updateWideDisplay();
                        return;
                    }
                    result = Math.log(num);
                    break;
                case 'exp':
                    result = Math.exp(num);
                    break;
                case 'factorial':
                    if (num < 0 || !Number.isInteger(num)) {
                        wideCurrentOperand = 'Error';
                        updateWideDisplay();
                        return;
                    }
                    result = factorial(num);
                    break;
                case 'pi':
                    result = Math.PI;
                    break;
                case 'e':
                    result = Math.E;
                    break;
            }
            
            if (result.toString().length > 12) {
                result = parseFloat(result.toPrecision(12));
            }
            
            wideCurrentOperand = result.toString();
            updateWideDisplay();
        }
        
        // Factorial function
        function factorial(n) {
            if (n === 0 || n === 1) return 1;
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
                if (result === Infinity) break;
            }
            return result;
        }
        
        // Trigonometry functions
        function handleTrigFunction(functionName) {
            if (wideCurrentOperand === '' || wideCurrentOperand === 'Error') return;
            
            const num = parseFloat(wideCurrentOperand);
            let result;
            let angleInRadians = num;
            
            // Convert to radians if in degree mode
            if (angleMode === 'deg' && ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(functionName)) {
                angleInRadians = num * (Math.PI / 180);
            }
            
            switch (functionName) {
                case 'sin':
                    result = Math.sin(angleInRadians);
                    break;
                case 'cos':
                    result = Math.cos(angleInRadians);
                    break;
                case 'tan':
                    result = Math.tan(angleInRadians);
                    break;
                case 'asin':
                    if (num < -1 || num > 1) {
                        wideCurrentOperand = 'Error';
                        updateWideDisplay();
                        return;
                    }
                    result = Math.asin(num);
                    if (angleMode === 'deg') {
                        result = result * (180 / Math.PI);
                    }
                    break;
                case 'acos':
                    if (num < -1 || num > 1) {
                        wideCurrentOperand = 'Error';
                        updateWideDisplay();
                        return;
                    }
                    result = Math.acos(num);
                    if (angleMode === 'deg') {
                        result = result * (180 / Math.PI);
                    }
                    break;
                case 'atan':
                    result = Math.atan(num);
                    if (angleMode === 'deg') {
                        result = result * (180 / Math.PI);
                    }
                    break;
                case 'sinh':
                    result = Math.sinh(num);
                    break;
                case 'cosh':
                    result = Math.cosh(num);
                    break;
                case 'tanh':
                    result = Math.tanh(num);
                    break;
                case 'deg':
                    angleMode = 'deg';
                    wideCurrentOperandElement.textContent += ' (DEG)';
                    return;
                case 'rad':
                    angleMode = 'rad';
                    wideCurrentOperandElement.textContent += ' (RAD)';
                    return;
            }
            
            if (result.toString().length > 12) {
                result = parseFloat(result.toPrecision(12));
            }
            
            wideCurrentOperand = result.toString();
            updateWideDisplay();
        }
        
        // Unit conversion functions
        function setupConversions() {
            // Length conversion
            document.getElementById('length-convert').addEventListener('click', () => {
                const value = parseFloat(document.getElementById('length-input').value);
                const fromUnit = document.getElementById('length-from').value;
                const toUnit = document.getElementById('length-to').value;
                
                if (isNaN(value)) {
                    document.getElementById('length-result').textContent = 'Please enter a valid number';
                    return;
                }
                
                const result = convertLength(value, fromUnit, toUnit);
                document.getElementById('length-result').textContent = `${value} ${fromUnit} = ${result} ${toUnit}`;
            });
            
            // Weight conversion
            document.getElementById('weight-convert').addEventListener('click', () => {
                const value = parseFloat(document.getElementById('weight-input').value);
                const fromUnit = document.getElementById('weight-from').value;
                const toUnit = document.getElementById('weight-to').value;
                
                if (isNaN(value)) {
                    document.getElementById('weight-result').textContent = 'Please enter a valid number';
                    return;
                }
                
                const result = convertWeight(value, fromUnit, toUnit);
                document.getElementById('weight-result').textContent = `${value} ${fromUnit} = ${result} ${toUnit}`;
            });
            
            // Temperature conversion
            document.getElementById('temp-convert').addEventListener('click', () => {
                const value = parseFloat(document.getElementById('temp-input').value);
                const fromUnit = document.getElementById('temp-from').value;
                const toUnit = document.getElementById('temp-to').value;
                
                if (isNaN(value)) {
                    document.getElementById('temp-result').textContent = 'Please enter a valid number';
                    return;
                }
                
                const result = convertTemperature(value, fromUnit, toUnit);
                document.getElementById('temp-result').textContent = `${value} ${getTemperatureUnitName(fromUnit)} = ${result} ${getTemperatureUnitName(toUnit)}`;
            });
        }
        
        function getTemperatureUnitName(unit) {
            switch(unit) {
                case 'c': return 'Celsius';
                case 'f': return 'Fahrenheit';
                case 'k': return 'Kelvin';
                default: return unit;
            }
        }
        
        function convertLength(value, fromUnit, toUnit) {
            // Convert to meters first (base unit)
            let meters;
            switch (fromUnit) {
                case 'm': meters = value; break;
                case 'km': meters = value * 1000; break;
                case 'cm': meters = value / 100; break;
                case 'mm': meters = value / 1000; break;
                case 'in': meters = value * 0.0254; break;
                case 'ft': meters = value * 0.3048; break;
                case 'yd': meters = value * 0.9144; break;
                case 'mi': meters = value * 1609.34; break;
            }
            
            // Convert from meters to target unit
            let result;
            switch (toUnit) {
                case 'm': result = meters; break;
                case 'km': result = meters / 1000; break;
                case 'cm': result = meters * 100; break;
                case 'mm': result = meters * 1000; break;
                case 'in': result = meters / 0.0254; break;
                case 'ft': result = meters / 0.3048; break;
                case 'yd': result = meters / 0.9144; break;
                case 'mi': result = meters / 1609.34; break;
            }
            
            return parseFloat(result.toFixed(6));
        }
        
        function convertWeight(value, fromUnit, toUnit) {
            // Convert to grams first (base unit)
            let grams;
            switch (fromUnit) {
                case 'kg': grams = value * 1000; break;
                case 'g': grams = value; break;
                case 'mg': grams = value / 1000; break;
                case 'lb': grams = value * 453.592; break;
                case 'oz': grams = value * 28.3495; break;
            }
            
            // Convert from grams to target unit
            let result;
            switch (toUnit) {
                case 'kg': result = grams / 1000; break;
                case 'g': result = grams; break;
                case 'mg': result = grams * 1000; break;
                case 'lb': result = grams / 453.592; break;
                case 'oz': result = grams / 28.3495; break;
            }
            
            return parseFloat(result.toFixed(6));
        }
        
        function convertTemperature(value, fromUnit, toUnit) {
            // Convert to Celsius first (base unit)
            let celsius;
            switch (fromUnit) {
                case 'c': celsius = value; break;
                case 'f': celsius = (value - 32) * 5/9; break;
                case 'k': celsius = value - 273.15; break;
            }
            
            // Convert from Celsius to target unit
            let result;
            switch (toUnit) {
                case 'c': result = celsius; break;
                case 'f': result = celsius * 9/5 + 32; break;
                case 'k': result = celsius + 273.15; break;
            }
            
            return parseFloat(result.toFixed(2));
        }
        
        // Finance functions
        function setupFinance() {
            // Compound interest calculator
            document.getElementById('calculate-interest').addEventListener('click', () => {
                const principal = parseFloat(document.getElementById('principal').value);
                const rate = parseFloat(document.getElementById('rate').value) / 100;
                const time = parseFloat(document.getElementById('time').value);
                const compounds = parseInt(document.getElementById('compounds').value);
                
                if (isNaN(principal) || isNaN(rate) || isNaN(time) || isNaN(compounds)) {
                    document.getElementById('interest-result').textContent = 'Please enter valid numbers';
                    return;
                }
                
                const amount = principal * Math.pow(1 + (rate / compounds), compounds * time);
                const interest = amount - principal;
                
                document.getElementById('interest-result').innerHTML = `
                    <p>Future Value: $${amount.toFixed(2)}</p>
                    <p>Total Interest: $${interest.toFixed(2)}</p>
                `;
            });
            
            // Loan calculator
            document.getElementById('calculate-loan').addEventListener('click', () => {
                const loanAmount = parseFloat(document.getElementById('loan-amount').value);
                const interestRate = parseFloat(document.getElementById('loan-rate').value) / 100 / 12; // Monthly rate
                const loanTerm = parseFloat(document.getElementById('loan-term').value) * 12; // Months
                
                if (isNaN(loanAmount) || isNaN(interestRate) || isNaN(loanTerm)) {
                    document.getElementById('loan-result').textContent = 'Please enter valid numbers';
                    return;
                }
                
                const monthlyPayment = loanAmount * interestRate * Math.pow(1 + interestRate, loanTerm) / (Math.pow(1 + interestRate, loanTerm) - 1);
                const totalPayment = monthlyPayment * loanTerm;
                const totalInterest = totalPayment - loanAmount;
                
                document.getElementById('loan-result').innerHTML = `
                    <p>Monthly Payment: $${monthlyPayment.toFixed(2)}</p>
                    <p>Total Payment: $${totalPayment.toFixed(2)}</p>
                    <p>Total Interest: $${totalInterest.toFixed(2)}</p>
                `;
            });
        }
        
        // Function selector event listener
        functionSelect.addEventListener('change', () => {
            // Hide all button sections
            standardButtons.style.display = 'none';
            scientificButtons.style.display = 'none';
            trigonometryButtons.style.display = 'none';
            conversionButtons.style.display = 'none';
            financeButtons.style.display = 'none';
            
            // Show selected section
            switch (functionSelect.value) {
                case 'standard':
                    standardButtons.style.display = 'grid';
                    break;
                case 'scientific':
                    standardButtons.style.display = 'grid';
                    scientificButtons.style.display = 'grid';
                    break;
                case 'trigonometry':
                    standardButtons.style.display = 'grid';
                    trigonometryButtons.style.display = 'grid';
                    break;
                case 'conversion':
                    conversionButtons.style.display = 'block';
                    break;
                case 'finance':
                    financeButtons.style.display = 'block';
                    break;
            }
        });
        
        // Add event listeners for wide calculator
        wideNumberButtons.forEach(button => {
            button.addEventListener('click', () => {
                appendWideNumber(button.textContent);
            });
        });
        
        wideOperatorButtons.forEach(button => {
            button.addEventListener('click', () => {
                chooseWideOperation(button.textContent);
            });
        });
        
        wideEqualsButton.addEventListener('click', () => {
            computeWide();
        });
        
        wideClearButton.addEventListener('click', () => {
            clearWide();
        });
        
        wideDeleteButton.addEventListener('click', () => {
            deleteWideDigit();
        });
        
        widePercentButton.addEventListener('click', () => {
            calculateWidePercent();
        });
        
        // Add event listeners for scientific functions
        document.querySelectorAll('#scientific-buttons .function').forEach(button => {
            button.addEventListener('click', () => {
                handleScientificFunction(button.id);
            });
        });
        
        // Add event listeners for trigonometry functions
        document.querySelectorAll('#trigonometry-buttons .function').forEach(button => {
            button.addEventListener('click', () => {
                handleTrigFunction(button.id);
            });
        });
        
        // Setup conversion and finance calculators
        setupConversions();
        setupFinance();
        
        // Initialize display
        updateWideDisplay();
        
        // Show standard buttons by default
        standardButtons.style.display = 'grid';
    }
    
    // Elements functionality - Periodic Table Data
    const periodicTableData = [
        { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'nonmetal' },
        { number: 2, symbol: 'He', name: 'Helium', mass: 4.0026, category: 'noble-gas' },
        { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, category: 'alkali-metal' },
        { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.0122, category: 'alkaline-earth' },
        { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'metalloid' },
        { number: 6, symbol: 'C', name: 'Carbon', mass: 12.011, category: 'nonmetal' },
        { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, category: 'nonmetal' },
        { number: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, category: 'nonmetal' },
        { number: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, category: 'halogen' },
        { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.180, category: 'noble-gas' },
        { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.990, category: 'alkali-metal' },
        { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, category: 'alkaline-earth' },
        { number: 13, symbol: 'Al', name: 'Aluminum', mass: 26.982, category: 'post-transition' },
        { number: 14, symbol: 'Si', name: 'Silicon', mass: 28.085, category: 'metalloid' },
        { number: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, category: 'nonmetal' },
        { number: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, category: 'nonmetal' },
        { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'halogen' },
        { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, category: 'noble-gas' },
        { number: 19, symbol: 'K', name: 'Potassium', mass: 39.098, category: 'alkali-metal' },
        { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, category: 'alkaline-earth' },
        // Adding more elements would make this too long, so we'll add just the first 20 for demonstration
    ];
    
    // Function to initialize the periodic table
    function initializePeriodicTable() {
        const periodicTable = document.getElementById('periodic-table');
        const elementInfo = document.getElementById('element-info');
        const searchInput = document.getElementById('element-search-input');
        
        // Create the periodic table layout (simplified for demonstration)
        const periodicTableLayout = [
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 7, 8, 9, 10],
            [11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 14, 15, 16, 17, 18],
            [19, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
        
        // Create element cells
        periodicTableLayout.forEach(row => {
            row.forEach(atomicNumber => {
                const cell = document.createElement('div');
                
                if (atomicNumber === 0) {
                    // Empty cell
                    cell.className = 'element-cell empty';
                    cell.style.visibility = 'hidden';
                } else {
                    // Find element data
                    const element = periodicTableData.find(e => e.number === atomicNumber);
                    
                    if (element) {
                        // Create element cell
                        cell.className = `element-cell ${element.category}`;
                        cell.dataset.number = element.number;
                        cell.innerHTML = `
                            <div class="atomic-number">${element.number}</div>
                            <div class="symbol">${element.symbol}</div>
                        `;
                        
                        // Add click event
                        cell.addEventListener('click', () => {
                            // Remove selected class from all cells
                            document.querySelectorAll('.element-cell').forEach(c => {
                                c.classList.remove('selected');
                            });
                            
                            // Add selected class to clicked cell
                            cell.classList.add('selected');
                            
                            // Update element info
                            updateElementInfo(element);
                        });
                    }
                }
                
                periodicTable.appendChild(cell);
            });
        });
        
        // Search functionality
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            
            if (searchTerm.trim() === '') {
                // Reset all cells visibility
                document.querySelectorAll('.element-cell').forEach(cell => {
                    if (!cell.classList.contains('empty')) {
                        cell.style.opacity = '1';
                    }
                });
                return;
            }
            
            // Filter elements
            periodicTableData.forEach(element => {
                const cell = document.querySelector(`.element-cell[data-number="${element.number}"]`);
                
                if (cell) {
                    if (
                        element.name.toLowerCase().includes(searchTerm) ||
                        element.symbol.toLowerCase().includes(searchTerm) ||
                        element.number.toString().includes(searchTerm)
                    ) {
                        cell.style.opacity = '1';
                    } else {
                        cell.style.opacity = '0.3';
                    }
                }
            });
        });
    }
    
    // Function to update element info
    function updateElementInfo(element) {
        const elementInfo = document.getElementById('element-info');
        
        elementInfo.innerHTML = `
            <div class="element-symbol ${element.category}">${element.symbol}</div>
            <div class="element-name">${element.name}</div>
            <div class="element-details">
                <div>Atomic Number: ${element.number}</div>
                <div>Atomic Mass: ${element.mass}</div>
                <div>Category: ${element.category.replace('-', ' ')}</div>
            </div>
        `;
    }
});
