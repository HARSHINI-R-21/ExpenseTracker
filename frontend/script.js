/**
 * Expense Tracker Frontend Application Script
 * Plain Vanilla JavaScript implementation for REST API communication,
 * CRUD operations, client-side validation, search/filtering, and responsive UI updates.
 */

'use strict';

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api/expenses/';

// Application State
let expensesList = []; // Holds all expense records retrieved from backend
let isEditMode = false;
let editingExpenseId = null;
let toastTimeoutId = null;

// DOM Element References
const formElement = document.getElementById('expense-form');
const expenseIdInput = document.getElementById('expense-id');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');
const descriptionInput = document.getElementById('description');
const formTitleElement = document.getElementById('form-title');
const formModeBadge = document.getElementById('form-mode-badge');
const submitBtn = document.getElementById('submit-btn');
const submitBtnText = document.getElementById('submit-btn-text');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const formErrorBanner = document.getElementById('form-error');

const summaryTotalAmount = document.getElementById('summary-total-amount');
const summaryTotalCount = document.getElementById('summary-total-count');
const summaryAverageAmount = document.getElementById('summary-average-amount');

const searchInput = document.getElementById('search-input');
const filterCategorySelect = document.getElementById('filter-category');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const displayedCountBadge = document.getElementById('displayed-count-badge');

const tableBody = document.getElementById('expense-table-body');
const loadingSpinner = document.getElementById('loading-spinner');
const emptyStateContainer = document.getElementById('empty-state');
const emptyStateText = document.getElementById('empty-state-text');
const toastBanner = document.getElementById('toast');

// Initialize application on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Set default date input to today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Attach event listeners
    formElement.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', resetFormState);
    searchInput.addEventListener('input', renderFilteredExpenses);
    filterCategorySelect.addEventListener('change', renderFilteredExpenses);
    resetFiltersBtn.addEventListener('click', resetFilters);
    tableBody.addEventListener('click', handleTableActionClick);

    // Initial fetch of expenses from API
    fetchExpenses();
});

/**
 * Fetch all expenses from the Django REST API (GET endpoint).
 */
async function fetchExpenses() {
    showLoading(true);
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Handle DRF standard list response or paginated results if any
        expensesList = Array.isArray(data) ? data : (data.results || []);
        
        // Update summary cards and table
        updateDashboardSummary();
        renderFilteredExpenses();
    } catch (error) {
        console.error('Error fetching expenses:', error);
        showToast('Failed to load expenses from server. Please verify backend is running.', 'error');
        expensesList = [];
        updateDashboardSummary();
        renderTable([]);
    } finally {
        showLoading(false);
    }
}

/**
 * Filter and render expenses based on title search and category filter.
 */
function renderFilteredExpenses() {
    const searchQuery = searchInput.value.trim().toLowerCase();
    const selectedCategory = filterCategorySelect.value;

    const filtered = expensesList.filter(expense => {
        const matchesTitle = expense.title.toLowerCase().includes(searchQuery);
        const matchesCategory = (selectedCategory === 'ALL') || (expense.category === selectedCategory);
        return matchesTitle && matchesCategory;
    });

    displayedCountBadge.textContent = `Showing ${filtered.length} of ${expensesList.length} entries`;
    renderTable(filtered);
}

/**
 * Render the expense list in the HTML table.
 * @param {Array} expenses - Array of expense objects to render
 */
function renderTable(expenses) {
    tableBody.innerHTML = '';

    if (expenses.length === 0) {
        emptyStateContainer.classList.remove('hidden');
        if (expensesList.length === 0) {
            emptyStateText.textContent = 'No expense records available. Add a new expense using the form on the left.';
        } else {
            emptyStateText.textContent = 'No expenses match your search or filter criteria.';
        }
        return;
    }

    emptyStateContainer.classList.add('hidden');

    expenses.forEach(expense => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', expense.id);

        const formattedAmount = `$${parseFloat(expense.amount).toFixed(2)}`;
        const formattedDate = formatDateDisplay(expense.date);
        const descriptionText = expense.description ? escapeHtml(expense.description) : '<span class="text-muted">—</span>';

        tr.innerHTML = `
            <td>#${expense.id}</td>
            <td><strong>${escapeHtml(expense.title)}</strong></td>
            <td class="td-amount">${formattedAmount}</td>
            <td><span class="category-badge">${escapeHtml(expense.category)}</span></td>
            <td>${formattedDate}</td>
            <td class="td-desc" title="${escapeHtml(expense.description || '')}">${descriptionText}</td>
            <td class="td-actions">
                <div class="action-buttons">
                    <button type="button" class="btn btn-sm btn-edit" data-action="edit" data-id="${expense.id}">Edit</button>
                    <button type="button" class="btn btn-sm btn-delete" data-action="delete" data-id="${expense.id}">Delete</button>
                </div>
            </td>
        `;

        tableBody.appendChild(tr);
    });
}

