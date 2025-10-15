import { Div, H2, Header, Img, P, Span, UseParent } from "@base-framework/atoms";
import { Atom, DateTime } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Avatar } from "@base-framework/ui/molecules";
import { ConversationModel } from "../../../../models/conversation-model.js";
import { ThreadComposer } from "./thread-composer.js";

/**
 * DateDivider
 *
 * Renders a date divider between messages.
 *
 * @param {string} date
 * @returns {object}
 */
const DateDivider = (date) =>
	Div({ class: "flex justify-center mt-4" }, [
		Span(
			{ class: "text-xs text-muted-foreground p-2" },
			DateTime.format('standard', date)
		)
	]);

/**
 * AttachmentIcon
 *
 * Returns appropriate icon/styling based on file type
 *
 * @param {string} ext
 * @returns {object}
 */
const AttachmentIcon = (ext) =>
{
	const iconClasses = "w-10 h-10 rounded flex items-center justify-center text-white font-semibold text-xs";
	const extUpper = ext?.toUpperCase() || '?';

	// Color coding by file type
	const colorMap = {
		pdf: 'bg-red-500',
		doc: 'bg-blue-500',
		docx: 'bg-blue-500',
		xls: 'bg-green-600',
		xlsx: 'bg-green-600',
		txt: 'bg-gray-500',
		csv: 'bg-green-500',
		zip: 'bg-purple-500',
		default: 'bg-gray-400'
	};

	const bgColor = colorMap[ext?.toLowerCase()] || colorMap.default;

	return Div({ class: `${iconClasses} ${bgColor}` }, extUpper);
};

/**
 * FileSize
 *
 * Format bytes to human readable size
 *
 * @param {number} bytes
 * @returns {string}
 */
const formatFileSize = (bytes) =>
{
	if (!bytes) return '';
	if (bytes < 1024) return bytes + ' B';
	if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
	return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * Attachment
 *
 * @param {object} att
 * @returns {object}
 */
const Attachment = (att) =>
{
	const isImage = att.fileType?.startsWith('image/');
	const filePath = `/files/client/conversation/${att.filePath}`;

	return Div({
		class: "group relative flex items-center gap-x-3 p-3 border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card",
		click: () => window.open(filePath, '_blank')
	}, [
		// Image preview or file type icon
		isImage
			? Div({ class: "relative" }, [
				Img({
					src: filePath,
					alt: att.fileName,
					class: "w-16 h-16 rounded object-cover border border-border"
				}),
				// Overlay on hover for images
				Div({ class: "absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-all" })
			])
			: AttachmentIcon(att.fileExtension),

		// File info
		Div({ class: "flex-1 min-w-0" }, [
			P({
				class: "text-sm font-medium truncate group-hover:text-primary transition-colors"
			}, att.displayName || att.fileName),
			Div({ class: "flex items-center gap-x-2 mt-1" }, [
				Span({
					class: "text-xs text-muted-foreground uppercase font-semibold"
				}, att.fileExtension || 'file'),
				att.fileSize && Span({
					class: "text-xs text-muted-foreground"
				}, formatFileSize(att.fileSize))
			])
		]),

		// Download indicator
		Div({
			class: "opacity-0 group-hover:opacity-100 transition-opacity"
		}, [
			Span({
				class: "text-xs text-muted-foreground"
			}, "↗")
		])
	]);
};

/**
 * Attachments
 *
 * @param {array} attachments
 * @returns {object}
 */
const Attachments = (attachments) =>
	Div({ class: "flex flex-col gap-y-2 mt-3" },
		attachments.map((att) =>
			Attachment(att)
		)
	);

/**
 * ConversationListItem
 *
 * Renders a single conversation entry with avatar, text, and attachments.
 *
 * @param {object} msg
 * @returns {object}
 */
const ConversationListItem = Atom((msg) =>
{
	const name = `${msg.firstName} ${msg.lastName}`;
	return Div({ class: "flex gap-x-3 px-6 py-4 hover:bg-muted/50" }, [
		Avatar({
			src: msg.image && `/files/users/profile/${msg.image}`,
			alt: name,
			fallbackText: name,
			size: "sm"
		}),
		Div({ class: "flex-1 gap-y-1" }, [
			P({ class: "text-sm font-medium" }, name),
			P({ class: "text-sm text-muted-foreground" }, msg.message),
			msg.attachments && msg.attachments.length > 0 &&
				Attachments(msg.attachments)
		])
	]);
});

/**
 * ConversationSection
 *
 * Displays conversation history and composer.
 *
 * @param {object} props
 * @param {object} props.client
 * @returns {object}
 */
export const ConversationSection = Atom(({ client }) =>
{
	const data = new ConversationModel({
		clientId: client.id,
		orderBy: {
			createdAt: 'desc'
		}
	});

	return Div({ class: "flex flex-auto flex-col max-h-screen gap-y-4 p-0 overflow-y-auto", cache: "listContainer" }, [
		Header({ class: "flex flex-col gap-y-2 p-6 bg-background/80 backdrop-blur-md sticky top-0 z-10" }, [
			H2({ class: "text-lg text-muted-foreground" }, "Conversation")
		]),
		Div({ class: "flex-1 gap-y-2" }, [
			UseParent((parent)=>
			{
				return ScrollableList({
					scrollDirection: 'up',
					data,
					cache: "list",
					key: "id",
					role: "list",
					class: "flex flex-col",
					limit: 25,
					divider: {
						skipFirst: true,
						itemProperty: "createdAt",
						layout: DateDivider,
						customCompare: (a, b) => DateTime.format('standard', a) !== DateTime.format('standard', b)
					},
					rowItem: ConversationListItem,
					scrollContainer: parent.listContainer
				});
			})
		]),
		new ThreadComposer({
			placeholder: "Add a comment...",
			client: client,
			submitCallBack: (parent) =>
			{
				const shouldScroll = true;
				parent.list.fetchNew(shouldScroll);
			}
		})
	]);
});
