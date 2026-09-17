# Expense Tracker Web Application

A full-stack, responsive web application for managing personal expenses. Built with a modern **Vanilla JavaScript, HTML5, and CSS3** frontend communicating via a RESTful API with a **Django REST Framework** backend and a **MySQL** relational database.

---

## 1. Project Title

**Expense Tracker CRUD Web Application**

---

## 2. Project Overview

The Expense Tracker is a mini web application designed to help users track, manage, and analyze their daily personal expenditures in real time. The application features a decoupled architecture where the user interface operates as a Single Page Application (SPA) style client interacting asynchronously (`fetch` API) with a Django REST Framework backend.

Key highlights:
- **Decoupled Architecture**: Separated frontend client and Django backend REST API.
- **Real-Time Dynamic Metrics**: Summary statistics (Total Spend, Total Entries, Average Expense) calculate automatically.
- **Robust Data Validation**: Dual-layer validation enforcing data integrity on both client and server sides.
- **Relational Data Storage**: Persistent storage in MySQL with Django ORM integration.

---

## 3. Problem Statement

Managing personal finances often becomes challenging without a centralized, intuitive system. Traditional methods—such as paper logs or offline spreadsheets—suffer from several drawbacks:
- Manual entry errors and lack of strict input validation.
- Inability to quickly search or filter transactions by category or title.
- Absence of real-time statistical summaries (e.g., instant calculation of average spending).
- Lack of accessibility across multiple devices via a standard web browser.

This project addresses these issues by offering a web-based CRUD interface with immediate visual feedback, category filtering, search capabilities, and database persistence.

---

## 4. Objectives

- **Full CRUD Capabilities**: Enable users to Create, Read, Update, and Delete expense records seamlessly.
- **RESTful API Integration**: Establish standardized HTTP endpoints for communication between frontend and backend.
- **Interactive UI/UX**: Provide live filtering, search-as-you-type functionality, responsive design, and toast notifications.
- **Data Validation & Integrity**: Guarantee that invalid records (e.g., amounts $\le 0$, missing required fields) are blocked both in the browser and at the API level.
- **Database Persistence**: Store structured expense records reliably using MySQL.

---

## 5. Features

- **Create Expense**: Add new expense entries with title, amount, category, date, and optional description.
- **View Expenses**: Tabular display of all logged expenses ordered by date and creation timestamp.
- **Update Expense**: Edit existing expenses inline; populates the input form into "Editing Mode" and submits updates via HTTP `PATCH`.
- **Delete Expense**: Remove expense entries with a confirmation modal and dynamic UI updates.
- **Search by Title**: Instant client-side search filtering records as the user types into the search box.
- **Filter by Category**: Dropdown filter to view expenses belonging to specific categories (e.g., *Food & Dining*, *Transportation*, *Housing & Utilities*).
- **Client-Side & Server-Side Validation**: Checks for required fields and enforces that expense amounts must be strictly greater than $0.00$.
- **Summary Cards**: Interactive top-level summary displaying **Total Expenses ($)**, **Number of Records**, and **Average Expense ($)**.

---

## 6. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (CSS Variables, Flexbox, CSS Grid), Vanilla JavaScript (ES6+, Fetch API) |
| **Backend** | Python 3.x, Django 5.x, Django REST Framework (DRF), `django-cors-headers` |
| **Database** | MySQL Server 8.x, `PyMySQL` driver |
| **API Testing & Tools** | Postman, Git, GitHub, VS Code |

---

## 7. System Architecture

The application follows a standard multi-tier client-server architecture:

```
[ User Browser ]
       │
       ▼ (HTML / CSS / Vanilla JS)
┌───────────────┐
│   Frontend    │
└───────┬───────┘
        │
        │ HTTP Request / JSON Payload (REST API)
        ▼
┌───────────────┐
│ Django REST   │
│   Framework   │ (Views & Serializers)
└───────┬───────┘
        │
        │ Django ORM / PyMySQL
        ▼
┌───────────────┐
│ MySQL DB      │ (expense_tracker Database)
└───────────────┘
```

