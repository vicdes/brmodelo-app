import { useSelectConceptualModelModal } from "@pages/polyglot/useSelectConceptualModel";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCreateModelModal } from "../../components/CreateModelModal";
import { useDeleteModelModal } from "../../components/DeleteModelModal";
import { DropdownIcon, DropdownOption } from "../../components/DropdownIcon";
import { useFeedback } from "../../components/Feedback";
import { useRenameModelModal } from "../../components/RenameModelModal";
import { getAllModels } from "../../services/modelStore";
import { Model } from "../../services/types/model";
import WorkspacePage from "./WorkspacePage";

const LANGUAGE_OPTIONS: DropdownOption[] = [
	{ name: "Português (Brasil)", type: "lang:pt-BR" },
	{ name: "English", type: "lang:en" },
];

const WorkspacePageWrapper: React.FC = () => {
	const navigate = useNavigate();
	const deleteModelModal = useDeleteModelModal();
	const renameModelModal = useRenameModelModal();
	const createModelModal = useCreateModelModal();
	const { i18n } = useTranslation(["common"]);

	const [loading, setLoading] = useState(false);
	const [models, setModels] = useState<Model[]>([]);
	const { feedback, showFeedback, hideFeedback } = useFeedback();

	const selectConceptualModelModal = useSelectConceptualModelModal(models);
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
				showFeedback("Failed to load models. Please try again.", true, "error");
			});
	}, [showFeedback]);

	const handleOpenModel = (model: Model) => {
		navigate(`/${model.type}/${model._id}`);
	};

	const handleNewModel = () => {
		createModelModal
			.open()
			.then((result) => {
				if (result.model.type == "polyglot") {
					selectConceptualModelModal.open().then((selectedModel) => {
						handleOpenModel(selectedModel);
						setModels((prev) => [...prev, result.model]);
					});
				} else {
					setModels((prev) => [...prev, result.model]);
					showFeedback("Successfully created!", true, "success");
					handleOpenModel(result.model);
				}
			})
			.catch((reason) => {
				if ((reason as any)?.reason === "cancel") return;
				showFeedback(
					"Failed to create model. Please try again.",
					true,
					"error",
				);
			});
	};

	const handleRenameModel = (model: Model) => {
		renameModelModal
			.open(model._id, model.name)
			.then((result) => {
				setModels((prev) =>
					prev.map((m) =>
						m._id === result.modelId ? { ...m, name: result.newName } : m,
					),
				);
				showFeedback("Successfully renamed!", true, "success");
			})
			.catch((reason) => {
				if ((reason as any)?.reason === "cancel") return;
				showFeedback(
					"Failed to rename model. Please try again.",
					true,
					"error",
				);
			});
	};

	const handleDeleteModel = (model: Model) => {
		deleteModelModal
			.open(model._id)
			.then((result) => {
				setModels((prev) => prev.filter((m) => m._id !== result.modelId));
				showFeedback("Successfully deleted!", true, "success");
			})
			.catch((reason) => {
				if ((reason as any)?.reason === "cancel") return;
				showFeedback(
					"Failed to delete model. Please try again.",
					true,
					"error",
				);
			});
	};

	const handleMenuOptionSelected = (option: DropdownOption) => {
		if (option.type.startsWith("lang:")) {
			i18n.changeLanguage(option.type.slice("lang:".length));
		}
	};

	return (
		<WorkspacePage
			models={models}
			loading={loading}
			feedback={feedback}
			onCloseFeedback={hideFeedback}
			dropdownOptions={LANGUAGE_OPTIONS}
			onOpenModel={handleOpenModel}
			onNewModel={handleNewModel}
			onRenameModel={handleRenameModel}
			onDeleteModel={handleDeleteModel}
			onMenuOptionSelected={handleMenuOptionSelected}
			DropdownIconComponent={DropdownIcon}
		/>
	);
};

export default WorkspacePageWrapper;
