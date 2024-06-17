document.addEventListener('DOMContentLoaded', function () {
    fetchBillList();
});

// Function to fetch bill list from server
function fetchBillList() {
    fetch('http://localhost:3000/bills')
        .then(response => response.json())
        .then(data => {
            const billList = document.getElementById('billList');
            billList.innerHTML = ''; // Clear existing content

            data.forEach(bill => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${bill.bill_no}</td>
                <td>${bill.receiver}</td>
                <td>${new Date(bill.date).toLocaleDateString()}</td>
                <td>${bill.total_amount}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="viewBillDetails(${bill.id})">View Details</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBill(${bill.id})">Delete</button>
                </td>
            `;
                billList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching bill list:', error);
        });
}

// Function to view bill details
function viewBillDetails(billId) {
    console.log('View details for bill:', billId);
    // Redirect to home page after viewing details (adjust URL as per your setup)
    window.location.href = `/src/bill-details/bill-details.html?id=${billId}`; // Replace with your home page URL
}

// Function to delete bill from database
function deleteBill(billId) {
    console.log('Delete bill:', billId);
    // Confirm deletion
    if (confirm('Are you sure you want to delete this bill?')) {
        fetch(`http://localhost:3000/bills/${billId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('Bill deleted successfully!');
                    // Optionally, update the UI after deletion (reload the bill list or remove the row)
                    fetchBillList(); // Assuming fetchBillList() updates the bill list
                } else {
                    throw new Error('Failed to delete bill');
                }
            })
            .catch(error => {
                console.error('Error deleting bill:', error);
                alert('Failed to delete bill');
            });
    }
}

// Function to delete all bills
function deleteAllBills() {
    console.log('Delete all bills');
    // Confirm deletion
    if (confirm('Are you sure you want to delete all bills?')) {
        fetch(`http://localhost:3000/bills`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('All bills deleted successfully!');
                    // Optionally, update the UI after deletion (reload the bill list)
                    fetchBillList(); // Assuming fetchBillList() updates the bill list
                } else {
                    throw new Error('Failed to delete all bills');
                }
            })
            .catch(error => {
                console.error('Error deleting all bills:', error);
                alert('Failed to delete all bills');
            });
    }
}
