class Product {
    constructor(idProduct, nameProduct, picture, descriptionProduct, idProvider, amountProduct, idType, importCost, exportCost, idPromotion, idBrand) {
        this.idProduct = idProduct;
        this.nameProduct = nameProduct;
        this.picture = picture;
        this.descriptionProduct = descriptionProduct;
        this.idProvider = idProvider;
        this.amountProduct = amountProduct;
        this.idType = idType;
        this.importCost = importCost;
        this.exportCost = exportCost;
        this.idPromotion = idPromotion;
        this.idBrand = idBrand;
    }
}

export default Product;