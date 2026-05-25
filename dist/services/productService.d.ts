import { TProduct } from "../interface/productInterface";
export declare const ProductService: {
    createProduct: (payload: TProduct) => Promise<TProduct>;
    getAllProducts: (filters: any, options: any) => Promise<{
        data: TProduct[];
        meta: import("../repositories/product.repository").PaginationMeta;
    }>;
    getProductById: (id: string) => Promise<TProduct>;
    updateProduct: (id: string, payload: Partial<TProduct>) => Promise<TProduct>;
    deleteProduct: (id: string) => Promise<TProduct>;
    updateStock: (id: string, stock: number) => Promise<TProduct>;
    applyDiscount: (id: string, discount: any) => Promise<TProduct>;
    removeDiscount: (id: string) => Promise<TProduct>;
};
