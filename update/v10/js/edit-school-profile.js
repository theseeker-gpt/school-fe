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

document.addEventListener('DOMContentLoaded', function () {
    const token = getCookie('token');
    const form = document.getElementById('school-profile-form');
    const nameInput = document.getElementById('school-name');
    const emailInput = document.getElementById('school-email');
    const phoneInput = document.getElementById('school-phone');
    const addressInput = document.getElementById('school-address');
    const logoInput = document.getElementById('school-logo'); // This is a file input

    // Function to fetch school data and populate the form
    const fetchSchoolData = () => {
        // Fetch user data which contains the school information
        fetch(`${backend_url}/api/v1/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return response.json();
        })
        .then(data => {
            // Extract school data from the nested structure
            let schoolData = data;
            if (data && data.user && data.user.school) {
                schoolData = data.user.school;
            }
            
            // Populate the form fields with current values
            nameInput.value = schoolData.name || '';
            emailInput.value = schoolData.email || '';
            phoneInput.value = schoolData.phone || '';
            addressInput.value = schoolData.address || '';
            
            // Display current logo URL if available
            if (schoolData.logo_url) {
                const currentLogo = document.createElement('p');
                currentLogo.innerHTML = `Current Logo: <a href="${schoolData.logo_url}" target="_blank">${schoolData.logo_url}</a>`;
                logoInput.parentElement.appendChild(currentLogo);
            }
        })
        .catch(error => {
            console.error('Error fetching school data:', error);
            const errorContainer = document.getElementById('error-container');
            if (errorContainer) {
                errorContainer.textContent = `Failed to load school data: ${error.message}`;
                errorContainer.style.display = 'block';
            }
        });
    };

    // Fetch school data when the page loads
    fetchSchoolData();

    // Handle cancel button click
    const cancelButton = document.querySelector('button[type="reset"]');
    if (cancelButton) {
        cancelButton.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = 'profile.html';
        });
    }

    // Handle form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const payload = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            address: addressInput.value,
        };

        fetch(`${backend_url}/api/v1/school`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            alert('School profile updated successfully!');
            // Redirect back to profile page
            window.location.href = 'profile.html';
        })
        .catch(error => {
            console.error('Error updating school profile:', error);
            const errorContainer = document.getElementById('error-container');
            const errorMessage = error.message || 'An unknown error occurred.';
            if (errorContainer) {
                errorContainer.textContent = `Failed to update school profile: ${errorMessage}`;
                errorContainer.style.display = 'block';
            } else {
                alert(`Failed to update school profile: ${errorMessage}`);
            }
        });
    });
});
