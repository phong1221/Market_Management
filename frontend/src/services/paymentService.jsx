import axios from 'axios';

const API_URL = 'http://localhost/market_management/backend/api/payment';

export const fetchPaymentHistory = async () => {
    try {
        const response = await axios.get(`${API_URL}/read_history.php`);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return [];
    }
};
