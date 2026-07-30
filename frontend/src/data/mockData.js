export const mockProjects = [
  {
    id: 'p1',
    title: 'AI Study Assistant',
    description: 'An AI-powered web app that generates quizzes and summaries from lecture notes. Looking for frontend and backend developers to join the team.',
    techStack: ['React', 'Python', 'OpenAI API'],
    rolesNeeded: ['Frontend Dev', 'Backend Dev'],
    owner: { name: 'Alice Smith', role: 'Fullstack' },
    status: 'Recruiting',
    createdAt: '2026-07-20',
    teamSize: 4,
    currentMembers: 2
  },
  {
    id: 'p2',
    title: 'Campus Marketplace',
    description: 'A platform for students to buy, sell, or trade textbooks, electronics, and furniture securely on campus.',
    techStack: ['Django', 'PostgreSQL', 'React'],
    rolesNeeded: ['UI/UX Designer', 'Backend Dev'],
    owner: { name: 'Bob Johnson', role: 'Backend Dev' },
    status: 'Recruiting',
    createdAt: '2026-07-22',
    teamSize: 3,
    currentMembers: 3
  },
  {
    id: 'p3',
    title: 'Student Project Hub & Peer Finder',
    description: 'A platform to find peers and collaborate on student projects. Features many-to-many relationships and task management.',
    techStack: ['React', 'Vite', 'Node.js', 'Express'],
    rolesNeeded: ['Frontend Dev'],
    owner: { name: 'Charlie Davis', role: 'Project Manager' },
    status: 'In Progress',
    createdAt: '2026-07-25',
    teamSize: 5,
    currentMembers: 5
  }
];

export const mockUser = {
  id: 'u1',
  name: 'John Doe',
  bio: 'Computer Science student passionate about web development and AI.',
  skills: ['React', 'JavaScript', 'Python', 'CSS'],
  github: 'https://github.com/johndoe',
  joinedProjects: ['p3']
};

export const mockTasks = [
  { 
    id: 1, 
    title: 'Setup Django API', 
    description: 'Initialize the Django REST framework and configure the MySQL database connection.',
    status: 'Completed',
    priority: 'High',
    dueDate: '2026-08-01',
    assignee: { name: 'Alice Smith', initials: 'AS' }
  },
  { 
    id: 2, 
    title: 'Create Login UI', 
    description: 'Design and implement the React login form with JWT handling.',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-08-05',
    assignee: { name: 'Bob Johnson', initials: 'BJ' }
  },
  { 
    id: 3, 
    title: 'Design DB Schema', 
    description: 'Create ER diagrams for users, projects, and many-to-many join requests.',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '2026-08-10',
    assignee: { name: 'Charlie Davis', initials: 'CD' }
  },
  { 
    id: 4, 
    title: 'Dashboard filtering', 
    description: 'Add tech stack and status filters to the main dashboard.',
    status: 'To Do',
    priority: 'Low',
    dueDate: '2026-08-15',
    assignee: { name: 'You', initials: 'U' }
  }
];

export const mockJoinRequests = [
  { id: 'r1', user: { name: 'Eve Carter', skills: ['React', 'Figma'] }, roleApplied: 'Frontend Dev', message: 'I love this idea and have built similar UIs!' },
  { id: 'r2', user: { name: 'David Lee', skills: ['Python', 'Django'] }, roleApplied: 'Backend Dev', message: 'I can help set up the database and API endpoints.' }
];

export const mockActivityFeed = [
  { id: 1, action: 'moved task', target: 'Create Login UI', to: 'In Progress', user: 'Bob Johnson', time: '2h ago' },
  { id: 2, action: 'completed task', target: 'Setup Django API', user: 'Alice Smith', time: '4h ago' },
  { id: 3, action: 'joined the project as', target: 'Frontend Dev', user: 'You', time: '1d ago' },
  { id: 4, action: 'created the project', target: 'Student Project Hub', user: 'Charlie Davis', time: '3d ago' }
];
