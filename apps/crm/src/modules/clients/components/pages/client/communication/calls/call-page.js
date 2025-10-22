import { Div, UseParent } from "@base-framework/atoms";
import { BlankPage } from "@base-framework/ui";
import { ClientCallModel } from "../../../../models/client-call-model.js";
import { CallList } from "./call-list.js";
import { PageHeader } from "./page-header.js";

/**
 * CallPage
 *
 * Page showing a client's call list.
 *
 * @returns {object} A Page component.
 */
export const CallPage = () =>
{
	const data = new ClientCallModel(
	{
		clientId: null,
		loaded: false,
		calls: []
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
				CallList({ data })
			]);
		})
	]);
};

export default CallPage;
