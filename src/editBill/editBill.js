
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const billId = urlParams.get('id');

    if (!billId) {
        console.error('No bill ID found in URL');
        alert('No bill ID found');
        return;
    }

    fetch(`http://localhost:3000/bills/${billId}`)
        .then(response => response.json())
        .then(data => populateForm(data))
        .catch(error => {
            console.error('Error fetching bill details:', error);
            alert('Failed to fetch bill details');
        });

    document.getElementById('editBillForm').addEventListener('submit', function (event) {
        event.preventDefault();
        updateBill(billId);
    });
});

function populateForm(billData) {
    document.getElementById('billNo').value = billData.bill_no;
    document.getElementById('date').value = new Date(billData.date).toISOString().split('T')[0];
    document.getElementById('receiver').value = billData.receiver;

    const billItemsBody = document.getElementById('bill-items');
    billItemsBody.innerHTML = ''; // Clear existing rows
    billData.bill_items.forEach(item => {
        addRow(item);
    });

    updateTotalAmount();
}

function addRow(item = {}) {
    const table = document.getElementById('bill-items');
    const newRow = table.insertRow();

    const srNoCell = newRow.insertCell(0);
    const particularsCell = newRow.insertCell(1);
    const qtyCell = newRow.insertCell(2);
    const rateCell = newRow.insertCell(3);
    const amountCell = newRow.insertCell(4);

    srNoCell.innerHTML = `<input type="text" class="form-control" value="${item.sr_no || ''}">`;
    particularsCell.innerHTML = `<input type="text" class="form-control" value="${item.particulars || ''}">`;
    qtyCell.innerHTML = `<input type="number" class="form-control" value="${item.qty || ''}" oninput="updateAmount(this)">`;
    rateCell.innerHTML = `<input type="number" class="form-control" value="${item.rate || ''}" oninput="updateAmount(this)">`;
    amountCell.innerHTML = `<input type="number" class="form-control" value="${item.amount || ''}" readonly>`;
}

function updateAmount(element) {
    const row = element.closest('tr');
    const qty = parseFloat(row.cells[2].querySelector('input').value) || 0;
    const rate = parseFloat(row.cells[3].querySelector('input').value) || 0;
    const amount = qty * rate;
    row.cells[4].querySelector('input').value = amount.toFixed(2);
    updateTotalAmount();
}

function updateTotalAmount() {
    const rows = document.getElementById('bill-items').rows;
    let totalAmount = 0;
    for (let i = 0; i < rows.length; i++) {
        const amount = parseFloat(rows[i].cells[4].querySelector('input').value) || 0;
        totalAmount += amount;
    }
    document.getElementById('totalAmount').value = totalAmount.toFixed(2);
}

function updateBill(billId) {
    const billData = {
        bill_no: document.getElementById('billNo').value,
        date: document.getElementById('date').value,
        receiver: document.getElementById('receiver').value,
        bill_items: []
    };

    const rows = document.getElementById('bill-items').rows;
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;
        const item = {
            sr_no: cells[0].querySelector('input').value,
            particulars: cells[1].querySelector('input').value,
            qty: parseInt(cells[2].querySelector('input').value),
            rate: parseFloat(cells[3].querySelector('input').value),
            amount: parseFloat(cells[4].querySelector('input').value)
        };
        billData.bill_items.push(item);
    }

    fetch(`http://localhost:3000/bills/${billId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(billData)
    })
        .then(response => {
            if (response.ok) {
                alert('Bill updated successfully');
                window.location.href = '/src/allEntries/bills.html'; // Adjust the path as needed
            } else {
                alert('Failed to update bill');
            }
        })
        .catch(error => {
            console.error('Error updating bill:', error);
            alert('Failed to update bill');
        });
}