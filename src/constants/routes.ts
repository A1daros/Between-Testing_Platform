export const ROUTES = {
  home: '/',
  aboutSchool: '/about-school',
  placementTest: '/placement-test',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  updatePassword: '/update-password',
  awaitingApproval: '/awaiting-approval',

  tests: '/tests',
  testsByLevel: '/tests/level/:levelId',
  quiz: '/tests/:testId',
  testResult: '/tests/:testId/results',

  myResults: '/my-results',
  myResultDetails: '/my-results/:resultId',

  profile: '/profile/:userId',

  admin: '/admin',
  adminWildcard: '/admin/*',

  notFound: '*',
} as const;

export const ADMIN_ROUTES = {
  overview: 'overview',
  tests: 'tests',
  testCreate: 'tests/create',
  testEdit: 'tests/:testId/edit',
  results: 'results',
  resultDetails: 'results/result-details/:resultId',
  students: 'students',
  studentDetails: 'students/student-details/:studentId',
} as const;

// Anchor of the contact form section on the home page.
export const CONTACTS_SECTION_ID = 'contacts';
