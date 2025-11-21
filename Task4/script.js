const resultEl = document.getElementById("result");
const exprEl = document.getElementById("expression");
const keys = document.querySelector(".keys");

let current = "0";
let previous = null;
let operator = null;
let justEvaluated = false;

function updateDisplay() {
  resultEl.textContent = current;
}

function getOperatorSymbol(op) {
  switch (op) {
    case "add":
      return "+";
    case "subtract":
      return "−";
    case "multiply":
      return "×";
    case "divide":
      return "÷";
    default:
      return "";
  }
}

function calculate(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  if (isNaN(x) || isNaN(y)) return b;

  switch (op) {
    case "add":
      return (x + y).toString();
    case "subtract":
      return (x - y).toString();
    case "multiply":
      return (x * y).toString();
    case "divide":
      if (y === 0) return "Error";
      return (x / y).toString();
    default:
      return b;
  }
}

keys.addEventListener("click", (e) => {
  if (!e.target.matches("button")) return;

  const button = e.target;
  const action = button.dataset.action;
  const buttonContent = button.textContent;

  if (action === "number") {
    if (current === "0" || justEvaluated) {
      current = buttonContent;
      justEvaluated = false;
    } else {
      current += buttonContent;
    }
    updateDisplay();
  }

  if (action === "decimal") {
    if (justEvaluated) {
      current = "0.";
      justEvaluated = false;
    } else if (!current.includes(".")) {
      current += ".";
    }
    updateDisplay();
  }

  if (action === "clear") {
    current = "0";
    previous = null;
    operator = null;
    justEvaluated = false;
    exprEl.textContent = "";
    updateDisplay();
  }

  if (action === "sign") {
    if (current === "0") return;
    current = current.startsWith("-") ? current.slice(1) : "-" + current;
    updateDisplay();
  }

  if (action === "percent") {
    const value = parseFloat(current);
    if (!isNaN(value)) {
      current = (value / 100).toString();
      updateDisplay();
    }
  }

  if (action === "operator") {
    const op = button.dataset.operator;

    if (previous !== null && operator && !justEvaluated) {
      // Chain calculation
      current = calculate(previous, current, operator);
      previous = current === "Error" ? null : current;
      updateDisplay();
    } else {
      previous = current;
    }

    operator = op;
    justEvaluated = false;
    exprEl.textContent = `${previous} ${getOperatorSymbol(operator)}`;
    current = "0";
  }

  if (action === "equal") {
    if (operator && previous !== null && !justEvaluated) {
      const expressionStr = `${previous} ${getOperatorSymbol(operator)} ${current} =`;
      const result = calculate(previous, current, operator);

      exprEl.textContent = expressionStr;
      current = result;
      updateDisplay();

      previous = null;
      operator = null;
      justEvaluated = true;
    }
  }
}); 