document.addEventListener('DOMContentLoaded', () => {
    // get all the HTML elements we need to work with
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // when someone clicks "Register here", hide the login form and show the register form
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault(); // this stops the link from jumping to the top of the page
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    });

    // when someone clicks "Login here", hide the register form and show the login form
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    // handle the registration form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        // The username from the form is used by the Identity system automatically
        const username = document.getElementById('register-username').value; 

        // The default /register endpoint uses the 'email' field to set the username
        // if a specific username isn't provided in a custom way. We'll send it,
        // but rely on the backend to handle it. For now, email is primary.
        
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            alert('Registration successful! Please log in.');
            showLoginLink.click(); // switch back to the login form
        } else {
            alert('Registration failed. The email might already be in use.');
        }
    });

    // handle the login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // The "?useCookies=true" is important for the browser to get the login cookie
        const response = await fetch('/login?useCookies=true', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            // if login works, send the user to the admin page
            window.location.href = '/admin.html';
        } else {
            alert('Login failed. Please check your email and password.');
        }
    });
});
