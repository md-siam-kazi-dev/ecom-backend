Product Requirements Document (PRD): E-Commerce Backend API
Project Name: E-Commerce Backend API
Version: 1.0 (Initial Draft)
Date: October 2023
Status: In Progress
1. Project Overview
The objective of this project is to build a robust, scalable, and type-safe backend API for an e-commerce platform using Express.js and TypeScript. This initial phase focuses on establishing the core public product endpoints, user dashboard endpoints, and administrative oversight endpoints.
Note: This is a living document. Additional requirements, features, and refinements will be added in subsequent iterations.
2. Technical Stack
Runtime: Node.js
Framework: Express.js
Language: TypeScript
Database: [To be decided: PostgreSQL/MongoDB]
ORM/ODM: [To be decided: Prisma/Mongoose/TypeORM]
Validation: Zod or Joi (for request payload validation)
3. API Specifications
3.1. Public Product Endpoints
GET /api/trending
Fetches a list of currently trending products.
Description: Returns products based on a trending algorithm (e.g., highest views, most sales, or manually curated).
Query Params (Optional): limit (default: 10)
Response:
json
123456789101112
GET /api/product
Fetches all available products.
Description: Returns a paginated list of all products.
Query Params: page (default: 1), limit (default: 20), category (optional), search (optional)
Response:
json
123456789
3.2. User Endpoints
Requires Authentication (User Role)
GET /api/user/:email
Fetches the overview/dashboard data for a specific user.
Description: Returns high-level summary data for the user's profile.
Response:
json
12345678910
3.3. Admin Endpoints
Requires Authentication (Admin Role) & Role-Based Access Control (RBAC)
GET /api/admin/:email
Fetches the overview/dashboard data for an admin.
Description: Returns aggregate platform statistics for the admin dashboard.
Response:
json
12345678910
GET /api/admin/user
Fetches a list of all registered users.
Description: Returns a paginated list of users for administrative oversight.
Query Params: page, limit, search (by name/email)
Response:
json
12345678
GET /api/admin/user/:email
Fetches detailed information for a specific user.
Description: Returns deep-dive analytics and history for a specific user.
Response:
json
12345678910111213
4. Data Models (Proposed)
To support the above endpoints, the following core entities are required:
User: id, email (unique), passwordHash, name, role (enum: 'user', 'admin'), createdAt.
Product: id, name, description, price, category, stock, views (for trending logic), createdAt.
Order: id, userId, totalAmount, status, createdAt.
OrderItem: id, orderId, productId, quantity, priceAtPurchase.
5. Security & Middleware Requirements
Authentication: JWT (JSON Web Tokens) required for /api/user/* and /api/admin/* routes.
Authorization (RBAC): Middleware to check the role claim in the JWT.
/api/user/* requires role: 'user' (or admin).
/api/admin/* strictly requires role: 'admin'.
Rate Limiting: Implement basic rate limiting on public endpoints (/api/trending, /api/product) to prevent abuse.
Input Validation: All query parameters and path parameters (especially :email) must be validated to prevent NoSQL injection or malformed requests.
6. Project Structure (Recommended)
text
1234567891011
7. Milestones & Next Steps
Phase 1: Project Setup & Infrastructure
Initialize Node.js project with TypeScript.
Setup Express server, CORS, and basic error handling middleware.
Setup Database connection and define Data Models.
Phase 2: Public APIs
Implement GET /api/trending (Define trending logic).
Implement GET /api/product with pagination.
Phase 3: Authentication & User APIs
Implement Auth middleware (JWT verification).
Implement GET /api/user/:email.
Phase 4: Admin APIs
Implement RBAC middleware (Admin role check).
Implement GET /api/admin/:email.
Implement GET /api/admin/user.
Implement GET /api/admin/user/:email.
8. Open Questions / Future Scope
To be addressed in future PRD updates:
Exact database technology choice (PostgreSQL vs MongoDB).
How is "trending" calculated? (Time-decay algorithm, simple view count, or manual admin flag?).
Do we need POST, PUT, DELETE endpoints for products and users in the next phase?
Integration with payment gateways (Stripe/PayPal) for orders.
API Versioning (e.g., /api/v1/...).
