# Devfolio
DevFolio - A Simple Project Portfolio Platform
DevFolio is a full-stack web application built from the ground up to solve a common problem for developers: how to easily create and share a clean, professional portfolio of their work. Instead of just a list of links, DevFolio provides a simple dashboard for managing projects and generates a public, shareable portfolio page for each user.

This project was built to demonstrate a practical, real-world application using a modern .NET backend and a lightweight vanilla JavaScript frontend.

Features
Multi-User Accounts: Secure user registration and login system powered by ASP.NET Core Identity.

Project Management: A private admin dashboard where logged-in users can Create, Read, Update, and Delete (CRUD) their own projects.

Dynamic Public Portfolios: Automatically generates a clean, public portfolio page for each user (e.g., /?user=USER_ID).

Modern API: A backend built with .NET 8 Minimal APIs, following RESTful principles.

Persistent Storage: Uses a local SQLite database to save all user and project data.

Tech Stack
Backend: C#, .NET 8, ASP.NET Core Minimal APIs

Database: SQLite with Entity Framework Core 8

Authentication: ASP.NET Core Identity

Frontend: HTML5, CSS3, Vanilla JavaScript (no frameworks)

API Testing: Swagger / OpenAPI

Getting Started: How to Run Locally
Want to run this project on your own machine? Here’s how to get started.

Prerequisites
.NET 8 SDK or newer.

A terminal or command-line interface.

Installation & Setup
Clone the repository:

git clone https://github.com/StephenJoshii/DevFolio.git
cd DevFolio


Restore dependencies: This will download all the necessary .NET packages (like Entity Framework, Identity, etc.).

dotnet restore

Run the database migrations: This will create your local devfolio.db SQLite database file with the correct tables for users and projects.

dotnet ef database update

Run the application:

dotnet run

You're all set! The application will now be running on a local port (e.g., http://localhost:5298).

How to Use the Application
Navigate to the app in your browser (e.g., http://localhost:5298). You will be automatically redirected to the login/registration page (/auth.html).

Create an account using the registration form.

Log in with your new credentials. You will be redirected to the admin dashboard (/admin.html).

Add your projects using the "Manage Portfolio Projects" form. You can add, edit, and delete projects here.

View your public portfolio by clicking the "View Public Site" link at the top of the admin page. This will take you to your unique, shareable portfolio URL.

Contributing
This project was built as a learning experience, and there's always room for improvement. If you have an idea for a new feature or find a bug, feel free to fork the repository and submit a pull request!