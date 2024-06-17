function addRow() {
    const table = document.getElementById('bill-items');
    const newRow = table.insertRow();
    for (let i = 0; i < 5; i++) {
        const cell = newRow.insertCell(i);
        if (i === 4 || i === 2 || i === 3) {
            cell.innerHTML = '<input type="number" class="form-control" oninput="calculateAmount(this)">';
        } else {
            cell.innerHTML = '<input type="text" class="form-control">';
        }
        if (i === 4) {
            cell.innerHTML = '<input type="number" class="form-control" readonly>';
        }
    }
}

function calculateAmount(element) {
    const row = element.closest('tr');
    const qty = row.cells[2].querySelector('input').value;
    const rate = row.cells[3].querySelector('input').value;
    const amountCell = row.cells[4].querySelector('input');
    const amount = qty * rate;
    amountCell.value = amount;
    calculateTotal();
}

function calculateTotal() {
    const rows = document.querySelectorAll('#bill-items tr');
    let total = 0;
    rows.forEach(row => {
        const amount = row.cells[4].querySelector('input').value;
        total += parseFloat(amount) || 0;
    });
    document.getElementById('totalAmount').value = total;
}

function clearForm() {
    document.getElementById('billForm').reset();
    const rows = document.querySelectorAll('#bill-items tr');
    rows.forEach(row => {
        row.remove();
    });
    // Add a default row after clearing
    addRow();
}

document.getElementById('billForm').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('Form submitted');  // Debugging line

    const billNo = document.getElementById('billNo').value;
    const date = document.getElementById('date').value;
    const receiver = document.getElementById('receiver').value;

    const items = [];
    const rows = document.querySelectorAll('#bill-items tr');
    rows.forEach(row => {
        const srNo = row.cells[0].querySelector('input').value;
        const particulars = row.cells[1].querySelector('input').value;
        const qty = row.cells[2].querySelector('input').value;
        const rate = row.cells[3].querySelector('input').value;
        const amount = row.cells[4].querySelector('input').value;

        items.push({ srNo, particulars, qty, rate, amount });
    });

    console.log('Data to be sent:', { billNo, date, receiver, items });  // Debugging line

    fetch('http://localhost:3000/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ billNo, date, receiver, items }),
    })
    .then(response => {
        if (response.status === 409) {
            throw new Error('Bill number already exists');
        }
        return response.text();
    })
    .then(data => {
        clearForm();
        alert(data);
    })
    .catch(error => {
        alert(error.message);
    });
});
