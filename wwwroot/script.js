document.addEventListener('DOMContentLoaded', () => {
    const projectGrid = document.getElementById('project-grid');

    // Fetch projects from our API
    fetch('/api/projects')
        .then(response => {
            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(projects => {
            if (!projects || projects.length === 0) {
                projectGrid.innerHTML = '<p>No projects to display yet! Add one using the API.</p>';
                return;
            }

            // Clear the "Loading..." message
            projectGrid.innerHTML = '';

            // Create a card for each project
            projects.forEach(project => {
                const card = document.createElement('div');
                card.className = 'project-card';

                // Make sure technologies is not null or empty before trying to split
                const tagsHtml = project.technologies 
                    ? project.technologies
                        .split(',')
                        .map(tag => `<span class="tag">${tag.trim()}</span>`)
                        .join('')
                    : ''; // If no tags, just show nothing

                // This whole block of HTML must be inside backticks ``
                card.innerHTML = `
                    <h2>${project.title}</h2>
                    <p>${project.description}</p>
                    <div class="tags">
                        ${tagsHtml}
                    </div>
                    <div class="links">
                        <a href="${project.gitHubUrl}" target="_blank">GitHub</a>
                        <a href="${project.liveUrl}" target="_blank">Live Demo</a>
                    </div>
                `;
                projectGrid.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching projects:', error);
            projectGrid.innerHTML = '<p>Could not load projects. Please try again later.</p>';
        });
});