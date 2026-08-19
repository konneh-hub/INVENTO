# Inventory Platform

Inventory Platform is a multi-tenant inventory management system under construction. This repository is currently in the **foundation and architecture phase**: it contains runnable application boundaries, shared package boundaries, development tooling, and database infrastructure, but no business functionality.

## Architecture

The monorepo keeps the Business Web, Mobile, Platform Administration, and central API applications independent. The API will own server-side behavior and Prisma will own database access. Shared packages contain only cross-application infrastructure until domain design is approved.

## Technology Stack

- React, Vite, TypeScript, React Router, Tailwind CSS
- React Native, Expo, Expo Router
- Next.js App Router for administration and API
- PostgreSQL and Prisma
- pnpm and Turborepo
- ESLint, Prettier, Docker Compose

## Repository Layout

```text
apps/       web, mobile, admin, api
packages/   types, schemas, permissions, api-client, config, utils, ui
prisma/     schema and migration/seed boundaries
docs/       architecture, database, API, and development notes
```

## Setup

1. Install Node.js 20 or newer and enable pnpm with `corepack enable`.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env`.
4. Start PostgreSQL with `docker compose up -d postgres`.
5. Generate the Prisma client with `pnpm db:generate`.

## Development Commands

- `pnpm dev` starts all development applications through Turborepo.
- `pnpm --filter @inventory/web dev` starts the Vite web app.
- `pnpm --filter @inventory/mobile start` starts Expo.
- `pnpm --filter @inventory/admin dev` starts the administration app.
- `pnpm --filter @inventory/api dev` starts the API app.

## Quality Commands

Run `pnpm build`, `pnpm lint`, `pnpm typecheck`, or `pnpm format:check` from the root.

## Current Scope

No authentication, authorization, tenants, inventory, purchasing, sales, reporting, billing, audit behavior, or business database models have been implemented. Those belong to a later, explicitly designed phase.

---

# Software Requirements Specification

**System:** Multi-Tenant Inventory Management System  
**Document version:** 2.0  
**Status:** Updated and consolidated requirements  
**Date:** 18 August 2026  
**System type:** Web-based multi-tenant inventory management SaaS

> This section defines the intended product requirements. It is a planning artifact only. The current repository remains in the foundation and architecture phase; the requirements below are not yet implemented.

## 1. Introduction

The Inventory Management System (IMS) will be a secure, web-based, multi-tenant SaaS platform for managing products, stock, purchases, sales, suppliers, customers, warehouses, transfers, adjustments, returns, reporting, and inventory operations.

The platform will support multiple independent businesses. A System Admin will manage the platform, while each Business Owner or Manager will administer their own business and users. Tenant isolation will prevent one business from accessing another business's data.

## 2. Purpose

This SRS defines the planned functional, non-functional, security, authentication, authorization, multi-tenancy, data, interface, operational, and acceptance requirements for the IMS. It is intended for stakeholders, analysts, designers, developers, testers, administrators, and maintainers.

## 3. Scope

The planned system includes:

- Platform administration and business registration
- Business owners, business users, invitations, and account activation
- Authentication, authorization, roles, permissions, and tenant isolation
- Products, categories, brands, units, suppliers, customers, warehouses, and locations
- Inventory, stock movements, counts, adjustments, transfers, and expiry tracking
- Purchasing, receiving, sales, issuing, and returns
- Dashboards, reports, analytics, notifications, and audit trails
- Search, filtering, sorting, responsive interfaces, security, backups, and recovery

## 4. Problem Statement

Many organizations manage inventory through notebooks, paper forms, spreadsheets, or disconnected systems. These approaches can produce inaccurate balances, duplicate records, delayed reporting, weak access control, poor auditability, missed low-stock or expiry conditions, and difficulty managing multiple locations.

The proposed platform will centralize inventory operations while improving accuracy, accountability, efficiency, decision-making, and data isolation between businesses.

## 5. Objectives

- Provide a centralized inventory platform.
- Allow businesses to independently register and manage operations.
- Allow Business Owners to create and manage business users.
- Provide secure authentication and role-based authorization.
- Enforce strict tenant isolation.
- Track stock and stock movements accurately.
- Manage purchasing, sales, transfers, adjustments, and returns.
- Monitor low-stock and expiry conditions.
- Provide dashboards, reports, and audit trails.
- Support desktop, tablet, and mobile use.
- Provide a scalable foundation for future SaaS capabilities.

## 6. Definitions and Acronyms

| Term           | Definition                                        |
| -------------- | ------------------------------------------------- |
| IMS            | Inventory Management System                       |
| SaaS           | Software as a Service                             |
| Tenant         | An independent business space within the platform |
| RBAC           | Role-Based Access Control                         |
| SKU            | Stock Keeping Unit                                |
| API            | Application Programming Interface                 |
| CRUD           | Create, Read, Update, Delete                      |
| Stock movement | A transaction that changes inventory quantity     |
| Business Owner | The user who registers and administers a business |
| System Admin   | A platform-level administrator                    |

## 7. Stakeholders

The stakeholders are the platform owner/System Admin, Business Owners and Managers, Inventory Managers, Storekeepers, Purchasing Officers, Sales Officers, Accountants, Auditors, Viewers, developers, testers, and system maintainers.

## 8. Product Overview

The product will use a centralized application with logical tenant separation. The planned hierarchy is:

```text
Platform -> Businesses -> Business Users -> Business Resources
```

The System Admin operates at platform level. Business Owners operate within their own tenant and manage authorized users and business operations.

## 9. Existing-System Context

The target organizations may currently use stock books, paper documents, spreadsheets, receipts, and separate files. A typical manual workflow is: receive products, record products, store products, issue or sell products, manually update stock, conduct stock counts, reconcile differences, and prepare reports.

The primary weaknesses are duplicate product records, inaccurate stock balances, difficult purchase history, delayed sales updates, unauthorized access risk, limited auditability, missed expiry and low-stock conditions, time-consuming reporting, and distributed data storage.

## 10. Proposed System

The platform will provide a shared application with isolated business data. A business will register, receive a Business Owner account, configure its profile, and invite or create employees. Employees will receive business-level roles and permissions.

## 11. Users and Roles

| Role               | Level    | Responsibilities                                                               |
| ------------------ | -------- | ------------------------------------------------------------------------------ |
| System Admin       | Platform | Manage businesses, platform settings, security, monitoring, and platform audit |
| Business Owner     | Business | Administer the business, users, roles, settings, and operations                |
| Business Manager   | Business | Manage business operations and inventory                                       |
| Inventory Manager  | Business | Manage products, stock, warehouses, adjustments, transfers, and reports        |
| Storekeeper        | Business | Receive, issue, count, and transfer stock                                      |
| Purchasing Officer | Business | Manage suppliers and purchase orders                                           |
| Sales Officer      | Business | Manage customers and sales                                                     |
| Accountant         | Business | Review financial and inventory-related reports                                 |
| Auditor            | Business | Read-only access to transactions and audit records                             |
| Viewer             | Business | Read-only access to authorized information                                     |

## 12. Multi-Tenant Business Model

Each registered business will be an independent tenant. Users, memberships, roles, products, inventory, suppliers, customers, warehouses, transactions, reports, and settings will be associated with the appropriate business context.

Tenant isolation must be enforced at authentication, authorization, service, and database-query layers. A user from Business A must never retrieve, modify, delete, export, or infer protected data belonging to Business B.

## 13. Authentication Requirements

- Users shall log in using secure credentials.
- Passwords shall be securely hashed and never stored in plain text.
- The system shall support logout, password change, and password reset.
- Account statuses shall support Pending, Active, Inactive, Suspended, Locked, and Deactivated states.
- Protected resources shall require authentication.
- Authentication shall be followed by authorization and tenant-context checks.
- The identity model should support future MFA, OTP, or passkeys.

## 14. Business Registration

Registration shall validate business and owner information, create the business tenant, and create the initial Business Owner account. Planned fields include business name, registration number, type, industry, contact details, address, location, website, logo, currency, time zone, owner name, owner contact details, and password confirmation.

The business and owner account should be created atomically. The registering person becomes the initial Business Owner.

## 15. User Invitation and Activation

Business Owners and authorized Managers shall create or invite users, assign roles, activate or deactivate users, update profiles, search and filter users, and review activity where permitted.

Invitation tokens shall be unique, securely generated, associated with the correct business and user, time-limited, single-use, and invalidated after activation.

## 16. Authorization and RBAC

The authorization chain will be:

```text
User -> Business Membership -> Role -> Permission -> Resource/Action
```

Permissions shall be granular, platform roles shall be separate from business roles, and every protected API endpoint shall enforce authorization server-side. The frontend shall not be the primary security boundary.

## 17. Functional Requirements

| ID     | Requirement                                                          |
| ------ | -------------------------------------------------------------------- |
| FR-001 | Authenticate registered users securely.                              |
| FR-002 | Authorize users using roles and permissions.                         |
| FR-003 | Allow new businesses to register.                                    |
| FR-004 | Create the initial Business Owner for a registered business.         |
| FR-005 | Allow Business Owners to create or invite users.                     |
| FR-006 | Restrict business users to their authorized tenant.                  |
| FR-007 | Allow System Admins to manage platform-level business status.        |
| FR-008 | Maintain audit records for important security and inventory actions. |
| FR-009 | Maintain accurate inventory balances.                                |
| FR-010 | Provide reports and dashboards.                                      |
| FR-011 | Prevent unauthorized or invalid inventory transactions.              |

## 18. Product Management

Authorized users shall be able to create, view, update, archive, restore, search, and filter products. Planned product data includes product ID, SKU, barcode, name, description, category, brand, unit, purchase price, selling price, reorder level, tax, image, supplier, batch and expiry settings, and status. Product SKU uniqueness should be enforced within a business.

## 19. Inventory Management

The system shall maintain stock balances by product and location. Stock may increase through receiving and approved positive adjustments and decrease through sales, issues, transfers, supplier returns, disposal, and approved negative adjustments. Every stock-changing operation shall create a traceable stock movement record.

## 20. Purchasing and Receiving

Authorized users shall manage purchase orders containing supplier, warehouse, products, quantities, costs, discounts, taxes, totals, dates, notes, and status. A planned lifecycle is `Draft -> Pending Approval -> Approved -> Partially Received -> Received -> Cancelled`. Approved receiving shall update inventory according to received quantities.

## 21. Sales and Issuing

Authorized users shall create sales or issue transactions containing customer, warehouse, products, quantities, prices, discounts, tax, total, payment status, and transaction status. Confirmed fulfillment shall decrease inventory, and the system shall prevent unauthorized negative stock.

## 22. Suppliers and Customers

Business users with permission shall manage supplier names, contacts, addresses, tax information, payment terms, credit information, status, and transaction history. Customer profiles shall support contacts, addresses, credit limits, payment terms, status, and transaction history. Both datasets must be isolated by business.

## 23. Warehouses and Locations

Each business may manage one or more warehouses and locations. Warehouse data may include name, code, address, manager, contacts, and status. Optional hierarchical locations may include zone, aisle, rack, and shelf.

## 24. Stock Transfers, Adjustments, Counts, and Returns

- Stock transfers shall operate only between locations belonging to the same business and record source, destination, products, quantities, requester, approver, receiver, status, dates, and notes.
- Stock adjustments shall include a reason such as count difference, damage, loss, expiry, correction, theft, or opening balance. High-impact adjustments should require approval.
- Stock counts shall support physical-count reconciliation and auditable differences.
- Customer and supplier returns shall classify goods as resalable, damaged, expired, disposed, or returned and reference the original transaction where possible.

## 25. Low Stock and Expiry

The system shall identify products at or below reorder thresholds. For expiry-enabled products, it shall identify expired products and products approaching expiry according to configurable periods.

## 26. Dashboards, Reports, and Analytics

Business dashboards shall display only the authenticated business's information. Planned metrics include products, inventory quantity and value, low-stock and out-of-stock products, expiring products, suppliers, customers, today's sales and purchases, pending orders, and pending transfers.

System Admin dashboards will contain platform-level metrics such as total, active, and suspended businesses, platform users, registrations, platform activity, and system health.

Reports may include current inventory, valuation, stock movement, low-stock, expiry, purchase, sales, warehouse, transfer, adjustment, return, user activity, and audit reports. Reports should support date, status, category, warehouse, supplier, customer, product, and user filters, pagination, and export to PDF, Excel, or CSV where implemented.

## 27. Notifications and Audit Trail

In-app notifications shall support low stock, out of stock, expiry, pending approvals, pending transfers, failed transactions, invitations, and important platform or business events. Email and push notifications may be added later.

Important platform, authentication, business, and inventory actions shall be logged with actor, business context, action, module, affected record, timestamp, result, and relevant before/after values. Audit records shall be protected from ordinary alteration.

## 28. Search, Filtering, and Sorting

Search and filtering shall be available for products, suppliers, customers, users, purchases, sales, transfers, adjustments, and reports. Large datasets shall use pagination.

## 29. Security Requirements

- Use HTTPS in production.
- Hash passwords using a modern password-hashing algorithm.
- Use secure session or token management.
- Enforce authorization server-side.
- Apply rate limiting to authentication-sensitive endpoints.
- Validate and sanitize inputs.
- Protect against injection and common web attacks.
- Use secure cookies where applicable.
- Do not expose secrets in client-side code.
- Log security events and protect tenant boundaries.
- Restrict administrative operations.
- Use database transactions for critical inventory operations.

## 30. Data and Database Requirements

The planned relational database will contain users, businesses, memberships, roles, permissions, products, categories, brands, units, suppliers, customers, warehouses, locations, inventory balances, batches, stock movements, purchases, sales, transfers, adjustments, returns, notifications, audit logs, and system settings.

Every business-owned operational entity shall include an appropriate `business_id`, `tenant_id`, or ownership relationship. Core planned entities include:

```text
users, businesses, business_users, roles, permissions, role_permissions,
products, inventory, stock_movements, suppliers, customers, warehouses,
purchase_orders, purchase_order_items, sales, sale_items, transfers,
transfer_items, adjustments, adjustment_items, returns, return_items,
notifications, audit_logs, system_settings
```

The current Prisma schema intentionally contains no application models.

## 31. System and API Architecture

The target request flow is:

```text
Web/Mobile UI -> Frontend -> API -> Authentication/Authorization
-> Business Services -> Repositories/ORM -> PostgreSQL
```

The central API will expose versioned route groups for authentication, platform administration, businesses, users, roles, permissions, products, inventory, purchases, sales, suppliers, customers, warehouses, transfers, adjustments, returns, reports, notifications, and audit logs. Business APIs must resolve and validate tenant context before returning or modifying data.

## 32. UI/UX and Responsive Requirements

The interfaces shall use consistent navigation, dashboards, tables, forms, dialogs, notifications, loading states, empty states, and error states. Business navigation shall reflect authorized permissions, while Platform Administration shall remain distinct.

The system shall support desktop, laptop, tablet, and mobile layouts. Desktop may use persistent navigation; smaller screens shall use collapsible navigation and mobile-friendly forms, cards, and tables. The UI should follow WCAG-aligned practices including keyboard navigation, labels, readable typography, adequate contrast, accessible controls, and meaningful errors.

## 33. Integration Requirements

Future integrations may include email for invitations and password recovery, barcode and QR scanners, payment gateways, accounting software, cloud storage, SMS and push services, e-commerce/POS platforms, and mobile applications. Integrations must preserve tenant boundaries and associate external data with the correct business.

## 34. Error Handling

The application shall provide clear user-facing errors without exposing sensitive technical details. Planned error cases include invalid credentials, insufficient permissions, duplicate SKU, insufficient stock, invalid business context, expired invitation, suspended business, and failed transactions.

## 35. Backup, Recovery, Performance, and Availability

The system shall support automated database backups, retention policies, secure backup storage, authorized manual backups, tested restoration, disaster recovery, and restricted backup access.

Normal requests should generally respond within approximately one to two seconds under expected load. Pagination, indexing, optimized queries, caching, and background jobs should be used where appropriate. Critical stock operations shall preserve transaction consistency, prevent duplicate changes, handle failures gracefully, and avoid corrupting inventory.

## 36. Privacy and Maintenance

Business and user information shall be accessible only to authorized parties. Sensitive information shall be transmitted securely and protected in backups. The project should maintain modular code, API documentation, database migrations, automated tests, monitoring, security updates, dependency updates, bug fixes, and performance improvements.

## 37. Testing Requirements

Planned testing includes unit, integration, system, authentication, authorization/RBAC, cross-tenant isolation, security, performance/load, responsive UI, user acceptance, and backup/recovery testing. Tenant-isolation testing is mandatory because cross-business data leakage would be a critical security defect.

## 38. Deployment and Operations

The system should support cloud or on-premise deployment with HTTPS, environment configuration, secure database access, logging, monitoring, backups, and controlled release processes.

## 39. Future Enhancements

Potential future enhancements include two-factor authentication, barcode and QR scanning, AI demand forecasting, purchase recommendations, offline mobile inventory, subscription and billing management, advanced analytics, multi-business user memberships, and advanced workflow approvals.

## 40. Business Rules

| ID     | Rule                                                                          |
| ------ | ----------------------------------------------------------------------------- |
| BR-001 | Every business must have a unique identifier.                                 |
| BR-002 | The registering person becomes the initial Business Owner.                    |
| BR-003 | Business users must belong to an authorized business membership.              |
| BR-004 | Users may access only resources permitted by business and role.               |
| BR-005 | System Admin is a platform role and is not automatically a business employee. |
| BR-006 | Business Owners manage their own business users.                              |
| BR-007 | Business data must not be accessible across tenants.                          |
| BR-008 | Product SKU should be unique within a business.                               |
| BR-009 | Stock should not become negative unless an explicit policy permits it.        |
| BR-010 | Every stock adjustment requires a reason.                                     |
| BR-011 | Completed transactions must not be silently edited.                           |
| BR-012 | Important changes must be auditable.                                          |
| BR-013 | Suspended businesses cannot perform normal operations.                        |
| BR-014 | Historical records should follow the data-retention policy.                   |

## 41. Core Workflows

### Business registration

Register business -> validate data -> create business -> create owner -> create membership -> assign owner role -> create defaults -> record audit event -> complete registration -> owner dashboard.

### Business user activation

Owner creates user -> assigns role -> generates invitation -> user activates -> login -> authentication -> membership resolution -> permission authorization -> business dashboard.

### Inventory

Purchase or receive -> increase inventory -> create stock movement -> store or transfer -> sell or issue -> decrease inventory -> audit -> report.

### Authorization

Request -> authenticate -> resolve user -> resolve business context -> check business status -> check membership -> check role and permission -> check resource ownership -> allow or deny.

## 42. Acceptance Criteria

The completed system will be accepted when a Business Owner can register a business, the tenant and owner are created atomically, the owner can authenticate and access the business dashboard, users can be invited and activated, roles restrict functionality, Business A cannot access Business B data, System Admins can manage platform business status, inventory workflows update correctly, reports contain only authorized data, important actions are audited, suspended businesses cannot operate normally, supported layouts work, and critical security and tenant-isolation tests pass.

## 43. Risks and Mitigation

| Risk                        | Impact   | Mitigation                                                          |
| --------------------------- | -------- | ------------------------------------------------------------------- |
| Cross-tenant data leakage   | Critical | Server-side tenant isolation, authorization, and automated tests    |
| Unauthorized account access | High     | Secure authentication, hashing, rate limiting, and session controls |
| Incorrect stock balances    | High     | Transactions, validations, movement ledger, and reconciliation      |
| Registration failure        | High     | Atomic database transaction and rollback                            |
| Data loss                   | High     | Automated backups and tested recovery                               |
| Weak role configuration     | High     | Granular RBAC and permission tests                                  |
| Poor adoption               | Medium   | Simple UI, training, and documentation                              |
| Slow reporting              | Medium   | Indexes, pagination, and background processing                      |

## 44. Assumptions and Constraints

- Businesses have internet access for normal online operation.
- Business Owners are responsible for the accuracy of their data.
- Users receive appropriate roles.
- Database and application infrastructure are maintained securely.
- External services may introduce additional cost or availability dependencies.
- Physical inventory accuracy depends on correct receiving, issuing, and count procedures.

## 45. Recommended Module Structure

### Platform modules

Platform Dashboard, Businesses/Tenants, Platform Users, Platform Roles and Permissions, Platform Settings, Platform Audit Logs, System Monitoring, and future Subscription/Billing.

### Business modules

Business Dashboard, Business Profile and Settings, Business Users, Business Roles and Permissions, Products, Categories/Brands/Units, Inventory, Purchasing, Suppliers, Sales, Customers, Warehouses, Transfers, Adjustments, Returns, Reports, Notifications, and Business Audit Logs.

## 46. Final System Summary

The intended IMS is a secure, multi-tenant SaaS platform in which the System Admin manages the platform and businesses, and each Business Owner manages an isolated business and its users. The central architectural rule is:

```text
Platform -> System Admin -> Business/Tenant -> Business Owner
-> Business Users -> Business Resources
```

Every business resource must be associated with its tenant, and every protected operation must validate authentication, authorization, and tenant ownership.

## 47. Approval

| Role                  | Name               | Signature          | Date       |
| --------------------- | ------------------ | ------------------ | ---------- |
| Project Sponsor       | __________________ | __________________ | __________ |
| Project Manager       | __________________ | __________________ | __________ |
| System Analyst        | __________________ | __________________ | __________ |
| Technical Lead        | __________________ | __________________ | __________ |
| Client Representative | __________________ | __________________ | __________ |

## SRS Status

This SRS documents the planned product direction. It does not change the current implementation scope: the repository remains a foundation and architecture scaffold, and no business functionality has been implemented.
