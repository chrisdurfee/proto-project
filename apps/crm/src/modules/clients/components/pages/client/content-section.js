import { Div } from "@base-framework/atoms";

/**
 * Helper function to create a page that uses dynamic imports.
 *
 * @param {string} uri The URI (route) for this page
 * @param {Function} importCallback A function returning the dynamic import
 * @returns {object}
 */
const Page = (uri, importCallback) => ({
	uri,
	import: importCallback,
});

/**
 * This will create a dockable page.
 *
 * @returns {object}
 */
const ContentPage = () => (
	Div({
		class: 'flex flex-auto flex-col',
		switch: [
			Page(`/clients/:clientId/contacts/:contactId?`, () => import('./communication/contacts/contact-page.js')),
			Page(`/clients/:clientId/notes`, () => import('./communication/notes/notes-page.js')),
			Page(`/clients/:clientId/calls/:callId?`, () => import('./communication/calls/call-page.js')),
			Page(`/clients/:clientId/invoices/:invoiceId?`, () => import('./billing/invoices/invoice-page.js')),
			Page(`/clients/:clientId/payments/:paymentId?`, () => import('./billing/payments/payment-page.js')),
			Page(`/clients/:clientId/orders/:orderId?`, () => import('./billing/orders/orders-page.js')),
			Page(`/clients/:clientId*`, () => import('./summary/summary-page.js'))
		]
	})
);

/**
 * This will create the Content Section.
 *
 * @param {object} props
 * @returns {object}
 */
export const ContentSection = (props) => (
	Div({ class: 'flex flex-auto flex-col' }, [
		ContentPage()
	])
);