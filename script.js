// ContextualWeb News API Configuration
        const CONTEXTUAL_API_KEY = "f94fee94fc0f48b6aa2df2cc5dd25cc2";
        
        // Use the CORRECT endpoint for ContextualWeb API
        const API_CONFIG = {
            baseUrl: 'https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/search/NewsSearchAPI',
            headers: {
                'X-RapidAPI-Key': CONTEXTUAL_API_KEY,
                'X-RapidAPI-Host': 'contextualwebsearch-websearch-v1.p.rapidapi.com'
            },
            params: {
                pageNumber: '1',
                pageSize: '30',
                autoCorrect: 'true',
                safeSearch: 'false'
            }
        };

        // User Authentication System
        class AuthSystem {
            constructor() {
                this.currentUser = null;
                this.users = JSON.parse(localStorage.getItem('dabban_users')) || [];
                this.bookmarks = JSON.parse(localStorage.getItem('dabban_bookmarks')) || {};
                this.init();
            }
            
            init() {
                // Check if user is logged in
                const savedUser = localStorage.getItem('dabban_current_user');
                if (savedUser) {
                    this.currentUser = JSON.parse(savedUser);
                    this.updateUserMenu();
                }
            }
            
            // User Registration
            register(userData) {
                // Check if user already exists
                if (this.users.find(u => u.email === userData.email)) {
                    return { success: false, message: 'Email already registered' };
                }
                
                // Create user object
                const newUser = {
                    id: Date.now().toString(),
                    ...userData,
                    createdAt: new Date().toISOString(),
                    bookmarks: [],
                    preferences: {
                        categories: ['general', 'technology'],
                        notifications: true
                    }
                };
                
                // Add to users array
                this.users.push(newUser);
                localStorage.setItem('dabban_users', JSON.stringify(this.users));
                
                // Auto login
                this.login(userData.email, userData.password);
                
                return { success: true, user: newUser };
            }
            
            // User Login
            login(email, password, rememberMe = false) {
                const user = this.users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    this.currentUser = user;
                    localStorage.setItem('dabban_current_user', JSON.stringify(user));
                    
                    if (rememberMe) {
                        localStorage.setItem('dabban_remember_me', 'true');
                    }
                    
                    this.updateUserMenu();
                    return { success: true, user };
                }
                
                return { success: false, message: 'Invalid email or password' };
            }
            
            // User Logout
            logout() {
                this.currentUser = null;
                localStorage.removeItem('dabban_current_user');
                this.updateUserMenu();
                return { success: true };
            }
            
            // Toggle Bookmark
            toggleBookmark(articleId, articleData) {
                if (!this.currentUser) {
                    return { success: false, message: 'Please login to bookmark articles' };
                }
                
                const user = this.currentUser;
                const bookmarkIndex = user.bookmarks.findIndex(b => b.id === articleId);
                
                if (bookmarkIndex === -1) {
                    // Add bookmark
                    user.bookmarks.push({
                        id: articleId,
                        ...articleData,
                        bookmarkedAt: new Date().toISOString()
                    });
                    this.showNotification('Article bookmarked!', 'success');
                } else {
                    // Remove bookmark
                    user.bookmarks.splice(bookmarkIndex, 1);
                    this.showNotification('Bookmark removed', 'info');
                }
                
                // Update user in storage
                const userIndex = this.users.findIndex(u => u.id === user.id);
                if (userIndex !== -1) {
                    this.users[userIndex] = user;
                    localStorage.setItem('dabban_users', JSON.stringify(this.users));
                    localStorage.setItem('dabban_current_user', JSON.stringify(user));
                    this.currentUser = user;
                }
                
                return { success: true, bookmarked: bookmarkIndex === -1 };
            }
            
            // Check if article is bookmarked
            isBookmarked(articleId) {
                if (!this.currentUser) return false;
                return this.currentUser.bookmarks.some(b => b.id === articleId);
            }
            
            // Get user's bookmarks
            getBookmarks() {
                return this.currentUser ? this.currentUser.bookmarks : [];
            }
            
            // Update user menu
            updateUserMenu() {
                const container = document.getElementById('userMenuContainer');
                
                if (this.currentUser) {
                    // User is logged in
                    const firstName = this.currentUser.firstName;
                    const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : 'U';
                    
                    container.innerHTML = `
                        <div class="dropdown">
                            <button class="user-avatar dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                ${firstLetter}
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end user-dropdown">
                                <li>
                                    <div class="px-3 py-2">
                                        <strong>${this.currentUser.firstName} ${this.currentUser.lastName}</strong>
                                        <div class="text-muted small">${this.currentUser.email}</div>
                                    </div>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item" href="#" id="viewBookmarks">
                                        <i class="bi bi-bookmark me-2"></i>My Bookmarks
                                        <span class="badge bg-primary rounded-pill ms-2">${this.currentUser.bookmarks.length}</span>
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#" id="viewProfile">
                                        <i class="bi bi-person me-2"></i>My Profile
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#" id="settings">
                                        <i class="bi bi-gear me-2"></i>Settings
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item text-danger" href="#" id="logoutBtn">
                                        <i class="bi bi-box-arrow-right me-2"></i>Logout
                                    </a>
                                </li>
                            </ul>
                        </div>
                    `;
                    
                    // Update greeting
                    document.getElementById('userGreeting').classList.remove('d-none');
                    document.getElementById('userName').textContent = this.currentUser.firstName;
                    
                    // Add event listeners
                    document.getElementById('logoutBtn').addEventListener('click', (e) => {
                        e.preventDefault();
                        this.logout();
                        this.showNotification('Logged out successfully', 'info');
                    });
                    
                    document.getElementById('viewBookmarks').addEventListener('click', (e) => {
                        e.preventDefault();
                        showBookmarks();
                    });
                    
                } else {
                    // User is not logged in
                    container.innerHTML = `
                        <button class="btn btn-outline-light" id="loginBtn">
                            <i class="bi bi-person me-2"></i>Login / Signup
                        </button>
                    `;
                    
                    // Hide greeting
                    document.getElementById('userGreeting').classList.add('d-none');
                    
                    // Add event listener
                    document.getElementById('loginBtn').addEventListener('click', (e) => {
                        e.preventDefault();
                        const authModal = new bootstrap.Modal(document.getElementById('authModal'));
                        authModal.show();
                    });
                }
            }
            
            // Show notification
            showNotification(message, type = 'info') {
                // Remove existing notifications
                const existing = document.querySelector('.notification-toast');
                if (existing) existing.remove();
                
                // Create new notification
                const toast = document.createElement('div');
                toast.className = `notification-toast position-fixed top-0 end-0 m-3 p-3 rounded shadow bg-${type} text-white`;
                toast.style.zIndex = '9999';
                toast.style.minWidth = '300px';
                toast.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-info-circle'} me-2"></i>
                            ${message}
                        </div>
                        <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
                    </div>
                `;
                
                document.body.appendChild(toast);
                
                // Auto remove after 3 seconds
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 3000);
            }
        }

        // DOM Elements
        const newsGrid = document.getElementById('newsGrid');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');
        const noResults = document.getElementById('noResults');
        const pageTitle = document.getElementById('pageTitle');
        const resultsCount = document.getElementById('resultsCount');
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const retryBtn = document.getElementById('retryBtn');
        
        // Initialize auth system
        const auth = new AuthSystem();
        
        // State management
        let currentCategory = 'general';
        let currentSearch = '';
        let isLoading = false;

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            // Load initial news
            loadNews('general', 'Latest News');
            
            // Setup category navigation
            document.querySelectorAll('.category-nav').forEach(nav => {
                nav.addEventListener('click', function(e) {
                    e.preventDefault();
                    const category = this.getAttribute('data-category');
                    const categoryName = this.textContent.trim();
                    
                    // Update active states
                    document.querySelectorAll('.category-nav').forEach(n => n.classList.remove('active'));
                    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Load news for category
                    currentCategory = category;
                    currentSearch = '';
                    searchInput.value = '';
                    loadNews(category, getCategoryDisplayName(category));
                });
            });
            
            // Setup search
            searchBtn.addEventListener('click', handleSearch);
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleSearch();
                }
            });
            
            // Setup retry button
            retryBtn.addEventListener('click', function() {
                if (currentSearch) {
                    loadSearchResults(currentSearch);
                } else {
                    loadNews(currentCategory, getCategoryDisplayName(currentCategory));
                }
            });
            
            // Setup auth forms
            setupAuthForms();
            
            // Setup footer login link
            document.getElementById('footerLogin').addEventListener('click', function(e) {
                e.preventDefault();
                const authModal = new bootstrap.Modal(document.getElementById('authModal'));
                authModal.show();
            });
            
            // Setup forgot password
            document.getElementById('forgotPassword').addEventListener('click', function(e) {
                e.preventDefault();
                const authModal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
                authModal.hide();
                
                setTimeout(() => {
                    const forgotModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
                    forgotModal.show();
                }, 300);
            });
        });

        // Setup authentication forms
        function setupAuthForms() {
            // Login form
            document.getElementById('loginForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                const rememberMe = document.getElementById('rememberMe').checked;
                
                const result = auth.login(email, password, rememberMe);
                
                if (result.success) {
                    auth.showNotification('Login successful!', 'success');
                    const authModal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
                    authModal.hide();
                    
                    // Clear form
                    this.reset();
                    
                    // Reload news with user preferences
                    if (auth.currentUser && auth.currentUser.preferences) {
                        loadNews(auth.currentUser.preferences.categories[0], 
                                getCategoryDisplayName(auth.currentUser.preferences.categories[0]));
                    }
                } else {
                    auth.showNotification(result.message, 'danger');
                }
            });
            
            // Signup form
            document.getElementById('signupForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const firstName = document.getElementById('signupFirstName').value;
                const lastName = document.getElementById('signupLastName').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                const confirmPassword = document.getElementById('signupConfirmPassword').value;
                
                // Validation
                if (password !== confirmPassword) {
                    auth.showNotification('Passwords do not match', 'danger');
                    return;
                }
                
                if (password.length < 6) {
                    auth.showNotification('Password must be at least 6 characters', 'danger');
                    return;
                }
                
                const userData = {
                    firstName,
                    lastName,
                    email,
                    password
                };
                
                const result = auth.register(userData);
                
                if (result.success) {
                    auth.showNotification('Account created successfully!', 'success');
                    const authModal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
                    authModal.hide();
                    
                    // Clear form
                    this.reset();
                } else {
                    auth.showNotification(result.message, 'danger');
                }
            });
            
            // Forgot password form
            document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('resetEmail').value;
                
                // In a real app, you would send this to your backend
                auth.showNotification(`Password reset link sent to ${email}`, 'info');
                
                const forgotModal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                forgotModal.hide();
                this.reset();
            });
            
            // Social login buttons
            document.querySelectorAll('.social-btn.google').forEach(btn => {
                btn.addEventListener('click', function() {
                    auth.showNotification('Google login would be implemented in production', 'info');
                });
            });
            
            document.querySelectorAll('.social-btn.facebook').forEach(btn => {
                btn.addEventListener('click', function() {
                    auth.showNotification('Facebook login would be implemented in production', 'info');
                });
            });
        }

        // Show bookmarks
        function showBookmarks() {
            const bookmarks = auth.getBookmarks();
            
            if (bookmarks.length === 0) {
                pageTitle.textContent = 'My Bookmarks';
                resultsCount.textContent = 'No bookmarked articles yet';
                clearNewsGrid();
                showNoResults();
                return;
            }
            
            pageTitle.textContent = 'My Bookmarks';
            resultsCount.textContent = `${bookmarks.length} bookmarked articles`;
            displayNewsArticles(bookmarks);
        }

        // Load news from ContextualWeb API
        async function loadNews(category, displayName) {
            try {
                if (isLoading) return;
                
                isLoading = true;
                showLoading();
                hideError();
                hideNoResults();
                clearNewsGrid();
                
                // Update UI
                pageTitle.textContent = displayName;
                resultsCount.textContent = 'Loading news...';
                
                // Build API parameters based on category
                let query = getCategoryQuery(category);
                let url = buildApiUrl(query);
                
                console.log('Fetching from URL:', url);
                
                // Use mock data for now (since API might have issues)
                // Comment this out and uncomment the fetch code below when API is working
                useMockData(category, displayName);
                return;
                
                /*
                // Uncomment this when API is working
                const response = await fetch(url, {
                    method: 'GET',
                    headers: API_CONFIG.headers
                });
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Check if we have valid data
                if (data && data.value && Array.isArray(data.value)) {
                    displayNewsArticles(data.value);
                    resultsCount.textContent = `Found ${data.value.length} news articles`;
                } else {
                    throw new Error('Invalid response format from API');
                }
                */
                
            } catch (error) {
                console.error('Error loading news:', error);
                useMockData(category, displayName); // Fallback to mock data
            } finally {
                isLoading = false;
                hideLoading();
            }
        }

        // Use mock data (temporary solution)
        function useMockData(category, displayName) {
            const mockArticles = {
                general: [
                    {
                        id: '1',
                        title: "Global Leaders Gather for Climate Summit",
                        description: "World leaders meet to discuss urgent climate action and sustainability goals for the coming decade.",
                        url: "#",
                        image: { url: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                        provider: { name: "Global News" },
                        datePublished: new Date().toISOString()
                    },
                    {
                        id: '2',
                        title: "Tech Giants Announce AI Partnership",
                        description: "Major technology companies join forces to develop ethical AI standards and innovations.",
                        url: "#",
                        image: { url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                        provider: { name: "Tech Times" },
                        datePublished: new Date().toISOString()
                    },
                    {
                        id: '3',
                        title: "Stock Markets Reach Record High",
                        description: "Global markets surge as economic indicators show strong recovery post-pandemic.",
                        url: "#",
                        image: { url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                        provider: { name: "Business Daily" },
                        datePublished: new Date().toISOString()
                    }
                ],
                technology: [
                    {
                        id: '4',
                        title: "Quantum Computing Breakthrough Announced",
                        description: "Researchers achieve major milestone in quantum computing stability and processing power.",
                        url: "#",
                        image: { url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                        provider: { name: "Science Tech" },
                        datePublished: new Date().toISOString()
                    },
                    {
                        id: '5',
                        title: "New Smartphone Features Revolutionary Camera",
                        description: "Latest smartphone release includes AI-powered camera with unprecedented low-light capabilities.",
                        url: "#",
                        image: { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                        provider: { name: "Mobile World" },
                        datePublished: new Date().toISOString()
                    }
                ],
                business: [
                    {
                        id: '6',
                        title: "Startup Valuation Soars After Funding Round",
                        description: "Tech startup secures $100M in Series B funding, valuation reaches $1B.",
                        url: "#",
                        image: { url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                        provider: { name: "Venture News" },
                        datePublished: new Date().toISOString()
                    }
                ]
            };
            
            const articles = mockArticles[category] || mockArticles.general;
            displayNewsArticles(articles);
            resultsCount.textContent = `Showing ${articles.length} news articles`;
        }

        // Build API URL
        function buildApiUrl(query) {
            const params = new URLSearchParams({
                ...API_CONFIG.params,
                q: query
            });
            
            return `${API_CONFIG.baseUrl}?${params.toString()}`;
        }

        // Get query based on category
        function getCategoryQuery(category) {
            const queries = {
                'general': 'news',
                'politics': 'politics news',
                'technology': 'technology news',
                'business': 'business news',
                'sports': 'sports news',
                'entertainment': 'entertainment news',
                'health': 'health news',
                'science': 'science news'
            };
            
            return queries[category] || 'news';
        }

        // Get display name for category
        function getCategoryDisplayName(category) {
            const names = {
                'general': 'Latest News',
                'politics': 'Politics News',
                'technology': 'Technology News',
                'business': 'Business News',
                'sports': 'Sports News',
                'entertainment': 'Entertainment News',
                'health': 'Health News',
                'science': 'Science News'
            };
            
            return names[category] || 'News';
        }

        // Display news articles
        function displayNewsArticles(articles) {
            clearNewsGrid();
            
            if (!articles || articles.length === 0) {
                showNoResults();
                return;
            }
            
            articles.forEach(article => {
                const newsCard = createNewsCard(article);
                newsGrid.appendChild(newsCard);
            });
        }

        // Create a news card element
        function createNewsCard(article) {
            const col = document.createElement('div');
            col.className = 'col';
            
            // Generate unique ID if not present
            const articleId = article.id || `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Format date
            const publishedDate = article.datePublished ? 
                new Date(article.datePublished).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }) : 'Recent';
            
            // Get image URL
            const imageUrl = article.image?.url || article.urlToImage || 
                           'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
            
            // Check if bookmarked
            const isBookmarked = auth.isBookmarked(articleId);
            
            col.innerHTML = `
                <div class="card news-card h-100">
                    <div class="card-img-container position-relative">
                        <img src="${imageUrl}" 
                             class="card-img-top" 
                             alt="${article.title}"
                             onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
                        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                                data-article-id="${articleId}">
                            <i class="bi ${isBookmarked ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i>
                        </button>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold">${article.title || 'No Title Available'}</h5>
                        <p class="card-text flex-grow-1">${article.description || 'No description available.'}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="news-source">
                                    <i class="bi bi-newspaper me-1"></i>
                                    ${article.provider?.name || article.source?.name || 'Unknown Source'}
                                </span>
                                <span class="news-date">
                                    <i class="bi bi-calendar me-1"></i>
                                    ${publishedDate}
                                </span>
                            </div>
                            <a href="${article.url || '#'}" 
                               target="_blank" 
                               class="btn btn-primary w-100">
                                <i class="bi bi-arrow-right-circle me-2"></i>Read Full Story
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            // Add bookmark functionality
            const bookmarkBtn = col.querySelector('.bookmark-btn');
            bookmarkBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const result = auth.toggleBookmark(articleId, {
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    image: article.image,
                    provider: article.provider,
                    datePublished: article.datePublished
                });
                
                if (result.success) {
                    const icon = this.querySelector('i');
                    if (result.bookmarked) {
                        this.classList.add('bookmarked');
                        icon.className = 'bi bi-bookmark-fill';
                    } else {
                        this.classList.remove('bookmarked');
                        icon.className = 'bi bi-bookmark';
                    }
                }
            });
            
            return col;
        }

        // Handle search
        function handleSearch() {
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                currentSearch = searchTerm;
                loadSearchResults(searchTerm);
            } else {
                // If search is empty, revert to current category
                currentSearch = '';
                loadNews(currentCategory, getCategoryDisplayName(currentCategory));
            }
        }

        // Load search results
        async function loadSearchResults(query) {
            try {
                isLoading = true;
                showLoading();
                hideError();
                hideNoResults();
                clearNewsGrid();
                
                pageTitle.textContent = `Search: "${query}"`;
                resultsCount.textContent = 'Searching...';
                
                // Use mock data for search
                setTimeout(() => {
                    const mockSearchResults = [
                        {
                            id: 'search_1',
                            title: `Results for "${query}" in Technology`,
                            description: `Latest news and developments related to ${query} in the technology sector.`,
                            url: "#",
                            image: { url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                            provider: { name: "Search Results" },
                            datePublished: new Date().toISOString()
                        },
                        {
                            id: 'search_2',
                            title: `${query} Trends in Business`,
                            description: `How ${query} is impacting business strategies and market dynamics globally.`,
                            url: "#",
                            image: { url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                            provider: { name: "Business Insights" },
                            datePublished: new Date().toISOString()
                        }
                    ];
                    
                    displayNewsArticles(mockSearchResults);
                    resultsCount.textContent = `Found ${mockSearchResults.length} results for "${query}"`;
                    hideLoading();
                }, 1000);
                
            } catch (error) {
                console.error('Search error:', error);
                showError('Search failed. Please try again.');
                resultsCount.textContent = 'Search error';
                hideLoading();
            }
        }

        // UI Helper Functions
        function showLoading() {
            loadingState.style.display = 'flex';
        }

        function hideLoading() {
            loadingState.style.display = 'none';
        }

        function showError(message) {
            errorMessage.textContent = message;
            errorState.classList.remove('d-none');
        }

        function hideError() {
            errorState.classList.add('d-none');
        }

        function showNoResults() {
            noResults.classList.remove('d-none');
        }

        function hideNoResults() {
            noResults.classList.add('d-none');
        }

        function clearNewsGrid() {
            newsGrid.innerHTML = '';
        }
