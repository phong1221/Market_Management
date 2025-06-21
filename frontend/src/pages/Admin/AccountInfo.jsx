// import React, { useEffect, useState } from 'react';

// const AccountInfo = () => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       setUser(JSON.parse(userData));
//     }
//   }, []);

//   if (!user) {
//     return <div className="page">Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.</div>;
//   }

//   return (
//     <div className="page">
//       <div className="account-info-card">
//         <h2>Thông tin tài khoản</h2>
//         <div className="account-info-group">
//           <span className="account-info-label">ID:</span>
//           <span className="account-info-value">{user.idUser}</span>
//         </div>
//         <div className="account-info-group">
//           <span className="account-info-label">Tên đăng nhập:</span>
//           <span className="account-info-value">{user.nameUser}</span>
//         </div>
//         <div className="account-info-group">
//           <span className="account-info-label">Mật khẩu:</span>
//           <span className="account-info-value">{user.passWord}</span>
//         </div>
//         <div className="account-info-group">
//           <span className="account-info-label">Vai trò:</span>
//           <span className="account-info-value">{user.roleUser}</span>
//         </div>
//         {/* Có thể bổ sung các trường khác nếu backend trả về */}
//         <div className="form-actions" style={{ marginTop: 24 }}>
//           <button className="btn btn-warning" disabled>Chỉnh sửa (sắp có)</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AccountInfo; 