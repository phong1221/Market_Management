import axios from 'axios';

const API_URL = 'http://localhost/Market_Management/backend/api/permission';

export const fetchPermissionsMatrix = async () => {
    try {
        const response = await axios.get(`${API_URL}/getAll.php`);
        return response.data;
    } catch (error) {
        console.error('Error fetching permissions:', error);
        throw error;
    }
};

export const updateRolePermissions = async (role, permissionIds) => {
    try {
        const response = await axios.post(`${API_URL}/update.php`, {
            role,
            permissions: permissionIds
        });
        return response.data;
    } catch (error) {
        console.error('Error updating permissions:', error);
        throw error;
    }
};
