// Admin Dashboard JavaScript

// DOM Elements
const loginContainer = document.getElementById('login-container');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const viewSiteBtn = document.getElementById('view-site-btn');

// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const adminSections = document.querySelectorAll('.admin-section');

// Stats Elements
const totalMeetingsStat = document.getElementById('total-meetings-stat');
const upcomingMeetingsStat = document.getElementById('upcoming-meetings-stat');
const totalProjectsStat = document.getElementById('total-projects-stat');
const totalMessagesStat = document.getElementById('total-messages-stat');

// Meetings Elements
const meetingsAdminFilter = document.getElementById('meetings-admin-filter');
const meetingsTableBody = document.getElementById('meetings-table-body');
const clearAllMeetingsBtn = document.getElementById('clear-all-meetings');

// Projects Elements
const addProjectBtn = document.getElementById('add-project-btn');
const projectsAdminGrid = document.getElementById('projects-admin-grid');
const projectModal = document.getElementById('project-modal');
const projectModalClose = document.getElementById('project-modal-close');
const projectForm = document.getElementById('project-form');
const projectCancel = document.getElementById('project-cancel');

// Content Elements
const personalInfoForm = document.getElementById('personal-info-form');
const contactInfoForm = document.getElementById('contact-info-form');

// Settings Elements
const changePasswordBtn = document.getElementById('change-password-btn');
const clearAllDataBtn = document.getElementById('clear-all-data-btn');

// Activity List
const activityList = document.getElementById('activity-list');

// Admin Credentials (In production, use proper authentication)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    loadDashboardData();
});

// Authentication
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    loginContainer.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

function showDashboard() {
    loginContainer.style.display = 'none';
    adminDashboard.style.display = 'grid';
    loadDashboardData();
}

function login(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
        addActivity('🔐 Admin logged in', 'Successful login to dashboard');
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    showLogin();
    // Clear form data
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
}

// Event Listeners
function setupEventListeners() {
    // Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        
        if (login(username, password)) {
            showNotification('Login successful!', 'success');
        } else {
            showNotification('Invalid credentials. Try admin/admin123', 'error');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', logout);

    // View Site
    viewSiteBtn.addEventListener('click', () => {
        window.open('index.html', '_blank');
    });

    // Navigation
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section);
            
            // Update active nav button
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Meetings
    meetingsAdminFilter.addEventListener('change', loadMeetingsTable);
    clearAllMeetingsBtn.addEventListener('click', clearAllMeetings);

    // Projects
    addProjectBtn.addEventListener('click', () => openProjectModal());
    projectModalClose.addEventListener('click', closeProjectModal);
    projectCancel.addEventListener('click', closeProjectModal);
    projectForm.addEventListener('submit', handleProjectSubmit);

    // Content Forms
    personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
    contactInfoForm.addEventListener('submit', handleContactInfoSubmit);

    // Settings
    changePasswordBtn.addEventListener('click', changePassword);
    clearAllDataBtn.addEventListener('click', clearAllData);

    // Modal close on outside click
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeProjectModal();
        }
    });
}

// Navigation
function switchSection(sectionName) {
    adminSections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        switch(sectionName) {
            case 'meetings':
                loadMeetingsTable();
                break;
            case 'projects':
                loadProjectsGrid();
                break;
            case 'dashboard':
                loadDashboardData();
                break;
        }
    }
}

// Dashboard Data
function loadDashboardData() {
    loadStats();
    loadRecentActivity();
}

function loadStats() {
    // Get meetings data from main site
    const meetingsData = JSON.parse(localStorage.getItem('meetingsData') || '[]');
    const projectsData = JSON.parse(localStorage.getItem('projectsData') || '[]');
    const messagesData = JSON.parse(localStorage.getItem('messagesData') || '[]');
    
    // Calculate stats
    const totalMeetings = meetingsData.length;
    const upcomingMeetings = meetingsData.filter(meeting => {
        const meetingDate = new Date(meeting.date + ' ' + meeting.time);
        return meetingDate > new Date();
    }).length;
    
    // Update stats display
    if (totalMeetingsStat) totalMeetingsStat.textContent = totalMeetings;
    if (upcomingMeetingsStat) upcomingMeetingsStat.textContent = upcomingMeetings;
    if (totalProjectsStat) totalProjectsStat.textContent = projectsData.length || 3;
    if (totalMessagesStat) totalMessagesStat.textContent = messagesData.length;
}

function loadRecentActivity() {
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    
    if (activities.length === 0) {
        // Add default activity
        addActivity('🎉 Admin Dashboard Created', 'Welcome to your portfolio admin panel');
    }
    
    displayActivities(activities.slice(-5)); // Show last 5 activities
}

function addActivity(title, description) {
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    const newActivity = {
        id: Date.now(),
        title,
        description,
        timestamp: new Date().toISOString(),
        icon: getActivityIcon(title)
    };
    
    activities.push(newActivity);
    localStorage.setItem('adminActivities', JSON.stringify(activities));
    
    if (activityList) {
        displayActivities(activities.slice(-5));
    }
}

