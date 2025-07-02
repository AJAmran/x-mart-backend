Product Management System
A robust TypeScript-based product management system built with Express and MongoDB, designed for multi-branch retail operations.
Features

Multi-Branch Management: Track inventory and availability across multiple branches
Advanced Filtering: Search products by category, price range, stock levels, and more
Discount System: Apply time-limited and branch-specific discounts
Product Types: Support for regular, promotional, seasonal, and limited edition products
Inventory Control: Automatic stock status updates and low stock alerts
Comprehensive Product Details: Includes dimensions, weight, manufacturer, and SKU tracking


API Endpoints

POST /products: Create new product (Admin only)
GET /products: Get all products with filters
GET /products/:id: Get product by ID
PATCH /products/:id: Update product (Admin only)
DELETE /products/:id: Delete product (Admin only)
GET /products/search/advanced: Advanced product search
GET /products/branch/:branchId: Get products by branch
PATCH /products/:id/update-stock: Update stock (Admin only)
POST /products/:id/apply-discount: Apply discount (Admin only)
DELETE /products/:id/remove-discount: Remove discount (Admin only)
GET /products/categories/main: Get main categories
GET /products/categories/sub: Get subcategories

