# User Signup API Documentation

**Version:** 1.0  
**Base URL:** `https://test.bowlersnetwork.com`  
**Last Updated:** February 15, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Validate Signup Data](#1-validate-signup-data)
   - [Send Email Verification Code](#2-send-email-verification-code)
   - [Signup (Create Account)](#3-signup-create-account)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Complete Flow Examples](#complete-flow-examples)
7. [Frontend Integration Guide](#frontend-integration-guide)
8. [Testing](#testing)

---

## Overview

The signup system consists of three main steps:

1. **Validate** - Validate user input before proceeding
2. **Verify** - Send and verify email code (optional but recommended)
3. **Signup** - Create the user account

### Signup Flow Diagram

```
┌─────────────┐
│   Step 1    │
│  User fills │
│ signup form │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ POST /api/access/validate/  │
│      signup-data            │
└──────────┬──────────────────┘
           │
           ├─── Invalid ───► Show errors, let user fix
           │
           └─── Valid ───┐
                         │
                         ▼
              ┌────────────────────────────┐
              │ POST /api/access/send-     │
              │   verification-code        │
              └──────────┬─────────────────┘
                         │
                         │ Email sent with 6-digit code
                         │
                         ▼
              ┌─────────────────────┐
              │ User enters code    │
              │ from email          │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ POST /api/auth/     │
              │      signup         │
              └──────────┬──────────┘
                         │
                         ├─── Invalid code ───► Show error
                         │
                         └─── Success ───► Account created!
```

---

## Authentication

**Pre-Signup APIs:** No authentication required.

**Note:** All endpoints use standard HTTP methods and expect JSON payloads.

---

## API Endpoints

### 1. Validate Signup Data

Validates user signup data before account creation. Use this endpoint to provide real-time validation feedback as the user fills out the form.

#### Endpoint

```
POST /api/access/validate/signup-data
```

#### Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "first_name": "Mumit",
  "last_name": "Prottoy",
  "username": "johndoe",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Request Parameters

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `first_name` | string | Yes | User's first name | Only letters and spaces, will be capitalized |
| `last_name` | string | Yes | User's last name | Only letters and spaces, will be capitalized |
| `username` | string | Yes | Unique username | 4-12 chars, start with letter, letters/numbers/underscore only |
| `email` | string | Yes | User's email address | Valid email format, unique |
| `password` | string | Yes | User's password | Minimum 8 characters |

#### Success Response

**Code:** `200 OK`

```json
{
  "is_valid": true,
  "errors": null
}
```

#### Error Response

**Code:** `400 Bad Request`

```json
{
  "is_valid": false,
  "errors": [
    "First name must contain only letters and spaces.",
    "Username must be between 4 and 12 characters.",
    "Password must be at least 8 characters long."
  ]
}
```

#### Example Request (cURL)

```bash
curl -X POST https://your-domain.com/api/access/validate/signup-data \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Mumit",
    "last_name": "Prottoy",
    "username": "johndoe",
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Example Request (JavaScript)

```javascript
const response = await fetch('/api/access/validate/signup-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    first_name: 'Mumit',
    last_name: 'Prottoy',
    username: 'johndoe',
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();

if (data.is_valid) {
  // Proceed to send verification code
} else {
  // Show validation errors
  console.log(data.errors);
}
```

#### Validation Error Messages

| Error Message | Cause | Fix |
|--------------|-------|-----|
| "First name must contain only letters and spaces." | Invalid characters in first name | Remove numbers/special chars |
| "Last name must contain only letters and spaces." | Invalid characters in last name | Remove numbers/special chars |
| "Username must start with a letter." | Username starts with number/symbol | Start with a letter |
| "Username can only contain letters, numbers and underscores." | Invalid characters in username | Remove special characters except underscore |
| "Username must be between 4 and 12 characters." | Username too short or too long | Adjust length |
| "Username already exists." | Username taken | Choose different username |
| "Invalid email address." | Email format invalid | Check email format |
| "Email already exists." | Email already registered | Use different email or login |
| "Password must be at least 8 characters long." | Password too short | Make password longer |

---

### 2. Send Email Verification Code

Sends a 6-digit verification code to the user's email address. Call this endpoint after successfully validating signup data.

#### Endpoint

```
POST /api/access/send-verification-code
```

#### Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address (will be converted to lowercase) |

#### Success Response

**Code:** `200 OK`

```json
{}
```

**Note:** An empty object indicates success. The verification code has been sent to the provided email address.

#### Error Response

**Code:** `400 Bad Request` (if email is missing or invalid)

```json
{
  "detail": "Email is required."
}
```

#### Example Request (cURL)

```bash
curl -X POST https://your-domain.com/api/access/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

#### Example Request (JavaScript)

```javascript
const response = await fetch('/api/access/send-verification-code', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

if (response.ok) {
  // Code sent successfully
  // Show verification code input to user
  showVerificationForm();
} else {
  // Handle error
  console.error('Failed to send verification code');
}
```

#### Important Notes

- The email will be automatically converted to lowercase
- A 6-digit verification code will be sent to the email
- You can call this endpoint multiple times to resend the code
- The verification code is associated with the email address

---

### 3. Signup (Create Account)

Creates a new user account. This is the final step in the signup process.

#### Endpoint

```
POST /api/auth/signup
```

#### Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "signup_data": {
    "first_name": "Mumit",
    "last_name": "Prottoy",
    "username": "johndoe",
    "email": "user@example.com",
    "password": "password123"
  },
  "verification_code": "453212"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `signup_data` | object | Yes | User signup information |
| `signup_data.first_name` | string | Yes | User's first name |
| `signup_data.last_name` | string | Yes | User's last name |
| `signup_data.username` | string | Yes | Unique username |
| `signup_data.email` | string | Yes | User's email address |
| `signup_data.password` | string | Yes | User's password (will be hashed) |
| `verification_code` | string | No | 6-digit verification code from email |

**Important:** 
- If `verification_code` is `null` or omitted, email verification will be skipped
- For production, it's **strongly recommended** to always require email verification
- Email will be converted to lowercase automatically

#### Success Response

**Code:** `200 OK`

```json
{}
```

**Note:** An empty object indicates success. The user account has been created successfully.

#### Error Responses

##### Validation Error

**Code:** `400 Bad Request`

```json
{
  "errors": [
    "Username must be between 4 and 12 characters.",
    "Password must be at least 8 characters long."
  ]
}
```

##### Invalid Verification Code

**Code:** `401 Unauthorized`

```json
{
  "errors": [
    "Invalid verification code"
  ]
}
```

#### Example Request (cURL)

```bash
curl -X POST https://your-domain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "signup_data": {
      "first_name": "Mumit",
      "last_name": "Prottoy",
      "username": "johndoe",
      "email": "user@example.com",
      "password": "password123"
    },
    "verification_code": "453212"
  }'
```

#### Example Request (JavaScript)

```javascript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    signup_data: {
      first_name: 'Mumit',
      last_name: 'Prottoy',
      username: 'johndoe',
      email: 'user@example.com',
      password: 'password123'
    },
    verification_code: '453212'
  })
});

if (response.ok) {
  // Account created successfully!
  // Redirect to login or dashboard
  window.location.href = '/dashboard';
} else {
  const data = await response.json();
  // Show errors
  console.log(data.errors);
}
```

---

## Data Models

### Signup Data Object

```typescript
interface SignupData {
  first_name: string;   // 1-150 chars, letters and spaces only
  last_name: string;    // 1-150 chars, letters and spaces only
  username: string;     // 4-12 chars, alphanumeric + underscore, starts with letter
  email: string;        // Valid email format
  password: string;     // Minimum 8 characters
}
```

### Validation Response

```typescript
interface ValidationResponse {
  is_valid: boolean;
  errors: string[] | null;
}
```

### Error Response

```typescript
interface ErrorResponse {
  errors: string[];
}
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Meaning | When It Occurs |
|-------------|---------|----------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Validation errors or missing required fields |
| 401 | Unauthorized | Invalid verification code |
| 500 | Internal Server Error | Server-side error (contact support) |

### Error Response Format

All error responses follow this format:

```json
{
  "errors": [
    "Error message 1",
    "Error message 2"
  ]
}
```

or for validation:

```json
{
  "is_valid": false,
  "errors": [
    "Error message 1",
    "Error message 2"
  ]
}
```

### Common Error Scenarios

#### 1. Network Error

```javascript
try {
  const response = await fetch('/api/auth/signup', {...});
} catch (error) {
  console.error('Network error:', error);
  // Show user-friendly message
  alert('Connection error. Please check your internet and try again.');
}
```

#### 2. Validation Errors

```javascript
const data = await response.json();
if (!response.ok && data.errors) {
  // Display each error to the user
  data.errors.forEach(error => {
    showErrorMessage(error);
  });
}
```

#### 3. Invalid Verification Code

```javascript
if (response.status === 401) {
  // Wrong verification code
  alert('Invalid verification code. Please check your email and try again.');
  // Clear the code input
  document.getElementById('code-input').value = '';
}
```

---

## Complete Flow Examples

### Recommended Flow (With Email Verification)

```javascript
// Step 1: Validate signup data
async function validateSignupData(formData) {
  const response = await fetch('/api/access/validate/signup-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  const data = await response.json();
  return data;
}

// Step 2: Send verification code
async function sendVerificationCode(email) {
  const response = await fetch('/api/access/send-verification-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  return response.ok;
}

// Step 3: Create account
async function signup(signupData, verificationCode) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signup_data: signupData,
      verification_code: verificationCode
    })
  });
  
  return response;
}

// Complete flow
async function handleSignup() {
  const formData = {
    first_name: document.getElementById('firstName').value,
    last_name: document.getElementById('lastName').value,
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };
  
  // Step 1: Validate
  const validation = await validateSignupData(formData);
  
  if (!validation.is_valid) {
    displayErrors(validation.errors);
    return;
  }
  
  // Step 2: Send verification code
  const codeSent = await sendVerificationCode(formData.email);
  
  if (!codeSent) {
    alert('Failed to send verification code');
    return;
  }
  
  // Show verification code input
  showVerificationForm();
  
  // Step 3: Wait for user to enter code, then signup
  // (This happens when user submits verification form)
}

// When user submits verification code
async function handleVerification() {
  const code = document.getElementById('verificationCode').value;
  
  const response = await signup(storedSignupData, code);
  
  if (response.ok) {
    // Success! Redirect to dashboard
    window.location.href = '/dashboard';
  } else {
    const data = await response.json();
    if (response.status === 401) {
      alert('Invalid verification code. Please try again.');
    } else {
      displayErrors(data.errors);
    }
  }
}
```

### Alternative Flow (Without Email Verification)

```javascript
async function handleSignupWithoutVerification() {
  const formData = {
    first_name: document.getElementById('firstName').value,
    last_name: document.getElementById('lastName').value,
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };
  
  // Step 1: Validate
  const validation = await validateSignupData(formData);
  
  if (!validation.is_valid) {
    displayErrors(validation.errors);
    return;
  }
  
  // Step 2: Signup without verification code
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signup_data: formData,
      verification_code: null  // or omit this field
    })
  });
  
  if (response.ok) {
    window.location.href = '/dashboard';
  } else {
    const data = await response.json();
    displayErrors(data.errors);
  }
}
```

---

## Frontend Integration Guide

### React Example

```jsx
import { useState } from 'react';

function SignupForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState([]);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    // Step 1: Validate
    const validationResponse = await fetch('/api/access/validate/signup-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const validationData = await validationResponse.json();

    if (!validationData.is_valid) {
      setErrors(validationData.errors);
      setLoading(false);
      return;
    }

    // Step 2: Send verification code
    const codeResponse = await fetch('/api/access/send-verification-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email })
    });

    if (codeResponse.ok) {
      setShowVerification(true);
    } else {
      setErrors(['Failed to send verification code']);
    }

    setLoading(false);
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signup_data: formData,
        verification_code: verificationCode
      })
    });

    if (response.ok) {
      window.location.href = '/dashboard';
    } else {
      const data = await response.json();
      setErrors(data.errors);
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <form onSubmit={handleVerification}>
        <h2>Verify Your Email</h2>
        <p>Enter the 6-digit code sent to {formData.email}</p>
        
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="000000"
          maxLength={6}
          required
        />

        {errors.map((error, i) => (
          <div key={i} className="error">{error}</div>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>

      <input
        type="text"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        placeholder="First Name"
        required
      />

      <input
        type="text"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        placeholder="Last Name"
        required
      />

      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
        required
      />

      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />

      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />

      {errors.map((error, i) => (
        <div key={i} className="error">{error}</div>
      ))}

      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

### Vue.js Example

```vue
<template>
  <div>
    <!-- Signup Form -->
    <form v-if="!showVerification" @submit.prevent="handleSubmit">
      <h2>Sign Up</h2>

      <input v-model="formData.first_name" placeholder="First Name" required />
      <input v-model="formData.last_name" placeholder="Last Name" required />
      <input v-model="formData.username" placeholder="Username" required />
      <input v-model="formData.email" type="email" placeholder="Email" required />
      <input v-model="formData.password" type="password" placeholder="Password" required />

      <div v-for="error in errors" :key="error" class="error">{{ error }}</div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Processing...' : 'Sign Up' }}
      </button>
    </form>

    <!-- Verification Form -->
    <form v-else @submit.prevent="handleVerification">
      <h2>Verify Your Email</h2>
      <p>Enter the 6-digit code sent to {{ formData.email }}</p>

      <input 
        v-model="verificationCode" 
        placeholder="000000" 
        maxlength="6" 
        required 
      />

      <div v-for="error in errors" :key="error" class="error">{{ error }}</div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Verifying...' : 'Verify Email' }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: ''
      },
      verificationCode: '',
      errors: [],
      loading: false,
      showVerification: false
    };
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      this.errors = [];

      // Validate
      const validationResponse = await fetch('/api/access/validate/signup-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.formData)
      });

      const validationData = await validationResponse.json();

      if (!validationData.is_valid) {
        this.errors = validationData.errors;
        this.loading = false;
        return;
      }

      // Send code
      const codeResponse = await fetch('/api/access/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.formData.email })
      });

      if (codeResponse.ok) {
        this.showVerification = true;
      } else {
        this.errors = ['Failed to send verification code'];
      }

      this.loading = false;
    },

    async handleVerification() {
      this.loading = true;
      this.errors = [];

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signup_data: this.formData,
          verification_code: this.verificationCode
        })
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await response.json();
        this.errors = data.errors;
        this.loading = false;
      }
    }
  }
};
</script>
```

---

## Testing

### Test Cases

#### 1. Validate Signup Data

```javascript
// Test Case 1: Valid data
const validData = {
  first_name: "John",
  last_name: "Doe",
  username: "johndoe",
  email: "john@example.com",
  password: "password123"
};
// Expected: { is_valid: true, errors: null }

// Test Case 2: Invalid username (too short)
const invalidUsername = {
  first_name: "John",
  last_name: "Doe",
  username: "joe",  // Only 3 characters
  email: "john@example.com",
  password: "password123"
};
// Expected: { is_valid: false, errors: ["Username must be between 4 and 12 characters."] }

// Test Case 3: Multiple errors
const multipleErrors = {
  first_name: "John123",  // Invalid characters
  last_name: "Doe",
  username: "joe",  // Too short
  email: "invalid-email",  // Invalid format
  password: "pass"  // Too short
};
// Expected: { is_valid: false, errors: [...] }
```

#### 2. Send Verification Code

```javascript
// Test Case 1: Valid email
const validEmail = {
  email: "test@example.com"
};
// Expected: 200 OK, empty object

// Test Case 2: Email with uppercase
const uppercaseEmail = {
  email: "TEST@EXAMPLE.COM"
};
// Expected: 200 OK (email converted to lowercase automatically)
```

#### 3. Signup

```javascript
// Test Case 1: Valid signup with verification
const validSignup = {
  signup_data: {
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "password123"
  },
  verification_code: "123456"
};
// Expected: 200 OK, account created

// Test Case 2: Invalid verification code
const invalidCode = {
  signup_data: { /* valid data */ },
  verification_code: "000000"  // Wrong code
};
// Expected: 401 Unauthorized, { errors: ["Invalid verification code"] }

// Test Case 3: Signup without verification (if allowed)
const noVerification = {
  signup_data: { /* valid data */ },
  verification_code: null
};
// Expected: 200 OK (if verification is optional)
```

### Testing Tools

#### Postman Collection

```json
{
  "info": {
    "name": "Signup API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Validate Signup Data",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"first_name\": \"Mumit\",\n  \"last_name\": \"Prottoy\",\n  \"username\": \"johndoe\",\n  \"email\": \"user@example.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/access/validate/signup-data",
          "host": ["{{base_url}}"],
          "path": ["api", "access", "validate", "signup-data"]
        }
      }
    },
    {
      "name": "Send Verification Code",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"user@example.com\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/access/send-verification-code",
          "host": ["{{base_url}}"],
          "path": ["api", "access", "send-verification-code"]
        }
      }
    },
    {
      "name": "Signup",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"signup_data\": {\n    \"first_name\": \"Mumit\",\n    \"last_name\": \"Prottoy\",\n    \"username\": \"johndoe\",\n    \"email\": \"user@example.com\",\n    \"password\": \"password123\"\n  },\n  \"verification_code\": \"123456\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/auth/signup",
          "host": ["{{base_url}}"],
          "path": ["api", "auth", "signup"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "https://your-domain.com"
    }
  ]
}
```

---

## Frequently Asked Questions

### Q: Is email verification required?

**A:** No, the `verification_code` field is optional. However, it's strongly recommended to implement email verification in production for security reasons.

### Q: How long is the verification code valid?

**A:** The verification code validity period is determined by the backend. Contact the backend team for specific details.

### Q: Can I resend the verification code?

**A:** Yes, you can call the `/api/access/send-verification-code` endpoint multiple times to resend the code to the same email.

### Q: What happens if validation fails during signup?

**A:** Even though you validated before sending the verification code, the signup endpoint validates again. This ensures data integrity. You should display the returned errors to the user.

### Q: Are passwords stored securely?

**A:** Yes, passwords are hashed on the backend using Django's secure password hashing before being stored in the database.

### Q: Is the email case-sensitive?

**A:** No, emails are automatically converted to lowercase on the backend.

### Q: What if the user enters the wrong verification code?

**A:** The signup endpoint will return a 401 Unauthorized status with an error message. The user can try again with the correct code or request a new code.

---

## Support & Contact

For questions or issues regarding this API:

- **Backend Team:** backend@your-domain.com
- **API Issues:** Report via your project management tool
- **Documentation Updates:** Request via your communication channel

---

**Last Updated:** February 15, 2026  
**API Version:** 1.0