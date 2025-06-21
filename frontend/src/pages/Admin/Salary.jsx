import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Salary = () => {
  const [salaries, setSalaries] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    idEmployee: '',
    basicSalary: '',
    bonus: '',
    totalSalary: '',
    deduction: '',
    salaryMonth: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [salariesRes, employeesRes] = await Promise.all([
        axios.get('/api/salaries'),
        axios.get('/api/employees')
      ])
      
      setSalaries(salariesRes.data)
      setEmployees(employeesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/salaries', formData)
      setShowForm(false)
      setFormData({
        idEmployee: '',
        basicSalary: '',
        bonus: '',
        totalSalary: '',
        deduction: '',
        salaryMonth: ''
      })
      fetchData()
    } catch (error) {
      console.error('Error creating salary:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi lương này?')) {
      try {
        await axios.delete(`/api/salaries/${id}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting salary:', error)
      }
    }
  }

  const calculateTotalSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0
    const bonus = parseFloat(formData.bonus) || 0
    const deduction = parseFloat(formData.deduction) || 0
    const total = basic + bonus - deduction
    setFormData({...formData, totalSalary: total.toString()})
  }

  useEffect(() => {
    if (formData.basicSalary || formData.bonus || formData.deduction) {
      calculateTotalSalary()
    }
  }, [formData.basicSalary, formData.bonus, formData.deduction])

  if (loading) return <div className="page">Đang tải...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Quản lý lương nhân viên</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Thêm bản ghi lương mới
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Thêm bản ghi lương mới</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Nhân viên:</label>
                <select
                  className="form-input"
                  value={formData.idEmployee}
                  onChange={(e) => setFormData({...formData, idEmployee: e.target.value})}
                  required
                >
                  <option value="">Chọn nhân viên</option>
                  {employees.map(employee => (
                    <option key={employee.idEmployee} value={employee.idEmployee}>
                      {employee.nameEmployee} - {employee.roleEmployee}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Lương cơ bản:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Thưởng:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.bonus}
                  onChange={(e) => setFormData({...formData, bonus: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Khấu trừ:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.deduction}
                  onChange={(e) => setFormData({...formData, deduction: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Tổng lương:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.totalSalary}
                  readOnly
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Tháng lương:</label>
                <input
                  type="month"
                  className="form-input"
                  value={formData.salaryMonth}
                  onChange={(e) => setFormData({...formData, salaryMonth: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Lưu</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nhân viên</th>
              <th>Chức vụ</th>
              <th>Lương cơ bản</th>
              <th>Thưởng</th>
              <th>Khấu trừ</th>
              <th>Tổng lương</th>
              <th>Tháng lương</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((salary) => (
              <tr key={salary.idSalary}>
                <td>{salary.idSalary}</td>
                <td>{employees.find(e => e.idEmployee === salary.idEmployee)?.nameEmployee}</td>
                <td>{employees.find(e => e.idEmployee === salary.idEmployee)?.roleEmployee}</td>
                <td>{salary.basicSalary?.toLocaleString()} VNĐ</td>
                <td>{salary.bonus?.toLocaleString()} VNĐ</td>
                <td>{salary.deduction?.toLocaleString()} VNĐ</td>
                <td>{salary.totalSalary?.toLocaleString()} VNĐ</td>
                <td>{new Date(salary.salaryMonth).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}</td>
                <td>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(salary.idSalary)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Salary 