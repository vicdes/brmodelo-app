import AddButton from "@components/AddButton/AddButton";
import ConfirmPolyglotModeling from "@components/PolyglotModals/ConfirmPolyglotModeling";
import ConceptualSidebar from "@pages/conceptual/sidebar/ConceptualSidebar";
import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import loadingDots from "../../../img/loading-dots.gif";
import Feedback, { useFeedback } from "../../components/Feedback";
import { ConceptualIcon } from "../../components/Icons";
import PanelTools from "../../components/PanelTools";
import { savePolyglotModelingVisualize } from "../../services/modelStore";
import {
	polyglotColors,
	PolyglotDatabase,
	polyglotFontColor,
} from "../../services/types/model";
import { formatDate } from "../../utils/formatDate";
import { IConceptualEditor } from "../conceptual/IConceptualEditor";
import ConceptualEditor from "../conceptual/conceptualEditor";
import { polyglotModels } from "./polyglotMocks";

interface ModelInstance {
	id: string;
	name: string;
	type: string;
	updatedAt: string;
}

interface SelectedElement {
	value: any;
	type: string;
	element: any;
	nfr?: string;
	workload?: string;
}

type DatabaseType = ["polyglot"];

type PolyglotEntry = { databases: DatabaseType[] };
type PolyglotMap = Record<string, PolyglotEntry>;

interface PolyglotPageProps {
	modelId: string;
	onLoadModel: (modelId: string) => Promise<any>;
	onSaveModel: (model: any) => Promise<void>;
	onNavigateToWorkspace: () => void;
	onConvert: (model: any, editor: any) => Promise<void>;
	onEditorReady?: (editor: IConceptualEditor | null) => void;
}

const BLANK_SELECTION: SelectedElement = {
	value: "",
	type: "blank",
	element: null,
	nfr: "",
	workload: "",
};

const enrichSelectedElement = (element: SelectedElement): SelectedElement => {
	if (!element.element?.model?.attributes) return element;

	const attributes = element.element.model.attributes;

	if (element.type === "Link") {
		const labels = attributes.labels;
		return {
			...element,
			value: {
				weak: attributes.weak,
				role: attributes.role,
				cardinality: (labels && labels[0] && labels[0].attrs?.text?.text) || "",
			},
		};
	}

	if (element.type === "Attribute") {
		return {
			...element,
			value: {
				name: attributes.attrs?.text?.text?.replace(/ *\([^)]*\) */g, "") || "",
				cardinality: attributes.cardinality,
				composed: attributes.composed,
			},
		};
	}

	if (element.type === "Note") {
		return {
			...element,
			value: attributes.attrs?.text?.text?.replace(/ *\([^)]*\) */g, "") || "",
		};
	}

	return element;
};

