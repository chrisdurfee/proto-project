import SummaryTablePage, { SummaryContainer, TableContainer } from "@pages/types/full/table/summary-table-page.js";
import { InvoiceTable } from "./invoice-table.js";
import { INVOICES } from "./invoices.js";
import { PageHeader } from "./page-header.js";
import { SummaryCards } from "./summary-cards.js";

/**
 * InvoicePage
 *
 * Page showing a client's invoice list.
 *
 * @returns {object} A SummaryTablePage component.
 */
export const InvoicePage = () =>
	SummaryTablePage({}, [
		PageHeader(),
		SummaryContainer([
			SummaryCards({ invoices: INVOICES }),
			TableContainer([
				InvoiceTable({ invoices: INVOICES })
			])
		])
	]);

export default InvoicePage;
