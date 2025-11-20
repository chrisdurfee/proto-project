import SummaryTablePage, { SummaryContainer, TableContainer } from "@pages/types/full/table/summary-table-page.js";
import { OrdersTable } from "./orders-table.js";
import { ORDERS } from "./orders.js";
import { PageHeader } from "./page-header.js";
import { SummaryCards } from "./summary-cards.js";

/**
 * OrdersPage
 *
 * Page showing a client's order list.
 *
 * @returns {object} A SummaryTablePage component.
 */
export const OrdersPage = () =>
	SummaryTablePage({}, [
		PageHeader(),
		SummaryContainer([
			SummaryCards({ orders: ORDERS }),
			TableContainer([
				OrdersTable({ orders: ORDERS })
			])
		])
	]);

export default OrdersPage;
