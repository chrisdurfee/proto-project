import { Div, UseParent } from "@base-framework/atoms";
import { BlankPage } from "@base-framework/ui";
import { ClientNoteModel } from "../../../../models/client-note-model.js";
import { NoteList } from "./note-list.js";
import { PageHeader } from "./page-header.js";

/**
 * NotesPage
 *
 * Page showing a client's notes list.
 *
 * @returns {object} A Page component.
 */
export const NotesPage = () =>
{
	const data = new ClientNoteModel(
	{
		clientId: null,
		loaded: false,
		notes: []
	});

	/**
	 * @type {object} props
	 */
	const props =
	{
		class: 'pt-0',
		data,
	};

	return new BlankPage(props, [
		UseParent(({ route }) =>
		{
			// @ts-ignore
			data.clientId = route.clientId;
			return Div({ class: "p-6 2xl:mx-auto w-full contained" }, [
				PageHeader(),
				NoteList({ data })
			]);
		})
	]);
};

export default NotesPage;
