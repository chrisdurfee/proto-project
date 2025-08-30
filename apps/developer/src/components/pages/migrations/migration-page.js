import ListPage, { ListContainer } from "@pages/types/list/list-page.js";
import { MigrationTable } from "./migration-table.js";
import { PageHeader } from "./page-header.js";

/**
 * @type {object}
 */
const Props = {};

/**
 * This will create the migration list page.
 *
 * @returns {object}
 */
export const MigrationPage = () => (
    ListPage(Props, [
        PageHeader(),
        ListContainer([
            MigrationTable()
        ])
    ])
);

export default MigrationPage;