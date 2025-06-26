class ImportDetail {
    constructor(idImportDetail,idImport,idProduct,quantity,importPrice,exportPrice,totalPrice,notes,nameProduct) {
        this.idImportDetail = idImportDetail;
        this.idImport = idImport;
        this.idProduct = idProduct;
        this.quantity = quantity;
        this.importPrice = importPrice;
        this.exportPrice = exportPrice;
        this.totalPrice = totalPrice;
        this.notes = notes;
        this.nameProduct = nameProduct;
    }
}
export default ImportDetail;