// Wait until the whole page is loaded before we run our code
document.addEventListener('DOMContentLoaded', () => {
    // --- Get references to all our HTML elements ---
    const projectForm = document.getElementById('project-form');
    const projectList = document.getElementById('existing-projects-list');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const technologiesInput = document.getElementById('technologies');
    const githubUrlInput = document.getElementById('github-url');
    const liveUrlInput = document.getElementById('live-url');
    const projectIdInput = document.getElementById('project-id');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const publicLink = document.getElementById('public-link'); // <-- Get the link

    // --- State to hold current user info ---
    let currentUser = null;

    // --- Function to get the currently logged-in user ---
    const getCurrentUser = async () => {
        try {
            const response = await fetch('/api/me', {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' 
            });
            if (response.ok) {
                currentUser = await response.json();
                
                // --- THE FIX ---
                // Once we know the user, update the public link's href attribute.
                if(publicLink) {
                    publicLink.href = `/index.html?user=${currentUser.userId}`;
                }
                
                loadProjects(); // Then, load their projects
            } else {
                projectList.innerHTML = `<p>Your session might have expired. Please <a href="/auth.html">log in again</a>.</p>`;
                projectForm.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to get user info', error);
            projectList.innerHTML = `<p>An error occurred. Please <a href="/auth.html">try logging in again</a>.</p>`;
        }
    };
    
    // --- Function to fetch and display the user's projects ---
    const loadProjects = async () => {
        if (!currentUser || !currentUser.userId) return; 

        const response = await fetch(`/api/users/${currentUser.userId}/projects`);
        const projects = await response.json();

        projectList.innerHTML = ''; 

        if (projects.length === 0) {
             projectList.innerHTML = '<p>You haven\'t added any projects yet. Use the form above to get started!</p>';
        } else {
            projects.forEach(project => {
                const projectElement = document.createElement('div');
                projectElement.className = 'project-item';
                projectElement.innerHTML = `
                    <div>
                        <strong>${project.title}</strong>
                        <p>${project.description}</p>
                    </div>
                    <div>
                        <button class="edit-btn" data-id="${project.id}">Edit</button>
                        <button class="delete-btn" data-id="${project.id}">Delete</button>
                    </div>
                `;
                projectList.appendChild(projectElement);
            });
        }
    };

    // --- Function to handle form submission (Create or Update) ---
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = projectIdInput.value;
        const projectData = {
            id: id ? parseInt(id) : 0, 
            title: titleInput.value,
            description: descriptionInput.value,
            technologies: technologiesInput.value,
            gitHubUrl: githubUrlInput.value,
            liveUrl: liveUrlInput.value
        };

        let response;
        if (id) {
            response = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(projectData)
            });
        } else {
            response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(projectData)
            });
        }

        if (response.ok) {
            resetForm();
            loadProjects(); 
        } else {
            alert('Save failed! Ensure you are logged in and all fields are correct.');
        }
    });
    
    // --- Event listener for edit/delete clicks ---
    projectList.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this project?')) {
                const response = await fetch(`/api/projects/${id}`, { 
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (response.ok) {
                    loadProjects();
                } else {
                    alert('Failed to delete project.');
                }
            }
        }

        if (target.classList.contains('edit-btn')) {
            const response = await fetch(`/api/users/${currentUser.userId}/projects`);
            const projects = await response.json();
            const projectToEdit = projects.find(p => p.id == id);
            
            if (projectToEdit) {
                projectIdInput.value = projectToEdit.id;
                titleInput.value = projectToEdit.title;
                descriptionInput.value = projectToEdit.description;
                technologiesInput.value = projectToEdit.technologies;
                githubUrlInput.value = projectToEdit.gitHubUrl;
                liveUrlInput.value = projectToEdit.liveUrl;
                cancelEditBtn.style.display = 'inline-block';
            }
        }
    });
    
    // --- Helper function to clear the form ---
    const resetForm = () => {
        projectForm.reset();
        projectIdInput.value = '';
        cancelEditBtn.style.display = 'none';
    };

    cancelEditBtn.addEventListener('click', resetForm);

    // --- Initial Load ---
    getCurrentUser();
});
