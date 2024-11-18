---
layout: default
title: API Reference
parent: Technical Documentation
nav_order: 1
permalink: docs/technical/api-reference
---

# API Reference

## Overview

Our REST API provides programmatic access to the Food Bank Inventory Management System. This reference documents all available endpoints and their usage.

**Note:** The API is currently under active development. This documentation reflects the planned API structure and may change as development progresses.

## Authentication

All API requests require authentication using JWT tokens. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-token>
```

## Base URL

```
https://api.foodbank.example.com/v1
```

## Available Endpoints

### Inventory Management

#### List Items

```http
GET /items
```

Query Parameters:
- `category` - Filter by category
- `location` - Filter by location
- `status` - Filter by status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Response:
```json
{
  "items": [
    {
      "id": "item_123",
      "name": "Canned Soup",
      "category": "Canned Goods",
      "quantity": 100,
      "expirationDate": "2024-12-31",
      "location": "Warehouse A",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

#### Add Item

```http
POST /items
```

Request Body:
```json
{
  "name": "Canned Soup",
  "category": "Canned Goods",
  "quantity": 100,
  "expirationDate": "2024-12-31",
  "location": "Warehouse A"
}
```

Response:
```json
{
  "id": "item_123",
  "name": "Canned Soup",
  "category": "Canned Goods",
  "quantity": 100,
  "expirationDate": "2024-12-31",
  "location": "Warehouse A",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Stock Management

#### Update Stock Level

```http
PUT /items/{id}/stock
```

Request Body:
```json
{
  "quantity": 150,
  "reason": "Donation received",
  "notes": "Monthly donation from Local Grocery"
}
```

Response:
```json
{
  "id": "item_123",
  "quantity": 150,
  "previousQuantity": 100,
  "updatedAt": "2024-01-15T10:30:00Z",
  "reason": "Donation received",
  "notes": "Monthly donation from Local Grocery"
}
```

## Rate Limits

- 1000 requests per hour per API token
- Bulk operations count as multiple requests
- Rate limit headers are included in all responses:
  ```
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 999
  X-RateLimit-Reset: 1640995200
  ```

## Error Handling

The API uses standard HTTP response codes:

### Success Codes
- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Request succeeded with no response body

### Client Error Codes
- `400 Bad Request`: Invalid request format or parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Valid authentication but insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded

### Server Error Codes
- `500 Internal Server Error`: Server encountered an error
- `503 Service Unavailable`: Service temporarily unavailable

Error Response Format:
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "quantity": "Must be a positive number"
    }
  }
}
```

## Development Status

This API is currently under development. Features marked with 🚧 are not yet implemented.

## Questions and Support

For questions about the API:
1. Check our [technical documentation](../technical)
2. Open an issue on [GitHub](https://github.com/codevalve/foodbank/issues)
3. Contact us at [contact@example.com]