1. **User**: Interacts with the browser UI (`index.html`, `style.css`, `script.js`).
2. **Frontend**: Captures user events, performs client validation, renders dynamic DOM elements, and executes asynchronous HTTP `fetch` requests.
3. **REST API**: Exposes JSON endpoints defined in `expenses/urls.py` and handled by `ExpenseViewSet`.
4. **Django Backend**: Processes requests, executes business logic, runs server-side serializer validation (`serializers.py`), and routes operations through Django ORM.
5. **MySQL Database**: Stores records in the `expenses_expense` table within the `expense_tracker` database schema.

---

## 8. Database Design

The database schema consists of an **Expense** entity defined in [`backend/expenses/models.py`](file:///d:/GitHub/ExpenseTracker/backend/expenses/models.py).

### Expense Entity Schema

| Field | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BigAutoField` | Primary Key, Auto-increment | Unique identifier for each expense record |
| `title` | `CharField(200)` | Required, `max_length=200` | Short title/name of the expense |
| `amount` | `DecimalField(10, 2)` | Required, `max_digits=10`, `decimal_places=2` | Monetary value of the expense (must be > 0) |
| `category` | `CharField(100)` | Required, `max_length=100` | Spending category (e.g., Food & Dining, Transportation) |
| `date` | `DateField` | Required | Date when the expense occurred |
| `description` | `TextField` | Optional (`blank=True`, `default=''`) | Detailed notes or description |
| `created_at` | `DateTimeField` | Read-only, `auto_now_add=True` | System timestamp when record was created |

---

## 9. REST API Documentation

Base URL: `http://127.0.0.1:8000/api/expenses/`

### Summary of Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/expenses/` | Retrieve list of all expenses | `200 OK` |
| `POST` | `/api/expenses/` | Create a new expense record | `201 Created` |
| `GET` | `/api/expenses/{id}/` | Retrieve a single expense by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/expenses/{id}/` | Full update of an existing expense | `200 OK` / `400 Bad Request` |
| `PATCH` | `/api/expenses/{id}/` | Partial update of an existing expense | `200 OK` / `400 Bad Request` |
| `DELETE` | `/api/expenses/{id}/` | Delete an expense by ID | `204 No Content` / `404 Not Found` |

---

### Endpoint Specifications

#### 1. List Expenses
- **URL**: `/api/expenses/`
- **Method**: `GET`
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "title": "Grocery Shopping",
      "amount": "125.50",
      "category": "Food & Dining",
      "date": "2026-09-15",
      "description": "Weekly supermarket essentials",
      "created_at": "2026-09-15T10:30:00Z"
    }
  ]
  ```

#### 2. Create Expense
- **URL**: `/api/expenses/`
- **Method**: `POST`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "Electric Bill",
    "amount": 85.20,
    "category": "Housing & Utilities",
    "date": "2026-09-16",
    "description": "Monthly utility payment"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "id": 2,
    "title": "Electric Bill",
    "amount": "85.20",
    "category": "Housing & Utilities",
    "date": "2026-09-16",
    "description": "Monthly utility payment",
    "created_at": "2026-09-16T14:15:00Z"
  }
  ```
- **Error Response (`400 Bad Request`)**:
  ```json
  {
    "amount": ["Amount must be greater than 0."]
  }
  ```

#### 3. Update Expense (Partial)
- **URL**: `/api/expenses/{id}/`
- **Method**: `PATCH`
- **Request Body**:
  ```json
  {
    "amount": 90.00
  }
  ```
- **Success Response (`200 OK`)**: Returns updated expense object.

#### 4. Delete Expense
- **URL**: `/api/expenses/{id}/`
- **Method**: `DELETE`
- **Success Response (`204 No Content`)**: Empty body.

---

## 10. CRUD Operations

| Operation | Frontend Implementation | Backend Implementation |
| :--- | :--- | :--- |
| **Create** | Form submission triggers `handleFormSubmit()` sending `POST` request with JSON payload. | `ExpenseViewSet.create()` deserializes request data, validates fields, and saves new `Expense` model instance. |
| **Read** | `fetchExpenses()` makes `GET` request on page load or state refresh; populates summary cards & table. | `ExpenseViewSet.list()` queries `Expense.objects.all().order_by('-date', '-created_at')` and serializes data. |
| **Update** | `populateFormForEdit()` loads record into form; submit sends `PATCH` payload to `/api/expenses/{id}/`. | `ExpenseViewSet.partial_update()` validates updated fields and applies changes to DB. |
| **Delete** | `confirmAndDeleteExpense()` shows browser confirmation dialog and issues `DELETE` HTTP call. | `ExpenseViewSet.destroy()` deletes target record from MySQL database. |

---

## 11. Validation

The application incorporates strict dual-layer validation to ensure data integrity:

### Client-Side Validation (`frontend/script.js`)
- **Required Fields**: Ensures `title`, `amount`, `category`, and `date` are present before triggering network calls.
- **Positive Amount Check**: Confirms `amount > 0` and is a valid floating-point number.
- **User Feedback**: Displays immediate error banners and toast notifications without refreshing the page.

```javascript
function validateFormData(title, amount, category, date) {
    if (!title) return 'Title is required and cannot be empty.';
    if (!amount || isNaN(amount)) return 'Amount is required and must be a valid number.';
    if (parseFloat(amount) <= 0) return 'Amount must be greater than 0.';
    if (!category) return 'Please select a Category.';
    if (!date) return 'Date is required.';
    return null;
}
```

### Server-Side Validation (`backend/expenses/serializers.py`)
- **DRF Serializer Validation**: Automatically validates data types, maximum string lengths, and required field presence.
- **Custom Amount Validation**: Overrides `validate_amount()` to reject amounts $\le 0$.

```python
class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'category', 'date', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value
```

---

## 12. Testing

The application functionality and API endpoints have been tested across key operational scenarios:

### Tested CRUD Scenarios
1. **Successful Creation**: Adding valid expense entries and verifying UI table update & summary card recalculations.
2. **Retrieval**: Fetching existing records from MySQL on application load.
3. **Inline Update**: Modifying existing record details (e.g., updating amount or category) via Edit mode and confirming database sync.
4. **Deletion**: Deleting entries and verifying removal from both MySQL database and UI table.

### Tested Validation & Edge Case Scenarios
- **Zero / Negative Amount**: Submitting amount as `0` or `-50` triggers validation messages on both frontend banner and server HTTP `400` response.
- **Empty Required Fields**: Submitting form with missing title or date highlights missing fields.
- **Network Error Handling**: Graceful error handling when backend server is unreachable.
- **Postman API Suite**: Executed GET, POST, PATCH, and DELETE calls directly against API endpoints to verify DRF status codes (`200`, `201`, `204`, `400`, `404`).

---

## 13. Project Structure

```
ExpenseTracker/
├── backend/
│   ├── backend/
│   │   ├── __init__.py         # Imports PyMySQL & configures MySQLdb driver
│   │   ├── settings.py         # Django project settings (CORS, Database, DRF)
│   │   ├── urls.py             # Main project URL routing (/api/, /admin/)
│   │   ├── wsgi.py             # WSGI application entry point
│   │   └── asgi.py             # ASGI application entry point
│   ├── expenses/
│   │   ├── migrations/         # Django database migration files
│   │   ├── __init__.py
│   │   ├── admin.py            # Django Admin registration
│   │   ├── apps.py             # Expenses app configuration
│   │   ├── models.py           # Expense database model
│   │   ├── serializers.py      # DRF ExpenseSerializer with custom validation
│   │   ├── tests.py            # Unit tests module
│   │   ├── urls.py             # API route registration (DefaultRouter)
│   │   └── views.py            # ExpenseViewSet providing CRUD logic
│   └── manage.py               # Django management script
├── frontend/
│   ├── index.html              # Main Single-Page HTML structure
│   ├── style.css               # Styling system, responsive grid, card design
│   └── script.js               # Async API requests, DOM rendering, validation logic
├── postman/                    # Postman workspace & environment structure
├── .gitignore                  # Git ignore file (virtualenv, cache, secrets)
├── requirements.txt            # Python dependencies
└── README.md                   # Project documentation
```

---

## 14. Installation and Setup

Follow these step-by-step instructions to set up and run the project locally on **Windows (PowerShell)**.

### Prerequisites
- Python 3.10+ installed
- MySQL Server installed and running locally on port `3306`
- Git installed

---

### Step 1: Clone the Repository
Open PowerShell and navigate to your workspace directory:
```powershell
git clone https://github.com/HARSHINI-R-21/ExpenseTracker.git
cd ExpenseTracker
```

---

### Step 2: Set Up Virtual Environment
Create and activate a Python virtual environment:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

---

### Step 3: Install Dependencies
Install all required Python packages listed in `requirements.txt`:
```powershell
pip install -r requirements.txt
```

---

### Step 4: Configure Database & Environment Variables
1. Ensure MySQL Server is running locally.
2. Open MySQL CLI or Workbench and create the database:
   ```sql
   CREATE DATABASE expense_tracker;
   ```
3. Set your MySQL root password as an environment variable in PowerShell:
   ```powershell
   $env:MYSQL_PASSWORD="your_mysql_password"
   ```
   *(Replace `"your_mysql_password"` with your actual local MySQL root password)*

---

### Step 5: Run Database Migrations
Apply Django migrations to create the required database tables:
```powershell
python backend/manage.py migrate
```

---

### Step 6: Start the Django Development Server
Launch the backend server:
```powershell
python backend/manage.py runserver
```
The Django REST API will now be accessible at `http://127.0.0.1:8000/api/expenses/`.

