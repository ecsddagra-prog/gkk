# API Endpoints Documentation

## Authentication Endpoints

### POST `/api/auth/signup`
User registration
- **Body**: `{ email?, phone?, password, full_name, referred_by? }`
- **Response**: `{ user, auth }`

### POST `/api/auth/login`
User login
- **Body**: `{ email?, phone?, password }`
- **Response**: `{ user, session }`

## Booking Endpoints

### POST `/api/bookings/create`
Create a new booking
- **Body**: 
  ```json
  {
    "user_id": "uuid",
    "service_id": "uuid",
    "city_id": "uuid",
    "address_id": "uuid?",
    "service_address": "string",
    "service_lat": "decimal",
    "service_lng": "decimal",
    "scheduled_date": "datetime?",
    "user_quoted_price": "decimal?"
  }
  ```
- **Response**: `{ booking }`

### POST `/api/bookings/quote`
Submit a quote (user or provider)
- **Body**: 
  ```json
  {
    "booking_id": "uuid",
    "quoted_by": "user|provider",
    "quoted_price": "decimal",
    "message": "string?"
  }
  ```
- **Response**: `{ quote }`

### POST `/api/bookings/accept-quote`
Accept a quote and confirm booking
- **Body**: 
  ```json
  {
    "booking_id": "uuid",
    "quote_id": "uuid",
    "accepted_by": "user|provider"
  }
  ```
- **Response**: `{ message, booking_id, final_price }`

### POST `/api/bookings/complete`
Mark booking as completed
- **Body**: 
  ```json
  {
    "booking_id": "uuid",
    "completed_by": "uuid"
  }
  ```
- **Response**: `{ message, booking_id }`

## Payment Endpoints

### POST `/api/payments/create-order`
Create Razorpay payment order
- **Body**: 
  ```json
  {
    "booking_id": "uuid",
    "amount": "decimal",
    "wallet_used": "decimal?"
  }
  ```
- **Response**: `{ order, payment, wallet_used }`

### POST `/api/payments/verify`
Verify Razorpay payment
- **Body**: 
  ```json
  {
    "razorpay_order_id": "string",
    "razorpay_payment_id": "string",
    "razorpay_signature": "string",
    "booking_id": "uuid?"
  }
  ```
- **Response**: `{ success, message, payment_id }`

## Chat Endpoints

### GET `/api/chat/messages?booking_id=uuid`
Get chat messages for a booking
- **Response**: `{ messages: [...] }`

### POST `/api/chat/messages`
Send a chat message
- **Body**: 
  ```json
  {
    "booking_id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "message": "string"
  }
  ```
- **Response**: `{ message }`

## Rating Endpoints

### POST `/api/ratings/create`
Create a rating and review
- **Body**: 
  ```json
  {
    "booking_id": "uuid",
    "user_id": "uuid",
    "rating": "decimal (1-5)",
    "review_text": "string?",
    "review_photos": "string[]?"
  }
  ```
- **Response**: `{ rating }`

## Provider Endpoints

### POST `/api/providers/location`
Update provider location
- **Body**: 
  ```json
  {
    "provider_id": "uuid",
    "latitude": "decimal",
    "longitude": "decimal"
  }
  ```
- **Response**: `{ provider }`

## Admin Endpoints

All admin endpoints require `Authorization: Bearer <token>` header with admin/superadmin role.

### GET `/api/admin/cities`
Get all cities
- **Response**: `{ cities: [...] }`

### POST `/api/admin/cities`
Create a new city
- **Body**: 
  ```json
  {
    "name": "string",
    "state": "string?",
    "country": "string?",
    "is_active": "boolean?"
  }
  ```
- **Response**: `{ city }`

### PUT `/api/admin/cities`
Update a city
- **Body**: 
  ```json
  {
    "id": "uuid",
    "name": "string?",
    "state": "string?",
    "country": "string?",
    "is_active": "boolean?"
  }
  ```
- **Response**: `{ city }`

### DELETE `/api/admin/cities?id=uuid`
Delete a city
- **Response**: `{ message }`

### GET `/api/admin/services?city_id=uuid?`
Get all services (optionally filtered by city)
- **Response**: `{ services: [...] }`

### POST `/api/admin/services`
Create a new service
- **Body**: 
  ```json
  {
    "category_id": "uuid",
    "name": "string",
    "description": "string?",
    "base_price": "decimal?",
    "min_price": "decimal?",
    "max_price": "decimal?",
    "is_fixed_location": "boolean?",
    "min_radius_km": "decimal?",
    "max_radius_km": "decimal?",
    "is_active": "boolean?"
  }
  ```
- **Response**: `{ service }`

### PUT `/api/admin/services`
Update a service
- **Body**: Same as POST, with `id` field
- **Response**: `{ service }`

### GET `/api/admin/city-services?city_id=uuid`
Get city-service mappings
- **Response**: `{ city_services: [...] }`

### POST `/api/admin/city-services`
Enable/disable service in a city
- **Body**: 
  ```json
  {
    "city_id": "uuid",
    "service_id": "uuid",
    "is_enabled": "boolean"
  }
  ```
- **Response**: `{ city_service }`

### PUT `/api/admin/city-services`
Update city-service mapping
- **Body**: 
  ```json
  {
    "id": "uuid",
    "is_enabled": "boolean"
  }
  ```
- **Response**: `{ city_service }`

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