/**
 * Update the summary statistics cards (Total, Count, Average).
 */
function updateDashboardSummary() {
    const totalCount = expensesList.length;
    const totalSum = expensesList.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const average = totalCount > 0 ? totalSum / totalCount : 0;

    summaryTotalAmount.textContent = `$${totalSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    summaryTotalCount.textContent = totalCount;
    summaryAverageAmount.textContent = `$${average.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Handle form submission for creating or updating an expense.
 * @param {Event} e - Submit event
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    hideFormError();

    // Extract form input values
    const title = titleInput.value.trim();
    const amountVal = amountInput.value.trim();
    const category = categorySelect.value;
    const date = dateInput.value;
    const description = descriptionInput.value.trim();

    // Client-side validation
    const validationError = validateFormData(title, amountVal, category, date);
    if (validationError) {
        showFormError(validationError);
        showToast(validationError, 'error');
        return;
    }

    const amountFloat = parseFloat(amountVal);

    // Payload construction
    const payload = {
        title: title,
        amount: amountFloat,
        category: category,
        date: date,
        description: description
    };

    setSubmitButtonLoading(true);

    try {
        let response;
        if (isEditMode && editingExpenseId) {
            // PATCH request to update existing expense
            const updateUrl = `${API_BASE_URL}${editingExpenseId}/`;
            response = await fetch(updateUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } else {
            // POST request to create a new expense
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        }

        const data = await response.json();

        if (response.ok) {
            const successMsg = isEditMode ? 'Expense updated successfully!' : 'Expense added successfully!';
            showToast(successMsg, 'success');
            resetFormState();
            await fetchExpenses();
        } else {
            // Display DRF backend validation errors if any
            let errorMsg = 'Failed to save expense.';
            if (typeof data === 'object') {
                const messages = [];
                for (const field in data) {
                    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
                    messages.push(`${fieldName}: ${Array.isArray(data[field]) ? data[field].join(' ') : data[field]}`);
                }
                if (messages.length > 0) {
                    errorMsg = messages.join(' | ');
                }
            }
            showFormError(errorMsg);
            showToast(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showFormError('Network error. Unable to connect to server.');
        showToast('Network error. Unable to connect to server.', 'error');
    } finally {
        setSubmitButtonLoading(false);
    }
}

/**
 * Perform client-side validation on form input fields.
 * @returns {string|null} Error message or null if valid
 */
function validateFormData(title, amount, category, date) {
    if (!title) {
        return 'Title is required and cannot be empty.';
    }
    if (!amount || isNaN(amount)) {
        return 'Amount is required and must be a valid number.';
    }
    if (parseFloat(amount) <= 0) {
        return 'Amount must be greater than 0.';
    }
    if (!category) {
        return 'Please select a Category.';
    }
    if (!date) {
        return 'Date is required.';
    }
    return null;
}

/**
 * Handle clicks on table action buttons (Edit & Delete) using event delegation.
 * @param {Event} e - Click event
 */
function handleTableActionClick(e) {
    const target = e.target;
    if (!target.matches('button[data-action]')) return;

    const action = target.getAttribute('data-action');
    const id = parseInt(target.getAttribute('data-id'), 10);

    if (isNaN(id)) return;

    if (action === 'edit') {
        populateFormForEdit(id);
    } else if (action === 'delete') {
        confirmAndDeleteExpense(id);
    }
}

/**
 * Populate form with data of the expense to edit and switch form to Edit Mode.
 * @param {number} id - Expense ID
 */
function populateFormForEdit(id) {
    const expense = expensesList.find(item => item.id === id);
    if (!expense) {
        showToast('Expense record not found.', 'error');
        return;
    }

    isEditMode = true;
    editingExpenseId = id;
    expenseIdInput.value = expense.id;

    titleInput.value = expense.title;
    amountInput.value = expense.amount;
    categorySelect.value = expense.category;
    dateInput.value = expense.date;
    descriptionInput.value = expense.description || '';

    // Update UI elements for Edit Mode
    formTitleElement.textContent = `Edit Expense (#${id})`;
    formModeBadge.textContent = 'Editing Mode';
    formModeBadge.className = 'badge badge-edit';
    submitBtnText.textContent = 'Save Changes';
    cancelEditBtn.classList.remove('hidden');

    hideFormError();
    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Delete an expense record after user confirmation (DELETE endpoint).
 * @param {number} id - Expense ID to delete
 */
async function confirmAndDeleteExpense(id) {
    const expense = expensesList.find(item => item.id === id);
    const title = expense ? expense.title : `ID #${id}`;

    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
        return;
    }

    try {
        const deleteUrl = `${API_BASE_URL}${id}/`;
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok || response.status === 204) {
            showToast('Expense deleted successfully!', 'success');
            if (isEditMode && editingExpenseId === id) {
                resetFormState();
            }
            await fetchExpenses();
        } else {
            showToast('Failed to delete expense. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        showToast('Network error while deleting expense.', 'error');
    }
}

/**
 * Reset form fields and switch back to Create Mode.
 */
function resetFormState() {
    isEditMode = false;
    editingExpenseId = null;
    expenseIdInput.value = '';

    formElement.reset();
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    formTitleElement.textContent = 'Add Expense';
    formModeBadge.textContent = 'New Entry';
    formModeBadge.className = 'badge badge-create';
    submitBtnText.textContent = 'Add Expense';
    cancelEditBtn.classList.add('hidden');

    hideFormError();
}

/**
 * Reset search input and category filter dropdown.
 */
function resetFilters() {
    searchInput.value = '';
    filterCategorySelect.value = 'ALL';
    renderFilteredExpenses();
}

/**
 * Display inline validation or backend error message inside the form card.
 * @param {string} msg - Error message text
 */
function showFormError(msg) {
    formErrorBanner.textContent = msg;
    formErrorBanner.classList.remove('hidden');
}

/**
 * Hide inline form error message banner.
 */
function hideFormError() {
    formErrorBanner.textContent = '';
    formErrorBanner.classList.add('hidden');
}

/**
 * Display toast notification feedback (Success, Error, Info).
 * @param {string} message - Message text to show
 * @param {string} type - 'success' | 'error' | 'info'
 */
function showToast(message, type = 'success') {
    if (toastTimeoutId) {
        clearTimeout(toastTimeoutId);
    }

    toastBanner.textContent = message;
    toastBanner.className = `toast toast-${type}`;
    toastBanner.classList.remove('hidden');

    toastTimeoutId = setTimeout(() => {
        toastBanner.classList.add('hidden');
    }, 4000);
}

/**
 * Toggle loading spinner state.
 * @param {boolean} isLoading 
 */
function showLoading(isLoading) {
    if (isLoading) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

/**
 * Toggle submit button loading state.
 * @param {boolean} isLoading 
 */
function setSubmitButtonLoading(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
        submitBtnText.textContent = isEditMode ? 'Saving...' : 'Adding...';
    } else {
        submitBtnText.textContent = isEditMode ? 'Save Changes' : 'Add Expense';
    }
}

/**
 * Utility function to sanitize strings and prevent XSS.
 * @param {string} str 
 * @returns {string} Sanitized string
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Format YYYY-MM-DD date into localized date string.
 * @param {string} dateString 
 * @returns {string} Formatted date
 */
function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const cleanDateStr = String(dateString).split('T')[0];
    const parts = cleanDateStr.split('-');
    if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return `${month}/${day}/${year}`;
    }
    return dateString;
}
