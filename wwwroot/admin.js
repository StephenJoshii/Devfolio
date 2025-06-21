// Wait until the whole page is loaded before we run our code
document.addEventListener('DOMContentLoaded', () => {
    // --- Get references to all our HTML elements ---
    const projectForm = document.getElementById('project-form');
    const projectList = document.getElementById('existing-projects-list');

    // Form fields
    const projectIdInput = document.getElementById('project-id');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const technologiesInput = document.getElementById('technologies');
    const githubUrlInput = document.getElementById('github-url');
    const liveUrlInput = document.getElementById('live-url');

    // Buttons
    const cancelEditBtn = document.getElementById('cancel-edit');

    // --- Function to fetch and display all projects ---
    const loadProjects = async () => {
        // Fetch data from our GET endpoint
        const response = await fetch('/api/projects');
        const projects = await response.json();

        // Clear the current list
        projectList.innerHTML = '';

        projects.forEach(project => {
            const projectElement = document.createElement('div');
            projectElement.className = 'project-item'; // We can style this later
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
    };

    // --- Function to handle form submission (Create or Update) ---
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop the form from reloading the page

        const id = projectIdInput.value;
        const projectData = {
            title: titleInput.value,
            description: descriptionInput.value,
            technologies: technologiesInput.value,
            gitHubUrl: githubUrlInput.value,
            liveUrl: liveUrlInput.value
        };

        let response;
        if (id) {
            // If there's an ID, we're updating (PUT request)
            response = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
        } else {
            // If there's no ID, we're creating (POST request)
            response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
        }

        if (response.ok) {
            resetForm();
            loadProjects(); // Reload the list to show the changes
        } else {
            alert('Something went wrong!');
        }
    });
    
    // --- Event listener for the whole list (to handle edit/delete clicks) ---
    projectList.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('delete-btn')) {
            // If the delete button was clicked
            if (confirm('Are you sure you want to delete this project?')) {
                const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadProjects(); // Reload the list
                } else {
                    alert('Failed to delete project.');
                }
            }
        }

        if (target.classList.contains('edit-btn')) {
            // If the edit button was clicked
            // Fetch the single project's data to populate the form
            const response = await fetch(`/api/projects`); // We'll just find it in the list for now
            const projects = await response.json();
            const projectToEdit = projects.find(p => p.id == id);
            
            if (projectToEdit) {
                // Fill the form with the project's data
                projectIdInput.value = projectToEdit.id;
                titleInput.value = projectToEdit.title;
                descriptionInput.value = projectToEdit.description;
                technologiesInput.value = projectToEdit.technologies;
                githubUrlInput.value = projectToEdit.gitHubUrl;
                liveUrlInput.value = projectToEdit.liveUrl;
                cancelEditBtn.style.display = 'inline-block'; // Show the cancel button
            }
        }
    });
    
    // --- Function to clear the form ---
    const resetForm = () => {
        projectForm.reset();
        projectIdInput.value = '';
        cancelEditBtn.style.display = 'none';
    };

    // --- Event listener for the Cancel Edit button ---
    cancelEditBtn.addEventListener('click', resetForm);

    // --- Initial Load ---
    // Load all the projects as soon as the page opens
    loadProjects();
});
