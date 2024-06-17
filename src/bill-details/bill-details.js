// Function to fetch bill details and populate the page
// Function to fetch bill details and populate the page

// Example of how to call this function when the document is ready
$(document).ready(function() {
    calculateTotalAmount();
    console.log("Doc ready")
});


document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const billId = urlParams.get('id');
    let total = 0

    fetch(`http://localhost:3000/bills/${billId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('billNo').textContent = data.bill_no;
            document.getElementById('billDate').textContent = new Date(data.date).toLocaleDateString();
            document.getElementById('receiverName').textContent = data.receiver;
            document.getElementById('totalAmount').textContent = data.total_amount;

            const billItems = data.bill_items;
            const billItemsBody = document.getElementById('billItems');
            billItems.forEach(item => {
                // Ensure rate and amount are converted to numbers
                const rate = parseFloat(item.rate);
                const amount = parseFloat(item.amount);
                total +=amount;

                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${item.sr_no}</td>
                <td>${item.particulars}</td>
                <td>${item.qty}</td>
                <td>${isNaN(rate) ? '-' : rate.toFixed(2)}</td>
                <td>${isNaN(amount) ? '-' : amount.toFixed(2)}</td>
            `;
                billItemsBody.appendChild(row);
            });
            $('#totalAmount').text(total.toFixed(2)); // Assuming 2 decimal places for currency
        })
        .catch(error => {
            console.error('Error fetching bill details:', error);
            // Handle error, e.g., display an alert
            alert('Failed to fetch bill details');
        });
});

// Function to redirect to edit page
function editBill() {
    const urlParams = new URLSearchParams(window.location.search);
    const billId = urlParams.get('id');
    window.location.href = `/src/editBill/editBill.html?id=${billId}`;
}

// Function to print the bill (basic example)
function printBill() {
    window.print();
}

