import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Collaborative_student_hub.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Profile, Skill
from projects.models import Project, ProjectSkill
from applications.models import Application

def main():
    print("Seeding test data...")
    # Create skills in DB
    skills_names = ['Python', 'Django', 'React', 'TypeScript', 'CSS', 'Go', 'Figma', 'PostgreSQL', 'HTML']
    skills_objs = {}
    for name in skills_names:
        obj, _ = Skill.objects.get_or_create(name=name)
        skills_objs[name.lower()] = obj

    # Create users
    users_data = [
        {
            'username': 'alice_dev', 'first_name': 'Alice', 'last_name': 'Developer', 'email': 'alice@student.hub',
            'password': 'password123', 'dept': 'Computer Science', 'year': '3rd Year',
            'bio': 'Full-stack software developer loving Django and React combo.',
            'interests': 'Machine Learning, Web Development, Databases',
            'skills': ['Python', 'Django', 'React']
        },
        {
            'username': 'bob_coder', 'first_name': 'Bob', 'last_name': 'Designer', 'email': 'bob@student.hub',
            'password': 'password123', 'dept': 'Design', 'year': '2nd Year',
            'bio': 'Frontend developer and visual layout designer.',
            'interests': 'Frontend Development, Design Systems, React',
            'skills': ['React', 'TypeScript', 'CSS']
        },
        {
            'username': 'charlie_back', 'first_name': 'Charlie', 'last_name': 'Backend', 'email': 'charlie@student.hub',
            'password': 'password123', 'dept': 'Computer Science', 'year': '4th Year',
            'bio': 'Go and Python systems developer focusing on scale.',
            'interests': 'Backend Architecture, Distributed Systems, Databases',
            'skills': ['Python', 'Go', 'PostgreSQL']
        },
        {
            'username': 'diana_design', 'first_name': 'Diana', 'last_name': 'UX', 'email': 'diana@student.hub',
            'password': 'password123', 'dept': 'Design', 'year': '1st Year',
            'bio': 'UX designer interested in interfaces and styling.',
            'interests': 'UX/UI Design, Frontend Development, Design',
            'skills': ['Figma', 'HTML', 'CSS']
        }
    ]

    users = {}
    for u in users_data:
        user, created = User.objects.get_or_create(username=u['username'], defaults={
            'email': u['email'],
            'first_name': u['first_name'],
            'last_name': u['last_name'],
        })
        if created or user.check_password(u['password']):
            user.set_password(u['password'])
            user.save()
        users[u['username']] = user

        # Profile
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.department = u['dept']
        profile.year = u['year']
        profile.bio = u['bio']
        profile.interests = u['interests']
        profile.save()
        
        # Set skills
        profile.skills.clear()
        for sk in u['skills']:
            profile.skills.add(skills_objs[sk.lower()])

    # Create projects
    today = datetime.now().date()
    projects_data = [
        {
            'title': 'Django Microservices Hub',
            'description': 'A microservice framework using Python and Go with gRPC transport. Closing very soon!',
            'owner': users['charlie_back'],
            'dept': 'Computer Science',
            'deadline': today + timedelta(days=3),
            'difficulty': 'Advanced',
            'team_size': 4,
            'skills': ['Python', 'Go']
        },
        {
            'title': 'Real-Time Interface Creator',
            'description': 'A collaborative tool using Canvas and WebSockets. Urgently looking for developers!',
            'owner': users['bob_coder'],
            'dept': 'Design',
            'deadline': today + timedelta(days=1),
            'difficulty': 'Intermediate',
            'team_size': 3,
            'skills': ['React', 'CSS']
        },
        {
            'title': 'Modern Portfolio Template',
            'description': 'Static landing page design system with high accessibility ratings.',
            'owner': users['diana_design'],
            'dept': 'Design',
            'deadline': today + timedelta(days=12),
            'difficulty': 'Beginner',
            'team_size': 2,
            'skills': ['Figma', 'CSS', 'HTML']
        }
    ]

    for p in projects_data:
        proj, created = Project.objects.get_or_create(title=p['title'], defaults={
            'description': p['description'],
            'owner': p['owner'],
            'department': p['dept'],
            'deadline': p['deadline'],
            'difficulty': p['difficulty'],
            'team_size': p['team_size'],
            'status': 'Open'
        })
        if not created:
            proj.description = p['description']
            proj.owner = p['owner']
            proj.department = p['dept']
            proj.deadline = p['deadline']
            proj.difficulty = p['difficulty']
            proj.team_size = p['team_size']
            proj.status = 'Open'
            proj.save()

        # Project Skills
        proj.required_skills.all().delete()
        for sk in p['skills']:
            ProjectSkill.objects.create(project=proj, skill_name=sk)

    # Create incoming applications so project owners can exercise Manage Apps.
    applications_data = [
        {
            'project': 'Django Microservices Hub',
            'student': 'alice_dev',
            'message': 'I have hands-on Python and Django experience and would love to help build the services.',
        },
        {
            'project': 'Real-Time Interface Creator',
            'student': 'alice_dev',
            'message': 'My React background would be a strong fit for the collaborative interface.',
        },
        {
            'project': 'Real-Time Interface Creator',
            'student': 'diana_design',
            'message': 'I can contribute HTML, CSS, and UX design support for the interface.',
        },
    ]
    for app_data in applications_data:
        application, _ = Application.objects.get_or_create(
            project=Project.objects.get(title=app_data['project']),
            student=users[app_data['student']],
            defaults={'message': app_data['message'], 'status': 'Pending'},
        )
        if application.message != app_data['message']:
            application.message = app_data['message']
            application.status = 'Pending'
            application.save(update_fields=['message', 'status'])

    print("Success! Database seeded.")

if __name__ == '__main__':
    main()
