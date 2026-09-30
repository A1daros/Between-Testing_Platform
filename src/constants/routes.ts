export const ROUTES = {
  home: '/',
  aboutSchool: '/about-school',
  placementTest: '/placement-test',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  updatePassword: '/update-password',

  tests: '/tests',
  testsByLevel: '/tests/level/:levelId',
  quiz: '/tests/:testId',
  testResult: '/tests/:testId/results',

  myResults: '/my-results',
  myResultDetails: '/my-results/:resultId',

  profile: '/profile/:userId',

  adminWildcard: '/admin/*',
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
