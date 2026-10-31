import { ConceptualIcon } from "@components/Icons";
import { saveModel } from "@services/modelStore";
import { Model } from "@services/types/model";
import { t } from "i18next";
import React, { useState } from "react";
import Dialog from "../../components/Dialog";

export interface SelectConceptualModelProps {
	open: boolean;
	models: Model[];
	onSuccess: (model: Model) => void;
	onCancel: () => void;
}

const SelectConceptualModel: React.FC<SelectConceptualModelProps> = ({
	open,
	models,
	onSuccess,
	onCancel,
}) => {
	//const { t } = useTranslation(["common"]);
	const [openModal, setOpenModal] = React.useState<boolean>(open);
	const [selectedModel, setSelectedModel] = useState<Model>();

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	};

	const handleSave = async () => {
		if (selectedModel) {
			try {
				const savedModel = await saveModel({
					name: "testeSelecao",
					type: "polyglot",
					model: selectedModel.model,
				});
				onSuccess(savedModel);
			} catch (error) {
				console.error(error);
			}
		}
	};

	return (
		<div>
			<Dialog
				open={openModal}
				onOpenChange={setOpenModal}
				title="Selecione o modelo conceitual:"
				closeOnEscape
				closeOnOverlayClick
			>
				<table className="table table-hover" style={{ margin: "16px" }}>
					<tbody className="modelsList">
						{models.map((model) => (
							<tr key={model._id}>
								<td
									onClick={() => setSelectedModel(model)}
									className="listLine"
								>
									{model.type === "conceptual" && (
										<ConceptualIcon className="modelType" />
									)}
									<span>{model.type === "conceptual" && t("Conceptual")}</span>
								</td>
								<td
									onClick={() => {
										setSelectedModel(model);
									}}
								>
									<span>{model.name}</span>
								</td>
								<td onClick={() => setSelectedModel(model)}>
									{formatDate(model.created)}
								</td>
							</tr>
						))}
						<button
							onClick={() => {
								setOpenModal(false);
								handleSave();
							}}
						>
							Salvar
						</button>
					</tbody>
				</table>
			</Dialog>
		</div>
	);
};

export default SelectConceptualModel;