function getActivityIcon(title) {
    if (title.includes('login')) return '🔐';
    if (title.includes('meeting')) return '📅';
    if (title.includes('project')) return '💼';
    if (title.includes('message')) return '💬';
    if (title.includes('settings')) return '⚙️';
    return '📝';
}

function displayActivities(activities) {
    if (!activityList) return;
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <p><strong>${activity.title}</strong></p>
                <small>${formatTimeAgo(activity.timestamp)}</small>
            </div>
        </div>
    `).join('');
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
}

// Meetings Management
function loadMeetingsTable() {
    const meetingsData = JSON.parse(localStorage.getItem('meetingsData') || '[]');
    const filter = meetingsAdminFilter.value;
    
    let filteredMeetings = meetingsData;
    
    if (filter !== 'all') {
        filteredMeetings = meetingsData.filter(meeting => {
            const meetingDate = new Date(meeting.date + ' ' + meeting.time);
            const now = new Date();
            const today = now.toDateString();
            
            switch(filter) {
                case 'upcoming':
                    return meetingDate > now;
                case 'today':
                    return meetingDate.toDateString() === today;
                case 'past':
                    return meetingDate < now;
                default:
                    return true;
            }
        });
    }
    
    displayMeetingsTable(filteredMeetings);
}

function displayMeetingsTable(meetings) {
    if (!meetingsTableBody) return;
    
    if (meetings.length === 0) {
        meetingsTableBody.innerHTML = `
            <tr class="no-data">
                <td colspan="6">No meetings found</td>
            </tr>
        `;
        return;
    }
    
    meetingsTableBody.innerHTML = meetings.map(meeting => {
        const status = getMeetingStatus(meeting);
        const meetingDate = new Date(meeting.date);
        const formattedDate = meetingDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        return `
            <tr>
                <td>${meeting.name}</td>
                <td>${meeting.email}</td>
                <td>${formattedDate} at ${meeting.time}</td>
                <td>${meeting.type}</td>
                <td><span class="status-badge status-${status}">${status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="viewMeeting('${meeting.id}')">👁️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMeeting('${meeting.id}')">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function getMeetingStatus(meeting) {
    const now = new Date();
    const meetingDate = new Date(meeting.date + ' ' + meeting.time);
    
    if (meetingDate < now) {
        return 'past';
    } else if (meetingDate.toDateString() === now.toDateString()) {
        return 'today';
    } else {
        return 'upcoming';
    }
}

function viewMeeting(meetingId) {
    const meetingsData = JSON.parse(localStorage.getItem('meetingsData') || '[]');
    const meeting = meetingsData.find(m => m.id === meetingId);
    
    if (meeting) {
        alert(`Meeting Details:\n\nClient: ${meeting.name}\nEmail: ${meeting.email}\nDate: ${meeting.date}\nTime: ${meeting.time}\nType: ${meeting.type}\nDescription: ${meeting.description || 'None'}`);
    }
}

function deleteMeeting(meetingId) {
    if (confirm('Are you sure you want to delete this meeting?')) {
        let meetingsData = JSON.parse(localStorage.getItem('meetingsData') || '[]');
        meetingsData = meetingsData.filter(m => m.id !== meetingId);
        localStorage.setItem('meetingsData', JSON.stringify(meetingsData));
        
        loadMeetingsTable();
        loadStats();
        addActivity('🗑️ Meeting deleted', 'Removed a scheduled meeting');
        showNotification('Meeting deleted successfully', 'success');
    }
}

function clearAllMeetings() {
    if (confirm('Are you sure you want to delete ALL meetings? This action cannot be undone.')) {
        localStorage.removeItem('meetingsData');
        loadMeetingsTable();
        loadStats();
        addActivity('🗑️ All meetings cleared', 'Removed all scheduled meetings');
        showNotification('All meetings cleared', 'success');
    }
}

// Projects Management
function loadProjectsGrid() {
    const projectsData = JSON.parse(localStorage.getItem('projectsData') || '[]');
    
    // If no custom projects, show default ones
    if (projectsData.length === 0) {
        displayDefaultProjects();
    } else {
        displayProjectsGrid(projectsData);
    }
}

function displayDefaultProjects() {
    const defaultProjects = [
        {
            id: 'default-1',
            title: 'E-Commerce Platform',
            description: 'A modern e-commerce solution built with React and Node.js, featuring real-time inventory management.',
            image: 'https://via.placeholder.com/400x250/06b6d4/ffffff?text=Project+1',
            link: '#'
        },
        {
            id: 'default-2',
            title: 'Task Management App',
            description: 'A collaborative task management application with real-time updates and team collaboration features.',
            image: 'https://via.placeholder.com/400x250/06b6d4/ffffff?text=Project+2',
            link: '#'
        },
        {
            id: 'default-3',
            title: 'Weather Dashboard',
            description: 'An interactive weather dashboard with location-based forecasts and beautiful data visualizations.',
            image: 'https://via.placeholder.com/400x250/06b6d4/ffffff?text=Project+3',
            link: '#'
        }
    ];
    
    displayProjectsGrid(defaultProjects);
}

function displayProjectsGrid(projects) {
    if (!projectsAdminGrid) return;
    
    projectsAdminGrid.innerHTML = projects.map(project => `
        <div class="project-admin-card">
            <div class="project-admin-image">
                ${project.image ? `<img src="${project.image}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;">` : '💼'}
            </div>
            <div class="project-admin-content">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editProject('${project.id}')">✏️ Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProject('${project.id}')">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function openProjectModal(projectId = null) {
    const modalTitle = document.getElementById('project-modal-title');
    const form = document.getElementById('project-form');
    
    if (projectId) {
        // Edit mode
        modalTitle.textContent = 'Edit Project';
        const projectsData = JSON.parse(localStorage.getItem('projectsData') || '[]');
        const project = projectsData.find(p => p.id === projectId);
        
        if (project) {
            document.getElementById('project-title').value = project.title;
            document.getElementById('project-description').value = project.description;
            document.getElementById('project-image').value = project.image || '';
            document.getElementById('project-link').value = project.link || '';
            form.dataset.editId = projectId;
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Project';
        form.reset();
        delete form.dataset.editId;
    }
    
    projectModal.classList.add('active');
}

function closeProjectModal() {
    projectModal.classList.remove('active');
    document.getElementById('project-form').reset();
}

function handleProjectSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const projectData = {
        id: e.target.dataset.editId || 'project_' + Date.now(),
        title: formData.get('project-title') || document.getElementById('project-title').value,
        description: formData.get('project-description') || document.getElementById('project-description').value,
        image: formData.get('project-image') || document.getElementById('project-image').value,
        link: formData.get('project-link') || document.getElementById('project-link').value
    };
    
    let projectsData = JSON.parse(localStorage.getItem('projectsData') || '[]');
    
    if (e.target.dataset.editId) {
        // Update existing project
        const index = projectsData.findIndex(p => p.id === e.target.dataset.editId);
        if (index !== -1) {
            projectsData[index] = projectData;
            addActivity('✏️ Project updated', `Modified project: ${projectData.title}`);
        }
    } else {
        // Add new project
        projectsData.push(projectData);
        addActivity('💼 Project added', `Created new project: ${projectData.title}`);
    }
    
    localStorage.setItem('projectsData', JSON.stringify(projectsData));
    loadProjectsGrid();
    loadStats();
    closeProjectModal();
    showNotification('Project saved successfully', 'success');
}

function editProject(projectId) {
    openProjectModal(projectId);
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        let projectsData = JSON.parse(localStorage.getItem('projectsData') || '[]');
        const project = projectsData.find(p => p.id === projectId);
        projectsData = projectsData.filter(p => p.id !== projectId);
        
        localStorage.setItem('projectsData', JSON.stringify(projectsData));
        loadProjectsGrid();
        loadStats();
        addActivity('🗑️ Project deleted', `Removed project: ${project?.title || 'Unknown'}`);
        showNotification('Project deleted successfully', 'success');
    }
}

// Content Management
function handlePersonalInfoSubmit(e) {
    e.preventDefault();
    
    const personalData = {
        name: document.getElementById('admin-name').value,
        title: document.getElementById('admin-title').value,
        bio: document.getElementById('admin-bio').value
    };
    
    localStorage.setItem('personalInfo', JSON.stringify(personalData));
    addActivity('📝 Personal info updated', 'Updated profile information');
    showNotification('Personal information saved', 'success');
}

function handleContactInfoSubmit(e) {
    e.preventDefault();
    
    const contactData = {
        email: document.getElementById('admin-email').value,
        phone: document.getElementById('admin-phone').value,
        location: document.getElementById('admin-location').value
    };
    
    localStorage.setItem('contactInfo', JSON.stringify(contactData));
    addActivity('📞 Contact info updated', 'Updated contact information');
    showNotification('Contact information saved', 'success');
}

// Settings
function changePassword() {
    const newPassword = prompt('Enter new password:');
    if (newPassword && newPassword.length >= 6) {
        // In a real app, this would be handled securely on the server
        ADMIN_CREDENTIALS.password = newPassword;
        addActivity('🔑 Password changed', 'Updated admin password');
        showNotification('Password changed successfully', 'success');
    } else if (newPassword) {
        showNotification('Password must be at least 6 characters', 'error');
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This will remove meetings, projects, and settings. This action cannot be undone.')) {
        if (confirm('This is your final warning. ALL data will be permanently deleted. Continue?')) {
            localStorage.removeItem('meetingsData');
            localStorage.removeItem('projectsData');
            localStorage.removeItem('messagesData');
            localStorage.removeItem('personalInfo');
            localStorage.removeItem('contactInfo');
            localStorage.removeItem('adminActivities');
            
            // Reload dashboard
            loadDashboardData();
            loadMeetingsTable();
            loadProjectsGrid();
            
            addActivity('🗑️ All data cleared', 'Performed complete data reset');
            showNotification('All data cleared successfully', 'success');
        }
    }
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.admin-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#06b6d4'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10002;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Make functions globally available for onclick handlers
window.viewMeeting = viewMeeting;
window.deleteMeeting = deleteMeeting;
window.editProject = editProject;
window.deleteProject = deleteProject;