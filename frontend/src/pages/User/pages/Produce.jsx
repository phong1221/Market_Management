import React, { useEffect, useState } from 'react';
import { fetchProduct } from '../../../services/productService';

const Produce = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const allProducts = await fetchProduct();
        // Lọc sản phẩm có idType === 1 (rau củ quả)
        const produceProducts = allProducts.filter(p => String(p.idType) === '2' || p.idType === 2);
        setProducts(produceProducts);
      } catch (err) {
        setError('Lỗi khi tải sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  return (
    <div style={{background:'#fff', minHeight:'100vh', padding:'0', fontFamily:'inherit'}}>
      {/* Breadcrumb */}
      <div style={{fontSize:'1rem', color:'#888', padding:'32px 0 0 60px'}}>Shop All / Produce</div>
      {/* Title */}
      <div style={{fontSize:'2.5rem', fontWeight:700, margin:'8px 0 32px 60px'}}>Produce</div>
      <div style={{display:'flex', alignItems:'flex-start', maxWidth:1500, margin:'0 auto', padding:'0 32px'}}>
        {/* Sidebar filter */}
        <aside style={{width:260, minWidth:200, marginRight:32}}>
          <div style={{fontWeight:600, marginBottom:16, fontSize:'1.1rem'}}>Collapse All <span style={{fontWeight:400, fontSize:'1.2em'}}>&#8212;</span></div>
          <div style={{marginBottom:16}}>
            <span style={{background:'#f5f5f5', borderRadius:16, padding:'4px 12px', fontSize:'0.98rem', marginRight:8}}>Produce ×</span>
            <span style={{color:'#0070f3', cursor:'pointer', fontSize:'0.98rem'}}>Reset All &#8635;</span>
          </div>
          <div style={{marginBottom:24}}>
            <div style={{fontWeight:500, marginBottom:8}}>Price</div>
            <input type="range" min={0} max={200000} style={{width:'100%'}} disabled />
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.95rem', color:'#888'}}>
              <span>0$</span><span>200000$</span>
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <div style={{fontWeight:500, marginBottom:8}}>Stock</div>
            <select style={{width:'100%', padding:'6px 8px', borderRadius:6, border:'1px solid #ddd'}} disabled>
              <option>Select an option</option>
            </select>
          </div>
          <div>
            <div style={{fontWeight:500, marginBottom:8}}>Collections</div>
            <div style={{marginBottom:6}}><input type="checkbox" id="fresh" disabled /> <label htmlFor="fresh">Fresh</label></div>
            <div><input type="checkbox" id="seasonal" disabled /> <label htmlFor="seasonal">Seasonal</label></div>
          </div>
        </aside>
        {/* Product grid */}
        <main style={{flex:1}}>
          {loading ? (
            <div style={{textAlign:'center', fontSize:'1.2rem', color:'#888'}}>Đang tải sản phẩm...</div>
          ) : error ? (
            <div style={{textAlign:'center', color:'red'}}>{error}</div>
          ) : products.length === 0 ? (
            <div style={{textAlign:'center', color:'#888'}}>Không có sản phẩm nào thuộc danh mục này.</div>
          ) : (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px,1fr))', gap:32}}>
              {products.map((p, idx) => (
                <div key={p.idProduct || idx} style={{background:'#fafafa', borderRadius:18, boxShadow:'0 2px 12px rgba(0,0,0,0.07)', overflow:'hidden', position:'relative', display:'flex', flexDirection:'column'}}>
                  {/* Nếu có khuyến mãi */}
                  {p.idPromotion && <div style={{position:'absolute', top:16, left:16, background:'#111', color:'#fff', borderRadius:6, padding:'4px 14px', fontWeight:600, fontSize:'1rem', zIndex:2}}>Sale!</div>}
                  <img src={p.picture ? `http://localhost/market_management/backend/uploads/${p.picture}` : ''} alt={p.nameProduct} style={{width:'100%', height:220, objectFit:'cover', borderTopLeftRadius:18, borderTopRightRadius:18}} />
                  <div style={{padding:'18px 20px 20px 20px', flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
                    <div style={{fontWeight:700, fontSize:'1.15rem', marginBottom:6}}>{p.nameProduct}</div>
                    <div style={{fontSize:'1.1rem', color:'#222', fontWeight:600}}>
                      {/* Nếu có giá khuyến mãi, hiển thị giá gạch ngang */}
                      {p.importCost && p.importCost !== p.exportCost && (
                        <span style={{textDecoration:'line-through', color:'#888', fontWeight:400, marginRight:8}}>{p.importCost.toLocaleString()}₫</span>
                      )}
                      {p.exportCost ? p.exportCost.toLocaleString() + '₫' : 'Liên hệ'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Produce; 