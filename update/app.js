// Centralized Authentication Check
(function() {
    // Helper function to get a cookie
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    const token = getCookie('token');
    const isLoginPage = window.location.pathname.includes('login.html');
    const isRegisterPage = window.location.pathname.includes('register.html');

    if (!token && !isLoginPage && !isRegisterPage) {
        window.location.href = '../v10/login.html';
    }
})();

// Fetch and inject the menubar if its placeholder exists
const menubarPlaceholder = document.getElementById('menubar-placeholder');
if (menubarPlaceholder) {
    fetch('../components/menubar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for menubar.html');
            }
            return response.text();
        })
        .then(data => {
            menubarPlaceholder.innerHTML = data;
            // Now that the menubar is loaded, attach the logout event listener
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    deleteCookie('token');
                    window.location.href = '../v10/login.html';
                });
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing menubar:', error);
        });
}

// Fetch and inject the sidebar if its placeholder exists
const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
if (sidebarPlaceholder) {
    fetch('../components/sidebar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for sidebar.html');
            }
            return response.text();
        })
        .then(data => {
            sidebarPlaceholder.innerHTML = data;
        })
        .catch(error => {
            console.error('Error fetching or parsing sidebar:', error);
        });
}


function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}

function getHeaders() {
    const token = getCookie('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}
