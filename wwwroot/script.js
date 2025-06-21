// Using an async function for cleaner code
document.addEventListener('DOMContentLoaded', async () => {
    const projectGrid = document.getElementById('project-grid');
    const header = document.querySelector('header h1');

    // Get the user ID from the URL query string (e.g., ?user=some-user-id)
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user');

    if (!userId) {
        projectGrid.innerHTML = '<p>No user specified. Please provide a user ID in the URL. (e.g., ?user=YOUR_USER_ID)</p>';
        return;
    }

    try {
        // --- Step 1: Fetch user info to set the title ---
        const userInfoResponse = await fetch(`/api/users/${userId}/info`);
        if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            // Use the username to make the title personal
            header.textContent = `${userInfo.username}'s Portfolio`;
        } else {
            // If we can't find the user, set a default title
            header.textContent = 'Unknown User Portfolio';
        }

        // --- Step 2: Fetch the user's projects ---
        const projectsResponse = await fetch(`/api/users/${userId}/projects`);
        if (!projectsResponse.ok) {
            throw new Error('Failed to load projects for this user.');
        }
        
        const projects = await projectsResponse.json();
        
        if (!projects || projects.length === 0) {
            projectGrid.innerHTML = '<p>This user hasn\'t added any projects yet.</p>';
        } else {
            projectGrid.innerHTML = ''; // Clear the "Loading..." message
            
            projects.forEach(project => {
                const card = document.createElement('div');
                card.className = 'project-card';

                const tagsHtml = project.technologies 
                    ? project.technologies.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')
                    : '';

                card.innerHTML = `
                    <h2>${project.title}</h2>
                    <p>${project.description}</p>
                    <div class="tags">${tagsHtml}</div>
                    <div class="links">
                        <a href="${project.gitHubUrl}" target="_blank">GitHub</a>
                        <a href="${project.liveUrl}" target="_blank">Live Demo</a>
                    </div>
                `;
                projectGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading portfolio:', error);
        projectGrid.innerHTML = `<p>Could not load this portfolio. The user may not exist or an error occurred.</p>`;
    }
});
