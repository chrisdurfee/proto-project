
/**
 * This will get the nav links.
 *
 * @return {Array<object>}
 */
export const Links = () => [
	{ label: 'Home', href: '/', icon: 'home', mobileOrder: 1, exact: true },
	{ label: 'Code', href: '/generator', icon: 'note_add', mobileOrder: 2 },
	{ label: 'Migrations', href: '/migrations', icon: 'layers', mobileOrder: 3 },
	{ label: 'Errors', href: '/errors', icon: 'bug_report', mobileOrder: 4 },
	{ label: 'Users', href: '/users', icon: 'group', mobileOrder: 5 },
	{ label: 'IAM', href: '/iam', icon: 'lock', mobileOrder: 6 },
	{ label: 'Docs', href: '/docs', icon: 'article', mobileOrder: 7 },
	{ label: 'Email', href: '/email', icon: 'alternate_email', mobileOrder: 8 },
];