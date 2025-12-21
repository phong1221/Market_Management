from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'market_management'
}

def get_stats(query, params=None):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        result = cursor.fetchall()
        cursor.close()
        conn.close()
        return result
    except Exception as e:
        print("DB Error:", e)
        return None

@app.route('/api/stats/monthly', methods=['GET'])
def monthly_stats():
    # Group by Month-Year
    query = """
    SELECT 
        DATE_FORMAT(orderDate, '%Y-%m') as period,
        SUM(totalAmount) as revenue,
        COUNT(idOrder) as order_count
    FROM `order`
    WHERE orderDate IS NOT NULL
    GROUP BY period
    ORDER BY period DESC
    LIMIT 12
    """
    data = get_stats(query)
    return jsonify({'success': True, 'data': data if data else []})

@app.route('/api/stats/weekly', methods=['GET'])
def weekly_stats():
    # Group by Week
    query = """
    SELECT 
        DATE_FORMAT(orderDate, '%Y-W%u') as period,
        SUM(totalAmount) as revenue,
        COUNT(idOrder) as order_count
    FROM `order`
    WHERE orderDate >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
    GROUP BY period
    ORDER BY period DESC
    """
    data = get_stats(query)
    return jsonify({'success': True, 'data': data if data else []})

@app.route('/api/stats/daily', methods=['GET'])
def daily_stats():
    # Last 30 days
    query = """
    SELECT 
        DATE_FORMAT(orderDate, '%Y-%m-%d') as period,
        SUM(totalAmount) as revenue,
        COUNT(idOrder) as order_count
    FROM `order`
    WHERE orderDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY period
    ORDER BY period DESC
    """
    data = get_stats(query)
    return jsonify({'success': True, 'data': data if data else []})

@app.route('/api/stats/yearly', methods=['GET'])
def yearly_stats():
    query = """
    SELECT 
        DATE_FORMAT(orderDate, '%Y') as period,
        SUM(totalAmount) as revenue,
        COUNT(idOrder) as order_count
    FROM `order`
    GROUP BY period
    ORDER BY period DESC
    """
    data = get_stats(query)
    return jsonify({'success': True, 'data': data if data else []})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
