import { Div } from "@base-framework/atoms";
import { ResourceCard } from "../atoms/resource-card.js";
import { GeneratorModal } from "../modals/generator-modal.js";

/**
 * GeneratorCards
 *
 * A section displaying the generator resource cards in a responsive grid.
 *
 * @returns {object}
 */
export const GeneratorCards = () =>
(
	Div({ class: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' }, [
		ResourceCard({
			title: 'Full Resource',
			click: () => GeneratorModal({
				resourceType: 'Full Resource'
			}),
			description: 'Create a full resource with all the necessary files.',
			icon: 'content_copy'
		}),
		ResourceCard({
			title: 'Module',
			click: () => GeneratorModal({
				resourceType: 'Module'
			}),
			description: 'Create a new module directory.',
			icon: 'content_copy'
		}),
		ResourceCard({
			title: 'Gateway',
			click: () => GeneratorModal({
				resourceType: 'Gateway'
			}),
			description: 'Create a module gateway.',
			icon: 'content_copy'
		}),
		ResourceCard({
			title: 'API',
			click: () => GeneratorModal({
				resourceType: 'API'
			}),
			description: 'Create an API.',
			icon: 'content_copy'
		}),
		ResourceCard({
			title: 'Controller',
			click: () => GeneratorModal({
				resourceType: 'Controller'
			}),
			description: 'Create a controller.',
			icon: 'content_copy'
		}),
		ResourceCard({
			title: 'Model',
			click: () => GeneratorModal({
				resourceType: 'Model'
			}),
			description: 'Create a model.',
			icon: 'content_copy'
		}),
		ResourceCard({
			title: 'Storage',
			click: () => GeneratorModal({
				resourceType: 'Storage'
			}),
			description: 'Create a storage.',
			icon: 'content_copy'
		}),
		ResourceCard({
			title: 'Policy',
			click: () => GeneratorModal({
				resourceType: 'Policy'
			}),
			description: 'Create a policy.',
			icon: 'content_copy'
		}),
		ResourceCard({
			title: 'Table',
			click: () => GeneratorModal({
				resourceType: 'Table'
			}),
			description: 'Create a database table.',
			icon: 'content_copy'
		}),
		ResourceCard({
			title: 'Migration',
			click: () => GeneratorModal({
				resourceType: 'Migration'
			}),
			description: 'Create a new migration.',
			icon: 'content_copy'
		}),
		ResourceCard({
			title: 'Unit Test',
			click: () => GeneratorModal({
				resourceType: 'Unit Test'
			}),
			description: 'Create a test.',
			icon: 'content_copy'
		})
	])
);

export default GeneratorCards;