---

## 15. Running the Application

1. **Keep Backend Running**: Ensure the Django development server is running (`python backend/manage.py runserver`).
2. **Launch Frontend**:
   - Navigate to the `frontend/` folder.
   - Double-click `index.html` or open it in any modern web browser (Google Chrome, Edge, Firefox).
   - Alternatively, use VS Code extension **Live Server** to serve `frontend/index.html`.
3. **Interact with App**: Add, edit, search, filter, or delete expenses directly from the dashboard UI.

---

## 16. Challenges and Solutions

### 1. Windows `mysqlclient` C Extension Compilation Issue
- **Challenge**: Installing `mysqlclient` directly on Windows often fails due to missing C++ Build Tools dependencies.
- **Solution**: Integrated `PyMySQL` (`PyMySQL==1.2.0`) as a pure Python MySQL driver. Configured `pymysql.install_as_MySQLdb()` at the top of `backend/backend/settings.py` (and `backend/backend/__init__.py`), enabling seamless MySQL connectivity without native build compilation errors.

### 2. Cross-Origin Resource Sharing (CORS) Configuration
- **Challenge**: The frontend running via local file path (`file://`) or local server port was blocked by browser CORS policy when issuing `fetch` requests to Django.
- **Solution**: Added `django-cors-headers` middleware (`corsheaders.middleware.CorsMiddleware`) to `MIDDLEWARE` in `settings.py` and enabled `CORS_ALLOW_ALL_ORIGINS = True` for local development.

### 3. Dynamic UI & Summary Synchronization
- **Challenge**: Updating table rows and summary statistic cards without triggering page reloads.
- **Solution**: Implemented central state management in `script.js` (`expensesList` array). Form submissions and deletions trigger background API calls followed by automated re-fetching and DOM re-rendering.

---

## 17. Future Enhancements

- **User Authentication**: Implement JWT or Session authentication to support multi-user accounts and private expense logs.
- **Category Analytics Charts**: Add interactive charts (using Chart.js) to visualize spending breakdown by category.
- **Budget Alerts**: Allow users to set monthly budget thresholds with warning indicators when spending exceeds limits.
- **Data Export**: Add feature to export expense logs as CSV or PDF documents.
- **Pagination**: Implement server-side pagination in DRF for optimized performance with large datasets.

---

## 18. GitHub Repository

- **Repository Link**: [https://github.com/HARSHINI-R-21/ExpenseTracker](https://github.com/HARSHINI-R-21/ExpenseTracker)
- **Clone Command**:
  ```bash
  git clone https://github.com/HARSHINI-R-21/ExpenseTracker.git
  ```

---
*Created as part of a Web Development & Full-Stack Engineering College Project Submission.*
