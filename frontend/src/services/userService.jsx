const API_URL = "http://localhost/market_management/backend/api/user/getUser.php";
const API_URL_ADD = "http://localhost/market_management/backend/api/user/addUser.php";
const API_URL_UPDATE = "http://localhost/market_management/backend/api/user/updateUser.php";
const API_URL_DELETE = "http://localhost/market_management/backend/api/user/deleteUser.php";
import User from '../models/user';

export async function fetchUser() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.data.map(item => new User(item.idUser, item.nameUser, item.passWord, item.roleUser));
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return [];
    }
}

export async function addUser(user) {
    try {
        const response = await fetch(API_URL_ADD, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const data = await response.json();
        return { success: data.success, message: data.message || '', idUser: data.idUser };
    } catch (error) {
        return { success: false, message: 'Lỗi khi thêm người dùng: ' + error.message };
    }
}

export async function updateUser(user) {
    try {
        const response = await fetch(API_URL_UPDATE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const data = await response.json();
        return { success: data.success, message: data.message || '' };
    } catch (error) {
        return { success: false, message: 'Lỗi khi cập nhật người dùng: ' + error.message };
    }
}

export async function deleteUser(idUser) {
    try {
        const response = await fetch(`${API_URL_DELETE}?idUser=${idUser}`);
        const data = await response.json();
        return data.success;
    } catch (error) {
        return false;
    }
}
