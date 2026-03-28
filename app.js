// Application State
class BucketListManager {
    constructor() {
        this.goals = [];
        this.currentFilter = 'all';
        this.currentCategoryFilter = 'all';
        this.searchQuery = '';
        this.init();
    }

    // Initialize the app
    init() {
        this.loadGoalsFromStorage();
        this.loadThemePreference();
        this.cacheDOMElements();
        this.attachEventListeners();
        this.render();
    }

    // Cache DOM elements
    cacheDOMElements() {
        this.goalInput = document.getElementById('goalInput');
        this.categorySelect = document.getElementById('categorySelect');
        this.targetDateInput = document.getElementById('targetDateInput');
        this.addBtn = document.getElementById('addBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearchBtn');
        this.goalList = document.getElementById('goalList');
        this.emptyState = document.getElementById('emptyState');
        this.goalCounter = document.getElementById('goalCounter');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.categoryFilterButtons = document.querySelectorAll('.category-filter-btn');
        this.helpOverlay = document.getElementById('helpOverlay');
        this.closeHelpBtn = document.getElementById('closeHelpBtn');
    }

    // Attach event listeners
    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addGoal());
        this.goalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addGoal();
        });

        this.filterButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        this.categoryFilterButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => this.setCategoryFilter(e.target.dataset.category));
        });

        // Download button listener
        this.downloadBtn.addEventListener('click', () => this.exportGoals());

        // Search input listeners
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.clearSearchBtn.addEventListener('click', () => this.clearSearch());
        // Allow Escape to clear search
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.clearSearch();
        });

        // Theme toggle listener
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Help overlay listeners
        this.closeHelpBtn.addEventListener('click', () => this.toggleHelpOverlay());
        this.helpOverlay.addEventListener('click', (e) => {
            // Close overlay when clicking outside the modal
            if (e.target === this.helpOverlay) {
                this.toggleHelpOverlay();
            }
        });
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl+N to focus new goal input
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            this.goalInput.focus();
            this.goalInput.select();
            return;
        }

        // Ctrl+F to focus search input
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            this.searchInput.focus();
            this.searchInput.select();
            return;
        }

        // Escape to clear filters and search
        if (e.key === 'Escape') {
            // Only handle if not in an input field
            if (document.activeElement !== this.goalInput && 
                document.activeElement !== this.searchInput &&
                document.activeElement !== this.targetDateInput) {
                e.preventDefault();
                this.clearSearch();
                this.currentFilter = 'all';
                this.currentCategoryFilter = 'all';
                this.filterButtons.forEach((btn) => {
                    btn.classList.toggle('active', btn.dataset.filter === 'all');
                });
                this.categoryFilterButtons.forEach((btn) => {
                    btn.classList.toggle('active', btn.dataset.category === 'all');
                });
                this.render();
            }
            return;
        }

        // ? to show help overlay
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
            e.preventDefault();
            this.toggleHelpOverlay();
            return;
        }
    }

    // Toggle help overlay
    toggleHelpOverlay() {
        this.helpOverlay.classList.toggle('hidden');
        if (!this.helpOverlay.classList.contains('hidden')) {
            // Prevent background from scrolling when overlay is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // Add a new goal
    addGoal() {
        const title = this.goalInput.value.trim();

        if (!title) {
            return;
        }

        const goal = {
            id: Date.now().toString(),
            title,
            category: this.categorySelect.value,
            targetDate: this.targetDateInput.value || null,
            achieved: false,
            createdAt: new Date().toISOString(),
        };

        this.goals.unshift(goal);
        this.saveGoalsToStorage();
        this.goalInput.value = '';
        this.categorySelect.value = 'Personal';
        this.targetDateInput.value = '';
        this.render();
    }

    // Toggle goal achievement status
    toggleGoalAchievement(id) {
        const goal = this.goals.find((g) => g.id === id);
        if (goal) {
            goal.achieved = !goal.achieved;
            this.saveGoalsToStorage();
            this.render();
        }
    }

    // Delete a goal with animation
    deleteGoal(id) {
        const goalElement = this.goalList.querySelector(`[data-id="${id}"]`);
        if (goalElement) {
            // Add deleting class to trigger animation
            goalElement.classList.add('deleting');
            
            // Wait for animation to complete before removing from DOM
            setTimeout(() => {
                this.goals = this.goals.filter((g) => g.id !== id);
                this.saveGoalsToStorage();
                this.render();
            }, 300);
        } else {
            // Fallback if element not found
            this.goals = this.goals.filter((g) => g.id !== id);
            this.saveGoalsToStorage();
            this.render();
        }
    }

    // Handle search input
    handleSearch(query) {
        this.searchQuery = query;
        this.updateClearButtonVisibility();
        this.render();
    }

    // Clear search
    clearSearch() {
        this.searchQuery = '';
        this.searchInput.value = '';
        this.updateClearButtonVisibility();
        this.searchInput.focus();
        this.render();
    }

    // Update clear button visibility
    updateClearButtonVisibility() {
        if (this.searchQuery.trim()) {
            this.clearSearchBtn.classList.add('visible');
        } else {
            this.clearSearchBtn.classList.remove('visible');
        }
    }

    // Set the current filter
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    // Set the current category filter
    setCategoryFilter(category) {
        this.currentCategoryFilter = category;
        this.categoryFilterButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        this.render();
    }

    // Get filtered goals based on current filter, category filter, and search query
    getFilteredGoals() {
        let filtered = this.goals;

        // Apply status filter
        switch (this.currentFilter) {
            case 'not-started':
                filtered = filtered.filter((g) => !g.achieved);
                break;
            case 'achieved':
                filtered = filtered.filter((g) => g.achieved);
                break;
            case 'all':
            default:
                break;
        }

        // Apply category filter
        if (this.currentCategoryFilter !== 'all') {
            filtered = filtered.filter((g) => g.category === this.currentCategoryFilter);
        }

        // Apply search filter (case-insensitive)
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter((g) => g.title.toLowerCase().includes(query));
        }

        return filtered;
    }

    // Update goal counter
    updateCounter() {
        const achieved = this.goals.filter((g) => g.achieved).length;
        const total = this.goals.length;
        this.goalCounter.textContent = `${achieved} of ${total}`;
    }

    // Render the goal list
    render() {
        const filteredGoals = this.getFilteredGoals();
        this.updateCounter();

        // Clear the goal list
        this.goalList.innerHTML = '';

        // Show empty state if no goals
        if (filteredGoals.length === 0) {
            this.emptyState.classList.remove('hidden');
            // Update empty state message based on context
            const emptyMessage = this.emptyState.querySelector('.empty-state-text');
            if (this.searchQuery.trim()) {
                emptyMessage.textContent = '🔍 No matching goals found.';
            } else if (this.currentFilter === 'achieved') {
                emptyMessage.textContent = '✨ No achieved goals yet!';
            } else if (this.currentFilter === 'not-started') {
                emptyMessage.textContent = '🎯 You\'ve started all your goals!';
            } else {
                emptyMessage.textContent = '🎯 No goals yet! Add one to start your journey.';
            }
            return;
        }

        this.emptyState.classList.add('hidden');

        // Render each goal
        filteredGoals.forEach((goal) => {
            const goalElement = this.createGoalElement(goal);
            this.goalList.appendChild(goalElement);
        });

        // Attach drag listeners after rendering all goals
        this.attachDragListeners();
    }

    // Check if a goal's target date is overdue
    isGoalOverdue(goal) {
        if (!goal.targetDate || goal.achieved) {
            return false;
        }
        const targetDate = new Date(goal.targetDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return targetDate < today;
    }

    // Format a date for display
    formatDate(dateString) {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    // Create a goal element
    createGoalElement(goal) {
        const goalItem = document.createElement('div');
        const isOverdue = this.isGoalOverdue(goal);
        goalItem.className = `task-item ${goal.achieved ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
        goalItem.dataset.id = goal.id;

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = goal.achieved;
        checkbox.setAttribute('aria-label', `Mark "${goal.title}" as ${goal.achieved ? 'not achieved' : 'achieved'}`);
        checkbox.addEventListener('change', () => this.toggleGoalAchievement(goal.id));

        // Content
        const content = document.createElement('div');
        content.className = 'task-content';

        const header = document.createElement('div');
        header.className = 'task-header';

        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = goal.title;

        const category = document.createElement('span');
        category.className = `task-priority ${goal.category.toLowerCase()}`;
        category.textContent = goal.category;

        header.appendChild(title);
        header.appendChild(category);

        const meta = document.createElement('div');
        meta.className = 'task-meta';

        // Created date
        const createdSpan = document.createElement('span');
        const createdDate = new Date(goal.createdAt).toLocaleDateString();
        createdSpan.textContent = `Added: ${createdDate}`;
        meta.appendChild(createdSpan);

        // Target date (if set)
        if (goal.targetDate) {
            const targetDateSpan = document.createElement('span');
            targetDateSpan.className = 'task-due-date';
            targetDateSpan.textContent = `🎯 Target: ${this.formatDate(goal.targetDate)}`;
            meta.appendChild(targetDateSpan);

            // Overdue badge
            if (isOverdue) {
                const overdueBadge = document.createElement('span');
                overdueBadge.className = 'task-overdue-badge';
                overdueBadge.textContent = '⚠️ Overdue!';
                meta.appendChild(overdueBadge);
            }
        }

        content.appendChild(header);
        content.appendChild(meta);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete';
        deleteBtn.textContent = '✕';
        deleteBtn.setAttribute('aria-label', `Delete "${goal.title}"`);
        deleteBtn.addEventListener('click', () => this.handleDelete(goal.id, goal.title));

        goalItem.appendChild(checkbox);
        goalItem.appendChild(content);
        goalItem.appendChild(deleteBtn);

        return goalItem;
    }

    // Handle goal deletion with confirmation
    handleDelete(id, title) {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            this.deleteGoal(id);
        }
    }

    // Handle drag start
    handleDragStart(e, goalId) {
        this.draggedGoalId = goalId;
        e.dataTransfer.effectAllowed = 'move';
        // Small delay to let browser render the element before making it dragging
        setTimeout(() => {
            const element = this.goalList.querySelector(`[data-id="${goalId}"]`);
            if (element) {
                element.classList.add('dragging-active');
            }
        }, 0);
    }

    // Handle drag over
    handleDragOver(e, goalId) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (this.draggedGoalId === goalId) return;
        
        const draggedGoal = this.goals.find(g => g.id === this.draggedGoalId);
        const targetGoal = this.goals.find(g => g.id === goalId);
        
        if (draggedGoal && targetGoal) {
            const draggedIndex = this.goals.indexOf(draggedGoal);
            const targetIndex = this.goals.indexOf(targetGoal);
            
            // Swap the goals in the array
            [this.goals[draggedIndex], this.goals[targetIndex]] = [this.goals[targetIndex], this.goals[draggedIndex]];
            
            // Save and re-render
            this.saveGoalsToStorage();
            this.render();
            
            // Re-attach drag listeners to new elements
            this.attachDragListeners();
        }
    }

    // Handle drag end
    handleDragEnd(e, goalId) {
        const element = this.goalList.querySelector(`[data-id="${goalId}"]`);
        if (element) {
            element.classList.remove('dragging-active');
        }
        this.draggedGoalId = null;
    }

    // Attach drag event listeners to goal items
    attachDragListeners() {
        const goalItems = this.goalList.querySelectorAll('.task-item');
        goalItems.forEach((item) => {
            const goalId = item.dataset.id;
            // Remove old listeners by cloning and replacing
            const newItem = item.cloneNode(true);
            item.parentNode?.replaceChild(newItem, item);
            
            // Set draggable
            newItem.draggable = true;
            
            // Add new listeners
            newItem.addEventListener('dragstart', (e) => this.handleDragStart(e, goalId));
            newItem.addEventListener('dragover', (e) => this.handleDragOver(e, goalId));
            newItem.addEventListener('dragend', (e) => this.handleDragEnd(e, goalId));
            newItem.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            
            // Re-attach checkbox and button listeners since we cloned
            const checkbox = newItem.querySelector('.task-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', () => this.toggleGoalAchievement(goalId));
            }
            
            const deleteBtn = newItem.querySelector('.task-delete');
            if (deleteBtn) {
                const goal = this.goals.find(g => g.id === goalId);
                if (goal) {
                    deleteBtn.addEventListener('click', () => this.handleDelete(goalId, goal.title));
                }
            }
        });
    }

    // Save goals to localStorage
    saveGoalsToStorage() {
        try {
            localStorage.setItem('goals', JSON.stringify(this.goals));
        } catch (error) {
            console.error('Failed to save goals to localStorage:', error);
        }
    }

    // Load goals from localStorage
    loadGoalsFromStorage() {
        try {
            const stored = localStorage.getItem('goals');
            this.goals = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load goals from localStorage:', error);
            this.goals = [];
        }
    }

    // Load theme preference from localStorage
    loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            this.setTheme(savedTheme);
        } catch (error) {
            console.error('Failed to load theme preference:', error);
            this.setTheme('dark');
        }
    }

    // Set the current theme
    setTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
            this.themeToggleBtn.textContent = '☀️';
            this.themeToggleBtn.title = 'Switch to dark mode';
        } else {
            html.removeAttribute('data-theme');
            this.themeToggleBtn.textContent = '🌙';
            this.themeToggleBtn.title = 'Switch to light mode';
        }
        
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    }

    // Toggle between dark and light theme
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    // Export goals as formatted text file
    exportGoals() {
        if (this.goals.length === 0) {
            alert('No goals to export yet!');
            return;
        }

        // Format current date
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // Create file content
        let content = `✨ My Bucket List - Exported on ${dateStr}\n`;
        content += '='.repeat(48) + '\n\n';

        // Add goals
        this.goals.forEach((goal) => {
            const status = goal.achieved ? '✅ [ACHIEVED]' : '○  [IN PROGRESS]';
            const title = goal.title;
            const category = `Category: ${goal.category}`;

            let line = `${status} ${title} (${category}`;

            // Add target date if present
            if (goal.targetDate) {
                const targetDate = this.formatDate(goal.targetDate);
                line += `, Target: ${targetDate}`;

                // Add overdue indicator
                if (this.isGoalOverdue(goal)) {
                    line += ')';
                    line += ` ⚠️ OVERDUE`;
                } else {
                    line += ')';
                }
            } else {
                line += ')';
            }

            content += line + '\n';
        });

        // Add summary
        const achieved = this.goals.filter((g) => g.achieved).length;
        const total = this.goals.length;
        content += '\n' + '='.repeat(48) + '\n';
        content += `Summary: ${achieved} of ${total} goals achieved`;

        // Create blob and download
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `bucket-list_${today.getTime()}.txt`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BucketListManager();
});
