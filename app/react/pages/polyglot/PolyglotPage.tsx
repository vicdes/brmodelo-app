import AddButton from "@components/AddButton/AddButton";
import NfrModal from "@components/PolyglotModals/NfrModal";
import WorkloadModal from "@components/PolyglotModals/WorkloadModal";
import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import loadingDots from "../../../img/loading-dots.gif";
import Feedback, { useFeedback } from "../../components/Feedback";
import { ConceptualIcon } from "../../components/Icons";
import PanelTools from "../../components/PanelTools";
import { getAllModels } from "../../services/modelStore";
import { Model } from "../../services/types/model";
import { formatDate } from "../../utils/formatDate";
import { IConceptualEditor } from "../conceptual/IConceptualEditor";
import ConceptualEditor from "../conceptual/conceptualEditor";

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
		const [models, setModels] = useState<Model[]>([]);
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
		const buttonRefs = useRef<Map<string, HTMLDivElement>>(new Map());

		const editorRef = useRef<IConceptualEditor | null>(null);
		const contentRef = useRef<HTMLElement>(null);
		const modelRef = useRef<any>(null);
		const selectedElementRef = useRef<SelectedElement>(BLANK_SELECTION);
		const isSavingRef = useRef(false);

		const BTN_MAX_SIZE = 35;
		const MAX_SCALE = 2;
		const MIN_BTN_SIZE = 20;
		interface ElementButton {
			id: string;
			type: string;
			x: number;
			y: number;
		}

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
				ax: number; // 0 = esquerda, 0.5 = centro, 1 = direita
				ay: number; // 0 = topo, 0.5 = meio, 1 = base
				dx: number; // ajuste fino em px (positivo = direita)
				dy: number; // ajuste fino em px (positivo = baixo)
			}

			const DEFAULT_ANCHOR: Anchor = { ax: 1, ay: 0, dx: 0, dy: 0 };

			const ANCHORS: Record<string, Anchor> = {
				// canto superior direito
				Entity: { ax: 0.85, ay: 0, dx: 0, dy: 0 },
				// ponta direita do losango
				Relationship: { ax: 0.75, ay: 0.25, dx: 0, dy: 0 },
				// um pouco para fora do círculo, para não cobri-lo
				Attribute: { ax: 0.5, ay: 0.5, dx: 1, dy: 0 },
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
		}, [buttons, updateButtons]);

		const handleSave = useCallback(async () => {
			const editor = editorRef.current;
			if (!editor || !modelRef.current || isSavingRef.current) return;

			setLoading(true);

			const modelToSave = {
				...modelRef.current,
				model: JSON.stringify(editor.graph),
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

		const handleUpdate = useCallback((event: { type: string; value?: any }) => {
			const editor = editorRef.current;
			const current = selectedElementRef.current;
			if (!editor) return;

			if (event.type === "attribute.cardinality" && current.value) {
				current.value.cardinality = event.value;
			}
			if (event.type === "attribute.name" && current.value) {
				current.value.name = event.value;
			}
			if (event.type === "nfr" || event.type === "workload") {
				const updated = { ...current, [event.type]: event.value };
				selectedElementRef.current = updated;
				setSelectedElement(updated);
			}

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

		useEffect(() => {
			if (!contentRef.current) return;

			const customActions = {
				selectElement: (element: any) => {
					const enriched = enrichSelectedElement({
						value: element.value,
						type: element.type,
						element: element.element,
						nfr: element.nfr ?? "",
						workload: element.workload ?? "",
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

			const anyEditor: any = editor;
			anyEditor.graph.on("add remove reset", updateButtons);
			anyEditor.paper.on("translate scale resize render:done", updateButtons);
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
				} catch (error: any) {
					setLoading(false);
					if (error.status === 404) {
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

		useEffect(() => {
			setLoading(true);
			getAllModels()
				.then((data) => {
					setModels(data);
					setLoading(false);
				})
				.catch((error: unknown) => {
					console.error("Failed to load models:", error);
					setLoading(false);
					showFeedback(
						"Failed to load models. Please try again.",
						true,
						"error",
					);
				});
		}, [showFeedback]);

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
						<section className="elements-panel" id="shape-palette"></section>

						<section>
							<button className="polyglot-button">
								Criar modelagem poliglota
							</button>
						</section>
					</section>
				</section>
				{createPortal(
					<>
						{buttons.map((b) => (
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
									willChange: "transform",
								}}
							>
								<AddButton
									items={[
										{ name: "Carga de trabalho", component: WorkloadModal },
										{ name: "Requisito não funcional", component: NfrModal },
									]}
								/>
							</div>
						))}
					</>,
					document.body,
				)}
			</div>
		);
	},
);

PolyglotPage.displayName = "PolyglotPage";

export default PolyglotPage;