const PolyglotPage: React.FC<PolyglotPageProps> = React.memo(
	({
		modelId,
		onLoadModel,
		onSaveModel,
		onNavigateToWorkspace,
		onConvert,
		onEditorReady,
	}) => {
		const { t } = useTranslation(["common"]);
		const [loading, setLoading] = useState(true);
		const [model, setModel] = useState<ModelInstance>({
			id: "",
			name: "",
			type: "polyglot",
			updatedAt: "",
		});
		const { feedback, showFeedback, hideFeedback } = useFeedback();
		const [selectedElement, setSelectedElement] =
			useState<SelectedElement>(BLANK_SELECTION);
		const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
		const [buttons, setButtons] = useState<ElementButton[]>([]);
		const [sidebarVisible, setSidebarVisible] = useState(false);
		const [shapePaletteVisible, setShapePaletteVisible] = useState(false);
		const [polyglotColorLegend, setPolyglotColorLegend] = useState(true);
		const [databases, setDatabases] = useState<PolyglotDatabase[]>([]);
		const [openButtonId, setOpenButtonId] = useState<string | null>(null);
		const [confirmModalOpen, setConfirmModalOpen] = useState(false);
		const [currentHoverElement, setCurrentHoverElement] = useState<
			string | null
		>(null);
		const [hoveredLegend, setHoveredLegend] = useState<string[]>([]);
		const [allDatabases, setAllDatabases] = useState<PolyglotDatabase[]>();

		const toggleShapePalette = useCallback(
			() => setShapePaletteVisible((prev) => !prev),
			[],
		);
		const toggleSidebar = useCallback(
			() => setSidebarVisible((prev) => !prev),
			[],
		);

		const togglePolyglotColorLegend = useCallback(
			() => setPolyglotColorLegend((prev) => !prev),
			[],
		);
		const buttonRefs = useRef<Map<string, HTMLDivElement>>(new Map());
		const polyglotRef = useRef<PolyglotMap>({});
		const editorRef = useRef<IConceptualEditor | null>(null);
		const contentRef = useRef<HTMLElement>(null);
		const modelRef = useRef<any>(null);
		const selectedElementRef = useRef<SelectedElement>(BLANK_SELECTION);
		const isSavingRef = useRef(false);
		const tooltipRef = useRef<HTMLDivElement>(null);
		const hoverIdRef = useRef<string | null>(null);

		const BTN_MAX_SIZE = 35;
		const MAX_SCALE = 2;
		const MIN_BTN_SIZE = 20;

		interface ElementButton {
			id: string;
			type: string;
			x: number;
			y: number;
		}

		const orderedButtons = useMemo(
			() =>
				openButtonId
					? [
							...buttons.filter((b) => b.id !== openButtonId),
							...buttons.filter((b) => b.id === openButtonId),
						]
					: buttons,
			[buttons, openButtonId],
		);

		const handleGetCell = useCallback((id: string | null) => {
			const editor = editorRef.current;
			if (!editor || !id) return null;
			return editor.graph.getCell(id) ?? null;
		}, []);

		const handleHighlightElement = (database: PolyglotDatabase) => {
			if (!allDatabases) return;
			const ids = allDatabases
				.filter((db) => db.name === database.name)
				.map((db) => String(db.elementId));
			setHoveredLegend(ids);
		};

		const updateTooltip = useCallback(() => {
			const editor: any = editorRef.current;
			const node = tooltipRef.current;
			const id = hoverIdRef.current;
			if (!editor?.paper || !node || !id) return;

			const cell = editor.graph.getCell(id);
			if (!cell) return;

			const bbox = cell.getBBox();
			const p = editor.paper.localToClientPoint(
				bbox.x + bbox.width / 2,
				bbox.y,
			);

			node.style.transform = `translate(${p.x}px, ${p.y - 8}px) translate(-50%, -100%)`;
		}, []);

		useLayoutEffect(() => {
			updateTooltip();
		}, [currentHoverElement, updateTooltip]);

		useLayoutEffect(() => {
			updateTooltip();
		}, [currentHoverElement, updateTooltip]);

		const updateButtons = useCallback(() => {
			const editor: any = editorRef.current;
			if (!editor?.graph || !editor?.paper || !contentRef.current) {
				setButtons((prev) => (prev.length ? [] : prev));
				return;
			}

			const areaRect = contentRef.current.getBoundingClientRect();
			const elements = editor.graph
				.getElements()
				.filter(
					(el: any) =>
						el.attributes.supertype !== "Note" &&
						!editor.shapeValidator?.isBlockAssociative(el),
				);

			interface Anchor {
				ax: number;
				ay: number;
				dx: number;
				dy: number;
			}

			const DEFAULT_ANCHOR: Anchor = { ax: 1, ay: 0, dx: 0, dy: 0 };

			const ANCHORS: Record<string, Anchor> = {
				Entity: { ax: 0.85, ay: 0, dx: 0, dy: 0 },
				Relationship: { ax: 0.75, ay: 0.25, dx: 0, dy: 0 },
				Attribute: { ax: 0.65, ay: 0.5, dx: 3, dy: 0 },
			};

			const scale = editor.paper.scale().sx;
			const btnScale = Math.max(MIN_BTN_SIZE / BTN_MAX_SIZE, scale / MAX_SCALE);

			elements.forEach((el: any) => {
				const node = buttonRefs.current.get(String(el.id));
				if (!node) return;

				const bbox = el.getBBox();
				const anchor = ANCHORS[el.attributes.supertype] ?? DEFAULT_ANCHOR;

				const p = editor.paper.localToClientPoint(
					bbox.x + bbox.width * anchor.ax,
					bbox.y + bbox.height * anchor.ay,
				);

				const visible =
					p.x >= areaRect.left &&
					p.x <= areaRect.right &&
					p.y >= areaRect.top &&
					p.y <= areaRect.bottom;

				node.style.display = visible ? "" : "none";

				node.style.transform = `translate(${p.x + anchor.dx * scale - BTN_MAX_SIZE / 2}px, ${p.y + anchor.dy * scale - BTN_MAX_SIZE / 2}px) scale(${btnScale})`;
			});

			const nextIds = elements.map((el: any) => String(el.id));
			setButtons((prev) => {
				const same =
					prev.length === nextIds.length &&
					prev.every((b, i) => b.id === nextIds[i]);
				return same
					? prev
					: elements.map((el: any) => ({
							id: String(el.id),
							type: el.attributes.supertype,
						}));
			});
		}, []);

		useLayoutEffect(() => {
			updateButtons();
		}, [buttons, openButtonId, updateButtons]);

		const handleSave = useCallback(async () => {
			const editor = editorRef.current;
			if (!editor || !modelRef.current || isSavingRef.current) return;
			const polyglot = Object.fromEntries(
				Object.entries(polyglotRef.current).filter(([id]) =>
					editor.graph.getCell(id),
				),
			);

			setLoading(true);

			const modelToSave = {
				...modelRef.current,
				model: JSON.stringify({ ...editor.graph.toJSON(), polyglot }),
			};

			if (!editor.dirty) {
				showFeedback("Successfully saved!", true);
				setLoading(false);
				return;
			}

			isSavingRef.current = true;
			try {
				await onSaveModel(modelToSave);
				setLastSavedAt(new Date());
				showFeedback("Successfully saved!", true);
				editor.setDirty(false);
			} catch (error) {
				console.error("Error saving model:", error);
				showFeedback("Failed to save model", true, "error");
			} finally {
				isSavingRef.current = false;
				setLoading(false);
			}
		}, [onSaveModel, showFeedback]);

		const handleElementUpdate = useCallback(
			(elementId: string, type: "nfr" | "workload", value: string[]) => {
				const editor: IConceptualEditor | null = editorRef.current;
				if (!editor) return;

				const cell = editor.graph.getCell(elementId);
				if (!cell) return;
				cell.set(type, value);
				editor.setDirty(true);

				const current = selectedElementRef.current;
				if (current.element?.model?.id === elementId) {
					const updated = { ...current, [type]: value };
					selectedElementRef.current = updated;
					setSelectedElement(updated);
				}
			},
			[],
		);

		const handleUpdate = useCallback((event: { type: string; value?: any }) => {
			const editor = editorRef.current;
			const current = selectedElementRef.current;
			if (!editor) return;

			editor.onUpdate(event, current);
		}, []);

		const toolsController = useMemo(
			() => ({
				zoomIn: { active: true, action: () => editorRef.current?.zoomIn() },
				zoomOut: { active: true, action: () => editorRef.current?.zoomOut() },
				zoomNone: { active: true, action: () => editorRef.current?.zoomNone() },
				undo: { active: true, action: () => editorRef.current?.undo() },
				redo: { active: true, action: () => editorRef.current?.redo() },
				print: { active: true, action: () => editorRef.current?.print() },
				convert: {
					active: true,
					action: () => {
						if (modelRef.current && editorRef.current)
							onConvert(modelRef.current, editorRef.current);
					},
				},
				setGrid: {
					active: true,
					action: (showDotGrid: boolean) =>
						editorRef.current?.setGrid(showDotGrid),
				},
				setGridSize: {
					active: true,
					action: (gridSize: number) =>
						editorRef.current?.setGridSize(gridSize),
				},
				setSnaplines: {
					active: true,
					action: (showSnaplines: boolean) =>
						editorRef.current?.setSnaplines(showSnaplines),
				},
				setPageBreaks: {
					active: true,
					action: (showPageBreaks: boolean) =>
						editorRef.current?.setPageBreaks(showPageBreaks),
				},
			}),
			[onConvert],
		);

		const applyPolyglotColors = useCallback((dbs: PolyglotDatabase[]) => {
			const graph = editorRef.current?.graph;
			if (!graph) return;

			setAllDatabases(dbs);
			
			const noRepeatedDbs = Array.from(
				new Map(dbs.map((db) => [db.name, db])).values(),
			);
			setDatabases(noRepeatedDbs);

			graph.startBatch("polyglot-colors");

			try {
				dbs.forEach((db) => {
					const cell: any = graph.getCell(db.elementId);
					cell?.setColor?.(polyglotColors[db.name]);
					cell.attr(".outer/stroke", "none");
					cell.attr(".outer/filter", {
						name: "dropShadow",
						args: { dx: 2, dy: 2, blur: 7, color: "rgba(0,0,0,0.4)" },
					});
					if (cell?.get("supertype") !== "Attribute") {
						cell?.attr("text/fill", polyglotFontColor[db.name]);
					}
				});
			} finally {
				graph.stopBatch("polyglot-colors");
			}
		}, []);

		const handleModeling = async () => {
			const editor = editorRef.current;
			if (!editor || !modelRef.current) return;

			setLoading(true);

			const elements = editor.graph.getElements();

			// modificar após implementação de heurísticas
			const dbs: PolyglotDatabase[] = polyglotModels.map((db, index) => ({
				...db,
				elementId: elements[index]?.id,
			}));
			const cols: string[] = dbs.map((db) => polyglotColors[db.name]);

			if (dbs.length !== 0 && cols.length !== 0) {
				await savePolyglotModelingVisualize({
					id: modelRef.current.id,
					name: modelRef.current.name,
					type: modelRef.current.type,
					model: JSON.stringify(editor.graph.toJSON()),
					polyglotDatabases: dbs,
				});
			}

			applyPolyglotColors(dbs);

			setLoading(false);
		};

		useEffect(() => {
			const editor: any = editorRef.current;
			if (!editor?.graph || !editor?.paper) return;

			const ids = new Set(hoveredLegend);

			editor.graph.getElements().forEach((el: any) => {
				const view = editor.paper.findViewByModel(el);
				if (!view) return;

				const highlighted = ids.has(String(el.id));
				view.el.style.filter = highlighted
					? "drop-shadow(0 0 6px rgb(0, 153, 128))"
					: "";
			});
		}, [hoveredLegend]);

		useEffect(() => {
			if (!contentRef.current) return;

			const customActions = {
				selectElement: (element: any) => {
					const enriched = enrichSelectedElement({
						value: element.value,
						type: element.type,
						element: element.element,
					});
					selectedElementRef.current = enriched;
					setSelectedElement(enriched);
				},
				saveModel: () => {
					handleSave();
				},
				closeFeedback: () => {
					hideFeedback();
				},
				unselectAll: () => {
					hideFeedback();
					selectedElementRef.current = BLANK_SELECTION;
					setSelectedElement(BLANK_SELECTION);
				},
			};

			const editor = new ConceptualEditor(
				document,
				contentRef.current,
				customActions,
			) as unknown as IConceptualEditor;
			editorRef.current = editor;
			onEditorReady?.(editor);

			const handleElementEnter = (elementView: any) => {
				const cell = elementView.model;
				hoverIdRef.current = String(cell.id);
				setCurrentHoverElement(String(cell.id));
			};

			const handleElementLeave = () => {
				hoverIdRef.current = null;
				setCurrentHoverElement(null);
			};

			const GRAPH_EVENTS = "add remove reset change:position change:size";
			const anyEditor: IConceptualEditor | null = editor;
			anyEditor.graph.on("add remove reset", updateButtons);

			anyEditor.paper.on("translate scale resize render:done", updateButtons);
			anyEditor.graph.on(GRAPH_EVENTS, updateTooltip);
			anyEditor.paper.on("element:mouseenter", handleElementEnter);
			anyEditor.paper.on("element:mouseleave", handleElementLeave);
			anyEditor.paper.on("translate scale resize render:done", updateTooltip);
			window.addEventListener("scroll", updateTooltip, true);
			window.addEventListener("resize", updateTooltip);

			window.addEventListener("scroll", updateButtons, true);

			window.addEventListener("resize", updateButtons);

			const loadModel = async () => {
				setLoading(true);
				try {
					const response = await onLoadModel(modelId);
					const jsonModel =
						typeof response.model === "string"
							? JSON.parse(response.model)
							: response.model;

					const loadedModel = {
						...response,
						id: response._id,
						model: jsonModel,
					};
					modelRef.current = loadedModel;

					setModel({
						id: response._id,
						name: response.name,
						type: response.type,
						updatedAt: response.updated,
					});

					setLastSavedAt(new Date(response.updated));
					setLoading(false);

					editor.loadModel(jsonModel);

					if (
						modelRef.current.polyglotDatabases &&
						modelRef.current.polyglotDatabases.length !== 0
					) {
						applyPolyglotColors(modelRef.current.polyglotDatabases);
					}
				} catch (error) {
					setLoading(false);
					if (error === "404") {
						onNavigateToWorkspace();
					} else {
						console.error(error);
						showFeedback("Failed to load model", true, "error");
					}
				}
			};

			if (modelId) {
				loadModel();
			} else {
				setLoading(false);
			}

			return () => {
				anyEditor.graph.off(
					"add remove reset change:position change:size change:attrs",
					updateButtons,
				);
				anyEditor.paper.off(
					"translate scale resize render:done",
					updateButtons,
				);
				window.removeEventListener("scroll", updateButtons, true);
				window.removeEventListener("resize", updateButtons);
				anyEditor.graph.off(GRAPH_EVENTS, updateTooltip);
				anyEditor.paper.off("element:mouseenter", handleElementEnter);
				anyEditor.paper.off("element:mouseleave", handleElementLeave);
				anyEditor.paper.off(
					"translate scale resize render:done",
					updateTooltip,
				);
				window.removeEventListener("scroll", updateTooltip, true);
				window.removeEventListener("resize", updateTooltip);

				onEditorReady?.(null);
				if (editorRef.current) {
					editorRef.current.destroy();
				}
			};
		}, [
			modelId,
			onLoadModel,
			onNavigateToWorkspace,
			showFeedback,
			hideFeedback,
			onEditorReady,
			handleSave,
		]);

		const elementDatabase =
			allDatabases &&
			allDatabases.find((db) => String(db.elementId) === currentHoverElement);

		return (
			<div>
				<section className="modelWorkspace">
					<header className="modelWorkspace-header">
						<button
							className="navigation-back"
							aria-label="back to Model list"
							onClick={onNavigateToWorkspace}
						>
							<svg
								width="14"
								height="10"
								viewBox="0 0 14 10"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M14 5C14 4.72386 13.7761 4.5 13.5 4.5L1.70711 4.5L4.85355 1.35355C5.04882 1.15829 5.04882 0.841708 4.85355 0.646446C4.65829 0.451183 4.34171 0.451183 4.14645 0.646446L0.146446 4.64645C-0.0488157 4.84171 -0.0488157 5.15829 0.146446 5.35355L4.14645 9.35355C4.34171 9.54882 4.65829 9.54882 4.85355 9.35355C5.04882 9.15829 5.04882 8.84171 4.85355 8.64645L1.70711 5.5L13.5 5.5C13.7761 5.5 14 5.27614 14 5Z"
									fill="#333333"
								/>
							</svg>
						</button>
						<div className="document-info">
							<h2>
								<ConceptualIcon />
								<span>{model.name}</span>
							</h2>
							{lastSavedAt != null && (
								<div className="status-bar">
									<span>
										{t("Last saved")}: {formatDate(lastSavedAt)}
									</span>
								</div>
							)}
						</div>
						<aside className="header-actions">
							<button
								type="button"
								className="br-button"
								onClick={handleSave}
								title={t("Save (CTRL S)")}
							>
								{t("Save")}
							</button>
						</aside>
						<img
							src={loadingDots}
							alt="Loading"
							className={`br-loader fixed ${loading ? "loading" : ""}`}
						/>
					</header>

					<Feedback
						message={feedback.message}
						showing={feedback.showing}
						type={feedback.type}
						onClose={hideFeedback}
					/>

					<PanelTools toolsController={toolsController} />
					<section id="content" className="pseudo-canvas" ref={contentRef}>
						<section>
							<button
								className="polyglot-button"
								onClick={() => setConfirmModalOpen(true)}
							>
								{t("Create polyglot modeling")}
							</button>
							<ConfirmPolyglotModeling
								open={confirmModalOpen}
								onClose={() => setConfirmModalOpen(false)}
								onConfirm={handleModeling}
							/>
						</section>
						<div
							style={{
								position: "absolute",
								top: "19px",
								left: "19px",
								zIndex: 1,
							}}
						>
							{databases.length > 0 && (
								<aside
									className={`polyglotPanel floatingPanel${polyglotColorLegend ? " open" : ""}`}
								>
									<button
										className="toggle-visibility"
										onClick={togglePolyglotColorLegend}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="20"
											height="20"
											fill="none"
										>
											<path
												fill="#fff"
												fillRule="evenodd"
												d="M4.558 14.817c.244.244.64.244.884 0L10 10.259l4.558 4.558a.625.625 0 1 0 .884-.884l-5-5a.625.625 0 0 0-.884 0l-5 5a.625.625 0 0 0 0 .884ZM3 6.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 0-1h-13a.5.5 0 0 0-.5.5Z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
									<div className="properties-content" style={{ padding: "0" }}>
										{databases.map((database, index) => (
											<div
												key={index}
												className="polyglot-color-item"
												onMouseEnter={() => handleHighlightElement(database)}
												onMouseLeave={() => setHoveredLegend([])}
											>
												<div
													className="color-circle"
													style={{
														backgroundColor: polyglotColors[database.name],
													}}
												/>
												<span>{t(database.name)}</span>
											</div>
										))}
									</div>
								</aside>
							)}
							<section
								className={`elements-panel floatingPanel${shapePaletteVisible ? " open" : ""}`}
								id="shape-palette"
								style={{
									position: "relative",
									width: "140px",
								}}
							>
								<button
									type="button"
									className="toggle-visibility"
									onClick={toggleShapePalette}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										fill="none"
									>
										<path
											fill="#fff"
											fillRule="evenodd"
											d="M4.558 14.817c.244.244.64.244.884 0L10 10.259l4.558 4.558a.625.625 0 1 0 .884-.884l-5-5a.625.625 0 0 0-.884 0l-5 5a.625.625 0 0 0 0 .884ZM3 6.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 0-1h-13a.5.5 0 0 0-.5.5Z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</section>
						</div>
						<ConceptualSidebar
							selectedElement={selectedElement}
							onUpdate={handleUpdate}
							visible={sidebarVisible}
							onToggleVisible={toggleSidebar}
							style={{
								top: "80px",
								right: "20px",
							}}
						/>
					</section>
				</section>
				<>
					{orderedButtons.map((b) => (
						<>
							<div
								key={b.id}
								ref={(node) => {
									if (node) buttonRefs.current.set(b.id, node);
									else buttonRefs.current.delete(b.id);
								}}
								style={{
									position: "fixed",
									left: 0,
									top: 0,
									width: BTN_MAX_SIZE,
									height: BTN_MAX_SIZE,
								}}
							>
								<AddButton
									onOpenChange={(open) =>
										setOpenButtonId((prev) =>
											open ? b.id : prev === b.id ? null : prev,
										)
									}
									isEdit={
										handleGetCell(b.id).get("workload").length > 0 ||
										handleGetCell(b.id).get("nfr").length > 0
									}
									selectedValue={handleGetCell(b.id)}
									onSelect={(type, value) =>
										openButtonId &&
										handleElementUpdate(openButtonId, type, value)
									}
								/>
							</div>
						</>
					))}

					{currentHoverElement && elementDatabase && (
						<div
							ref={tooltipRef}
							style={{
								position: "fixed",
								left: 0,
								top: 0,
								zIndex: 9999,
								pointerEvents: "none",
							}}
						>
							<div
								style={{
									background: "white",
									color: "black",
									padding: "4px 8px",
									borderRadius: 4,
									filter: "drop-shadow(gray 2px 2px 4px)",
									whiteSpace: "nowrap",
								}}
							>
								{t(elementDatabase.name)}
							</div>
						</div>
					)}
				</>
			</div>
		);
	},
);

PolyglotPage.displayName = "PolyglotPage";

export default PolyglotPage;
