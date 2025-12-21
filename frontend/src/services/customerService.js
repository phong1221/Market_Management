const API_URL = "http://localhost/market_management/backend/api/customer";

export async function fetchCustomers() {
    try {
        const response = await fetch(`${API_URL}/read.php`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
    }
}

export async function updateCustomer(customer) {
    try {
        const response = await fetch(`${API_URL}/update.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer)
        });
        const data = await response.json();
        return { success: data.success, message: data.message || '' };
    } catch (error) {
        return { success: false, message: 'Error updating customer: ' + error.message };
    }
}

export async function deleteCustomer(id) {
    try {
        const response = await fetch(`${API_URL}/delete.php?id=${id}`);
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Error deleting customer:", error);
        return false;
    }
}
