import DataPage, { ContentContainer } from "@pages/types/data/data-page.js";
import { ClientNoteModel } from "../../../../models/client-note-model.js";
import { NoteList } from "./note-list.js";
import { PageHeader } from "./page-header.js";

/**
 * NotesPage
 *
 * Page showing a client's notes list.
 *
 * @returns {object} A DataPage component.
 */
export const NotesPage = () =>
{
	const data = new ClientNoteModel(
	{
		clientId: null,
		loaded: false
	});

	return DataPage({ data }, ({ route }) =>
	{
		// @ts-ignore
		data.clientId = route.clientId;
		return ContentContainer([
			PageHeader(),
			NoteList({ data })
		]);
	});
};

export default NotesPage;
