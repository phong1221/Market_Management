import React, { useState, useEffect } from 'react';
import { fetchPermissionsMatrix, updateRolePermissions } from '../../services/permissionService';
import '../../css/permission.css';

const Permissions = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [rolePermissions, setRolePermissions] = useState({}); // { 'Admin': [1,2], 'Cashier': [1] }
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    // Module Name Mapping for nicer UI
    const moduleNames = {
        'dashboard': 'Tổng quan (Dashboard)',
        'user': 'Quản lý Tài khoản',
        'customer': 'Khách hàng',
        'employee': 'Nhân viên',
        'salary': 'Lương thưởng',
        'product': 'Sản phẩm',
        'category': 'Loại sản phẩm',
        'brand': 'Thương hiệu',
        'provider': 'Nhà cung cấp',
        'import': 'Nhập hàng',
        'pos': 'Bán hàng (POS)',
        'order': 'Đơn hàng',
        'payment': 'Lịch sử thanh toán',
        'promotion': 'Khuyến mãi',
        'coupon': 'Mã giảm giá'
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await fetchPermissionsMatrix();
            if (data.success) {
                setRoles(data.roles);
                setPermissions(data.permissions);
                setRolePermissions(data.rolePermissions);
                if (data.roles.length > 0 && !selectedRole) {
                    // Default NOT selecting Admin if possible, or just first one
                    const nonAdmin = data.roles.find(r => r !== 'Admin');
                    setSelectedRole(nonAdmin || data.roles[0]);
                }
            }
        } catch (error) {
            console.error(error);
            setNotification({ type: 'error', message: 'Lỗi tải dữ liệu phân quyền' });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (permId) => {
        if (selectedRole === 'Admin') return; // Admin is usually immutable or auto-all

        const currentPerms = rolePermissions[selectedRole] || [];
        const isChecked = currentPerms.includes(permId);

        let newPerms;
        if (isChecked) {
            newPerms = currentPerms.filter(id => id !== permId);
        } else {
            newPerms = [...currentPerms, permId];
        }

        setRolePermissions(prev => ({
            ...prev,
            [selectedRole]: newPerms
        }));
    };

    // Special handler for "Module View" toggle
    // If user unchecks "View", we should probably uncheck all others in that module too?
    const handleModuleToggle = (moduleKey, viewPermId, isChecked) => {
        if (selectedRole === 'Admin') return;

        const currentPerms = rolePermissions[selectedRole] || [];
        const modulePerms = permissions.filter(p => p.module === moduleKey);
        const modulePermIds = modulePerms.map(p => Number(p.idPermission));

        let newPerms = [...currentPerms];

        if (isChecked) {
            // Turning ON View: Just add the View permission
            if (!newPerms.includes(viewPermId)) {
                newPerms.push(viewPermId);
            }
        } else {
            // Turning OFF View: Remove ALL permissions for this module
            newPerms = newPerms.filter(id => !modulePermIds.includes(id));
        }

        setRolePermissions(prev => ({
            ...prev,
            [selectedRole]: newPerms
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save ONLY the selected role to be safe/efficient, or loop all implies we edited all.
            // But here the UI focuses on one role. Let's just save the selected role.
            const perms = rolePermissions[selectedRole] || [];
            await updateRolePermissions(selectedRole, perms);

            setNotification({ type: 'success', message: `Đã cập nhật quyền cho vai trò ${selectedRole}` });
        } catch (error) {
            console.error(error);
            setNotification({ type: 'error', message: 'Lỗi khi lưu phân quyền' });
        } finally {
            setSaving(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
    }, {});

    if (loading) return <div className="permission-loading">Đang tải dữ liệu...</div>;

    const currentRolePerms = rolePermissions[selectedRole] || [];

    return (
        <div className="permission-page">
            <div className="permission-header">
                <div>
                    <h1>Quản lý Phân Quyền</h1>
                    <p className="subtitle">Cấu hình chức năng cho từng vai trò người dùng</p>
                </div>
                <div className="role-selector">
                    <label>Chọn vai trò:</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="role-select"
                    >
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            {notification && (
                <div className={`permission-notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="permission-grid">
                {Object.entries(groupedPermissions).map(([module, modulePerms]) => {
                    // Find the 'view' permission for this module to act as Master Toggle
                    const viewAction = modulePerms.find(p => p.action === 'view');
                    const hasAccess = viewAction ? currentRolePerms.includes(Number(viewAction.idPermission)) : false;

                    return (
                        <div key={module} className={`permission-card ${hasAccess ? 'active' : ''}`}>
                            <div className="card-header">
                                <label className="module-toggle">
                                    <input
                                        type="checkbox"
                                        checked={hasAccess}
                                        onChange={(e) => viewAction && handleModuleToggle(module, Number(viewAction.idPermission), e.target.checked)}
                                        disabled={selectedRole === 'Admin'}
                                    />
                                    <span className="module-name">{moduleNames[module] || module.toUpperCase()}</span>
                                </label>
                            </div>

                            {hasAccess && (
                                <div className="card-body">
                                    {modulePerms.filter(p => p.action !== 'view').map(perm => (
                                        <label key={perm.idPermission} className="action-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={currentRolePerms.includes(Number(perm.idPermission))}
                                                onChange={() => handleCheckboxChange(Number(perm.idPermission))}
                                                disabled={selectedRole === 'Admin'}
                                            />
                                            <span className="action-label">{perm.description || perm.action}</span>
                                        </label>
                                    ))}
                                    {modulePerms.filter(p => p.action !== 'view').length === 0 && (
                                        <div className="empty-actions text-muted">Chỉ có quyền xem</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="permission-footer sticky-footer">
                <div className="footer-content">
                    <span>Đang chỉnh sửa quyền cho: <strong>{selectedRole}</strong></span>
                    <button
                        className="permission-save-btn"
                        onClick={handleSave}
                        disabled={saving || selectedRole === 'Admin'}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu Cấu Hình'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Permissions;
