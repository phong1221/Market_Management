const API_BASE = 'http://localhost/market_management/backend/api/order';
const API_GET = `${API_BASE}/getOrder.php`;
const API_GET_USER_ORDERS = `${API_BASE}/getUserOrders.php`;
const API_UPDATE = `${API_BASE}/updateOrder.php`;
const API_DELETE = `${API_BASE}/deleteOrder.php`;

export async function fetchOrders() {
  try {
    const res = await fetch(API_GET);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    return [];
  }
}

export async function fetchUserOrders(idUser) {
  if (!idUser) {
    console.error('fetchUserOrders: idUser is missing');
    return [];
  }
  
  // Validate idUser is a number
  const numericId = parseInt(idUser, 10);
  if (isNaN(numericId) || numericId <= 0) {
    console.error('fetchUserOrders: Invalid idUser:', idUser);
    return [];
  }
  
  try {
    const url = `${API_GET_USER_ORDERS}?idUser=${numericId}`;
    console.log('fetchUserOrders: Calling API:', url);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error('fetchUserOrders: HTTP error:', res.status, res.statusText);
      const text = await res.text();
      console.error('fetchUserOrders: Response text:', text);
      return [];
    }
    
    const data = await res.json();
    
    console.log('fetchUserOrders: API response:', data);
    console.log('fetchUserOrders: Response success:', data.success);
    console.log('fetchUserOrders: Response data type:', typeof data.data);
    console.log('fetchUserOrders: Response data is array:', Array.isArray(data.data));
    
    if (data.success && Array.isArray(data.data)) {
      console.log('fetchUserOrders: Found', data.data.length, 'orders');
      if (data.data.length > 0) {
        console.log('fetchUserOrders: First order:', data.data[0]);
      }
      return data.data;
    }
    
    if (data.success && !data.data) {
      console.warn('fetchUserOrders: Success but no data field');
      return [];
    }
    
    if (!data.success) {
      console.error('fetchUserOrders: API returned error:', data.message);
    }
    
    console.warn('fetchUserOrders: No orders found or invalid response');
    return [];
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
    console.error('Error stack:', error.stack);
    return [];
  }
}

export async function updateOrder(orderDTO) {
  if (!orderDTO?.idOrder) {
    return { success: false, message: 'Thiếu idOrder' };
  }

  try {
    const response = await fetch(API_UPDATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderDTO)
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error('Phản hồi không phải JSON:', text);
      return { success: false, message: 'Phản hồi server không hợp lệ' };
    }

    return data || { success: false, message: 'Không có phản hồi từ server' };
  } catch (error) {
    console.error('Lỗi khi cập nhật đơn hàng:', error);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function deleteOrder(idOrder) {
  if (!idOrder) {
    return { success: false, message: 'Thiếu idOrder' };
  }

  try {
    const response = await fetch(`${API_DELETE}?id=${idOrder}`, {
      method: 'DELETE'
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error('Phản hồi không phải JSON:', text);
      return { success: false, message: 'Phản hồi server không hợp lệ' };
    }

    return data || { success: false, message: 'Không có phản hồi từ server' };
  } catch (error) {
    console.error('Lỗi khi xóa đơn hàng:', error);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}
