# GitHub Token and Webhook Secret Security Design

## 1. Security Requirements

The LivingDocs GitHub Integration module handles sensitive
authentication and integration data, including:

- GitHub OAuth2 Access Tokens
- GitHub Webhook Secrets
- API Keys
- Encryption Keys

These sensitive values must not be exposed to the Web Client,
source code repository, application logs, or error messages.

The security design must provide:

- Confidentiality of sensitive information.
- Integrity of GitHub webhook requests.
- Secure communication through HTTPS/TLS.
- Encryption of sensitive values stored in PostgreSQL.
- Controlled access to decrypted secrets.

## 2. HTTPS/TLS Communication

All communication involving sensitive GitHub integration data
must use HTTPS with TLS.

The following communication channels must be protected:

1. Web Client to LivingDocs Backend.
2. LivingDocs Backend to GitHub API.
3. GitHub to LivingDocs Webhook Endpoint.

Plain HTTP must not be used for production communication.

The system should reject or redirect insecure HTTP requests
and require HTTPS for all production endpoints.

## 3. GitHub Access Token Encryption

GitHub Access Tokens must not be stored in plaintext in PostgreSQL.

Before storing an Access Token, the LivingDocs Backend encrypts
the token using a strong symmetric encryption algorithm.

AES-256-GCM is selected as the encryption mechanism for sensitive
GitHub credentials.

AES-256-GCM provides:

- Confidentiality of the Access Token.
- Integrity protection for encrypted data.
- Authentication of the encrypted data.

The encryption process is performed before the token is stored
in PostgreSQL.

Only the encrypted ciphertext is stored in the database.
The plaintext Access Token must never be stored in PostgreSQL.
GitHub Access Token
        │
        ▼
LivingDocs Backend
        │
        │ AES-256-GCM
        ▼
Encrypted Access Token
        │
        ▼
PostgreSQL

## 4. Secure Storage in PostgreSQL

The encrypted GitHub Access Token is stored in the Connection
data associated with the GitHub account.

The database should store the encrypted token and the metadata
required for decryption and token management.

Example fields include:

- connection_id
- github_user_id
- encrypted_access_token
- token_nonce
- created_at
- updated_at

The plaintext Access Token must never be stored in the database.

## 5. Encryption Key Management

The encryption key used to encrypt GitHub Access Tokens must be
stored separately from PostgreSQL.

The encryption key must never be:

- Stored in PostgreSQL.
- Hard-coded in source code.
- Committed to GitHub.
- Written to application logs.
- Returned to the Web Client.

The Backend must obtain the encryption key from a secure secret
management mechanism, such as Docker Secrets or a dedicated
Secret Manager. The encryption key must be injected into the
Backend at runtime and must not be stored in the application
source code or PostgreSQL database.

Only authorized backend components should have access to the
encryption key.



                Secret Manager
                        │
                        │ Encryption Key
                        ▼
                LivingDocs Backend
                 │              │
                 │ Encrypt      │ Decrypt
                 ▼              ▼
              ┌─────────────────────┐
              │     PostgreSQL      │
              │                     │
              │ encrypted_token     │
              └─────────────────────┘

## 6. The encryption key is obtained from the configured secure secret management mechanism.

GitHub Webhook Secrets are sensitive credentials used to verify
that incoming webhook requests originate from GitHub.

The Webhook Secret must not be exposed to the Web Client,
source code repository, application logs, or API responses.

The Webhook Secret must be encrypted before being stored in
PostgreSQL using the same secure encryption mechanism defined
for GitHub Access Tokens.

When a webhook request is received, the LivingDocs Backend
performs the following steps:

1. Receive the webhook request through HTTPS/TLS.
2. Read the repository identifier and GitHub event information.
3. Retrieve the encrypted Webhook Secret associated with the repository.
4. Decrypt the Webhook Secret in backend memory.
5. Verify the `X-Hub-Signature-256` header.
6. Reject the request if the signature is invalid.
7. Accept and process the webhook if the signature is valid.
8. Remove sensitive secret data from memory after processing.

The Webhook Secret must never be returned to the Web Client or
included in application logs.

GitHub
   │
   │ HTTPS/TLS
   │ Webhook + X-Hub-Signature-256
   ▼
LivingDocs Backend
   │
   │ Retrieve encrypted secret
   ▼
PostgreSQL
   │
   │ encrypted webhook secret
   ▼
LivingDocs Backend
   │
   │ Decrypt in memory
   ▼
Verify X-Hub-Signature-256
   │
   ├───────────────┐
   │               │
 Valid           Invalid
   │               │
   ▼               ▼
Process          Reject
Webhook          Request

## 7. Logging and Access Control

Sensitive GitHub credentials must never be written to application
logs.

The following information must not appear in logs:

- GitHub Access Tokens
- GitHub Webhook Secrets
- API Keys
- Encryption Keys

Application logs should contain only non-sensitive information
required for monitoring and troubleshooting, such as:

- Connection ID
- Repository ID
- GitHub event type
- Operation status
- Error code
- Timestamp

Access to decrypted tokens and Webhook Secrets must be restricted
to authorized backend components.

The Web Client must never receive:

- GitHub Access Tokens
- Webhook Secrets
- Encryption Keys

Role-based access control and service-level authorization should
be applied to sensitive operations.

## 8. Ensure that the decrypted Webhook Secret is not persisted or exposed after request processing.

The secure GitHub Access Token lifecycle consists of the following
steps:

1. The user initiates GitHub OAuth2 authentication.
2. GitHub authenticates the user and returns an authorization code.
3. LivingDocs exchanges the authorization code for an Access Token.
4. The Backend encrypts the Access Token using AES-256-GCM.
5. Only the encrypted token is stored in PostgreSQL.
6. The encryption key is obtained from the secure Secret Manager.
7. When access to GitHub is required, the Backend decrypts the
   token only in memory.
8. The decrypted token is used to communicate with GitHub through
   HTTPS/TLS.
9. The token is never returned to the Web Client.
10. The token is never written to application logs.

User
 │
 │ OAuth2
 ▼
GitHub
 │
 │ Access Token
 ▼
LivingDocs Backend
 │
 │ AES-256-GCM
 ▼
Encrypted Token
 │
 ▼
PostgreSQL

Encryption Key
 │
 ▼
Secret Manager
 │
 ▼
LivingDocs Backend

## 9. Security Requirements Checklist

| Security Requirement | Design Solution |
|---|---|
| Secure communication | HTTPS/TLS |
| GitHub Access Token protection | AES-256-GCM encryption |
| Webhook Secret protection | AES-256-GCM encryption |
| Plaintext token in PostgreSQL | Not allowed |
| Plaintext Webhook Secret in PostgreSQL | Not allowed |
| Encryption Key in PostgreSQL | Not allowed |
| Encryption Key in source code | Not allowed |
| Sensitive data in application logs | Not allowed |
| Token returned to Web Client | Not allowed |
| Webhook authentication | X-Hub-Signature-256 verification |
| Key management | Secure Secret Manager |
| Backend access | Role-based/service-level authorization |

