
## Notes

## Questions to Auke:
* is there type validation? I heard everything was converted to string - just checking for A6.
  


# **generated with chatGPT, edited and anoted**

| **Test Case ID** | **Test Case Objective** | **Test Case Description** | **Expected Result** |
|-----------------|-------------------------|---------------------------|---------------------|
| **A1** | Connection Test | Attempt to connect to the database and verify that the connection is open without errors. | Successful connection established without errors. |
| **A2** | CRUD Operations Test | Insert a record, retrieve it, update a field, and then delete the record. Verify each step with assertions. | Data is correctly inserted, retrieved, updated, and deleted. |
| **A3** | Data Integrity Test | Attempt to insert data that violates constraints (e.g., foreign key, unique, NOT NULL, **extra objects** ). Try to insert data or commands instead of strings and see if the database parses it. | Database rejects the operation with the correct error. |
| **A4** | Query Performance Test | Execute common or complex queries and measure execution time. | Queries perform within acceptable time limits. |
| **A5** | Transaction Rollback Test | Start a transaction, perform operations, then deliberately cause an error and roll back. | No changes are committed, and data remains unchanged. |
| **A6** | Data Type Validation Test | Attempt to insert data with incorrect types (e.g., string into an integer field). | Operation fails with an appropriate error. |
| **A7** | Indexing Test | Execute queries on indexed and non-indexed columns and compare performance. | Queries on indexed columns perform faster. |
| **A8** | Stored Procedure/Function Test | Execute stored procedures or functions with various inputs and verify output. For example adding a root element and checking if the new UUID's are correctly generated. | Stored procedures and functions return correct results and modify the database as expected. |
| **A9** | Concurrency Control Test | Simulate multiple transactions occurring simultaneously on the same data. | Data consistency is maintained without deadlocks or race conditions. |
| **A10** | Backup and Restore Test | Create a database backup, restore it to a new instance, and verify data integrity. * Probably best done on back-end node or tap test. | All data and configurations are accurately restored. |
||||
| **B1** | End-to-End Data Flow Test | Input data through the UI or API, ensure it is correctly stored in the database, then retrieve it. | Data matches the input and is correctly stored and retrieved. |
| **B2** | API and Database Interaction Test | Perform CRUD operations via the API and verify database reflection. | Database operations match the API requests. |
| **B3** | Data Synchronization Test | Modify data in the database and verify reflection in an external service, or vice versa. | Data is correctly synchronized between the systems. |
| **B4** | Database Trigger Test | Perform operations that should invoke database triggers and verify expected actions. | Triggers execute correctly, performing the expected actions. |
| **B5** | Multi-Database Interaction Test | Perform operations involving multiple databases and verify data consistency. | Data consistency is maintained across all databases. |
| **B6** | Role-Based Access Control (RBAC) Test | Attempt to perform various operations with different user roles. | Permissions are enforced correctly according to role definitions. |
| **B7** | External Service Integration Test | Simulate interactions with an external service that affects the database. | Database is updated correctly based on the external service response. |
| **B8** | Data Migration Test | Migrate data from the old system to the new one and verify data integrity. | All records are transferred accurately, maintaining data integrity. |
| **B9** | Data Consistency in Distributed Systems Test | Perform operations that affect shared data across multiple services. | Data consistency is maintained across all services. |
| **B10** | Batch Processing and Data Integrity Test | Run a scheduled batch job and verify it processes data as expected. | Database is updated correctly without errors or inconsistencies. |
||||
| **C1** | User Registration and Login Test | Simulate user registration, then log in and verify data retrieval and display. | Account is created, login is successful, and user data is correctly displayed. |
| **C2** | Shopping Cart and Checkout Process Test | Add items to the cart, checkout, enter payment details, and complete the purchase. | Order is created in the database, payment is processed, and confirmation is sent. |
| **C3** | Search Functionality and Results Display Test | Enter search terms, verify correct results are fetched and displayed. | Results match the search terms and are displayed accurately. |
| **C4** | Profile Update and Data Persistence Test | Update profile information, save, log out, and verify data persistence. | Updated information is correctly saved and displayed upon re-login. |
| **C5** | File Upload and Retrieval Test | Upload a file, verify storage, and retrieve and display it. | File is correctly stored and can be retrieved and displayed without errors. |
| **C6** | Order Cancellation and Refund Process Test | Place an order, cancel it, and verify database update and refund process. | Order status is updated, payment is refunded, and confirmation is sent. |
| **C7** | Role-Based Access Control Test | Log in with different roles and attempt to access restricted features. | Access is correctly restricted based on user roles. |
| **C8** | Password Reset and Recovery Test | Initiate password reset, set a new password, and verify login. | Password is updated, and the user can log in with the new credentials. |
| **C9** | Data Export and Reporting Test | Generate a report or export data and verify it matches database records. | Report is accurately generated and correctly formatted. |
| **C10** | Multi-Step Form Submission Test | Fill out a multi-step form, save progress, submit, and verify final outcome. | Each step's data is saved correctly, and the final submission triggers the expected result. |
